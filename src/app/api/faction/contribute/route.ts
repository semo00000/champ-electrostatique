/**
 * POST /api/faction/contribute
 * Called when a user earns XP — contributes XP to their school's score.
 * Body: { xp: number }
 * userId is sourced from the verified Appwrite session — never trusted from the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/verify-session";
import { getServerDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";

const ContributeSchema = z.object({
  xp: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  // 1. Verify session
  let userId: string;
  try {
    const user = await requireSession();
    userId = user.$id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body with zod
  let xp: number;
  try {
    const raw = await req.json();
    const parsed = ContributeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    xp = parsed.data.xp;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {

    const db = getServerDatabases();

    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.FACTION_SCORES, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);

    if (existing.documents.length === 0) {
      // User hasn't joined a faction yet
      return NextResponse.json({ success: false, message: "User has no faction" });
    }

    const doc = existing.documents[0];
    await db.updateDocument(
      DATABASE_ID,
      COLLECTIONS.FACTION_SCORES,
      doc.$id,
      {
        xpContributed: ((doc.xpContributed as number) ?? 0) + xp,
        weeklyXpContributed: ((doc.weeklyXpContributed as number) ?? 0) + xp,
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Faction contribute error:", err);
    return NextResponse.json({ error: "Failed to contribute XP" }, { status: 500 });
  }
}
