/**
 * GET /api/boss/status
 * Returns all boss fight statuses for the authenticated user.
 * userId is sourced from the verified Appwrite session.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/verify-session";
import { getServerDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { BOSS_FIGHTS } from "@/lib/boss/data";
import { getDefaultBossProgress } from "@/lib/boss";
import type { BossProgress } from "@/types/boss";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  // Verify session — userId comes from the token, never from query params
  let userId: string;
  try {
    const user = await requireSession();
    userId = user.$id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getServerDatabases();

    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.BOSS_PROGRESS, [
      Query.equal("userId", userId),
      Query.limit(50),
    ]);

    const progressMap = new Map<string, BossProgress>();
    for (const doc of res.documents) {
      progressMap.set(doc.bossId as string, {
        bossId: doc.bossId as string,
        userId: doc.userId as string,
        status: doc.status as BossProgress["status"],
        bestScore: (doc.bestScore as number) ?? null,
        bestScoreDate: (doc.bestScoreDate as string) ?? null,
        attempts: (doc.attempts as number) ?? 0,
        earnedRewards: JSON.parse((doc.earnedRewards as string) || "[]"),
      });
    }

    const statuses = BOSS_FIGHTS.map((boss) => ({
      bossId: boss.id,
      progress: progressMap.get(boss.id) ?? getDefaultBossProgress(boss.id, userId),
    }));

    return NextResponse.json({ statuses });
  } catch (err) {
    console.error("Boss status error:", err);
    return NextResponse.json({ error: "Failed to fetch boss status" }, { status: 500 });
  }
}
