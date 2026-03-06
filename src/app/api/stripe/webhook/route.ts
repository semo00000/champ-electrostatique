/**
 * POST /api/stripe/webhook
 * Receives and verifies Stripe webhook events.
 * Updates Appwrite premium status ONLY from verified webhook events — never from client.
 *
 * Configure in Stripe Dashboard: https://dashboard.stripe.com/webhooks
 * Required events:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getServerDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID, Permission, Role } from "node-appwrite";

// Next.js App Router: disable body parsing so we can read the raw buffer
// needed by stripe.webhooks.constructEvent()
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are currently disabled." },
      { status: 503 }
    );
  }

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe signature or webhook secret" },
      { status: 400 }
    );
  }

  // Read raw body — required for signature verification
  let rawBody: Buffer;
  try {
    rawBody = Buffer.from(await req.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Could not read request body" }, { status: 400 });
  }

  // Verify the event came from Stripe (not forged)
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  const db = getServerDatabases();
  const stripe = getStripe();

  try {
    switch (event.type) {
      // ── Payment completed via Checkout ──────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planKey = session.metadata?.planKey ?? "monthly";

        if (!userId) {
          console.error("[Stripe Webhook] checkout.session.completed missing userId in metadata");
          break;
        }

        // Retrieve the full subscription to get the period end date
        let expiresAt: string | null = null;
        if (session.subscription) {
          // Cast to Stripe.Subscription since Response<T> wraps T in newer SDK versions
          const subscription = (await stripe.subscriptions.retrieve(
            session.subscription as string
          )) as unknown as Stripe.Subscription;
          const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end as number | undefined;
          expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
        }

        await upsertPayment(db, {
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          plan: planKey,
          status: "active",
          expiresAt,
        });

        console.log(`[Stripe Webhook] Premium activated for user ${userId} (plan: ${planKey})`);
        break;
      }

      // ── Subscription updated (renewal, plan change) ─────────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as unknown as Stripe.Subscription & { current_period_end?: number };
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const periodEnd = sub.current_period_end;
        const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
        const status = sub.status === "active" || sub.status === "trialing" ? "active" : "expired";

        await upsertPayment(db, {
          userId,
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          plan: sub.metadata?.planKey ?? "monthly",
          status,
          expiresAt,
        });

        console.log(`[Stripe Webhook] Subscription updated for user ${userId} — status: ${status}`);
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as unknown as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await upsertPayment(db, {
          userId,
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          plan: sub.metadata?.planKey ?? "monthly",
          status: "cancelled",
          expiresAt: null,
        });

        console.log(`[Stripe Webhook] Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        // Unhandled event — safe to ignore
        break;
    }
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface PaymentPayload {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: string;
  status: "active" | "expired" | "cancelled";
  expiresAt: string | null;
}

async function upsertPayment(
  db: ReturnType<typeof getServerDatabases>,
  payload: PaymentPayload
) {
  const { userId, ...rest } = payload;

  const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(1),
  ]);

  const data = {
    userId,
    ...rest,
    updatedAt: new Date().toISOString(),
  };

  if (existing.documents.length > 0) {
    await db.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      existing.documents[0].$id,
      data
    );
  } else {
    await db.createDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      ID.unique(),
      { ...data, createdAt: new Date().toISOString() },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.any()), // webhook uses admin key, not user session
      ]
    );
  }
}
