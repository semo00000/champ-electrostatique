/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for premium subscription.
 * Requires an authenticated Appwrite session (verified via cookie).
 *
 * Body: { planKey: "monthly" | "yearly" }
 * Returns: { url: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/config/pricing";
import { requireSession } from "@/lib/auth/verify-session";

const CheckoutSchema = z.object({
  planKey: z.enum(["monthly", "yearly"]),
});

export async function POST(req: NextRequest) {
  // 1. Verify Appwrite session — userId comes from the verified token, NOT the body
  let user: Awaited<ReturnType<typeof requireSession>>;
  try {
    user = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate request body with zod
  let planKey: "monthly" | "yearly";
  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    planKey = parsed.data.planKey;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Get plan config
  const plan = PLANS[planKey];
  if (!plan || !plan.priceId) {
    return NextResponse.json({ error: "Invalid plan or missing price ID" }, { status: 400 });
  }

  // 4. Create Stripe Checkout Session
  try {
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      // Pass userId and planKey in metadata so the webhook can update Appwrite
      metadata: {
        userId: user.$id,
        planKey,
      },
      // Pre-fill customer email for better UX
      customer_email: user.email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Checkout Error]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
