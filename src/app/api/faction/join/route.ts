/**
 * POST /api/faction/join
 * Body: { schoolId: string }
 * Creates or updates a user's faction membership.
 * userId is sourced from the verified Appwrite session — never trusted from the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/verify-session";
import { getServerDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID, Permission, Role } from "node-appwrite";
import { getSchool } from "@/lib/faction";

const JoinSchema = z.object({
  schoolId: z.string().min(1),
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
  let schoolId: string;
  try {
    const raw = await req.json();
    const parsed = JoinSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    schoolId = parsed.data.schoolId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {

    const school = getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: "Invalid schoolId" }, { status: 400 });
    }

    const db = getServerDatabases();

    // Check if membership already exists
    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.FACTION_SCORES, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);

    if (existing.documents.length > 0) {
      // Move to new school — reset weekly XP
      await db.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FACTION_SCORES,
        existing.documents[0].$id,
        { schoolId, weeklyXpContributed: 0, updatedAt: new Date().toISOString() }
      );
    } else {
      await db.createDocument(
        DATABASE_ID,
        COLLECTIONS.FACTION_SCORES,
        ID.unique(),
        {
          userId,
          schoolId,
          xpContributed: 0,
          weeklyXpContributed: 0,
          updatedAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(userId)),
        ]
      );
    }

    return NextResponse.json({ success: true, school });
  } catch (err) {
    console.error("Faction join error:", err);
    return NextResponse.json({ error: "Failed to join faction" }, { status: 500 });
  }
}
