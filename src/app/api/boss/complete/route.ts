/**
 * POST /api/boss/complete
 * Body: { bossId: string, score: number }
 * Records a boss fight completion.
 * userId is sourced from the verified Appwrite session — never trusted from the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/verify-session";
import { getServerDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID, Permission, Role } from "node-appwrite";
import { BOSS_FIGHTS } from "@/lib/boss/data";
import { getDefaultBossProgress, processBossCompletion } from "@/lib/boss";
import type { BossProgress } from "@/types/boss";

const BossCompleteSchema = z.object({
  bossId: z.string().min(1),
  score: z.number().int().nonnegative(),
});

export async function POST(req: NextRequest) {
  // 1. Verify session — userId comes from the token, not the body
  let userId: string;
  try {
    const user = await requireSession();
    userId = user.$id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body with zod
  let bossId: string;
  let score: number;
  try {
    const raw = await req.json();
    const parsed = BossCompleteSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    ({ bossId, score } = parsed.data);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {

    const boss = BOSS_FIGHTS.find((b) => b.id === bossId);
    if (!boss) {
      return NextResponse.json({ error: "Invalid bossId" }, { status: 400 });
    }

    if (score > boss.totalPoints) {
      return NextResponse.json({ error: "Score out of range" }, { status: 400 });
    }

    const db = getServerDatabases();

    // Fetch existing progress
    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.BOSS_PROGRESS, [
      Query.equal("userId", userId),
      Query.equal("bossId", bossId),
      Query.limit(1),
    ]);

    const currentProgress: BossProgress =
      existing.documents.length > 0
        ? {
            bossId: existing.documents[0].bossId as string,
            userId: existing.documents[0].userId as string,
            status: existing.documents[0].status as BossProgress["status"],
            bestScore: (existing.documents[0].bestScore as number) ?? null,
            bestScoreDate: (existing.documents[0].bestScoreDate as string) ?? null,
            attempts: (existing.documents[0].attempts as number) ?? 0,
            earnedRewards: JSON.parse((existing.documents[0].earnedRewards as string) || "[]"),
          }
        : getDefaultBossProgress(bossId, userId);

    const { updatedProgress, response } = processBossCompletion(boss, currentProgress, score);

    const payload = {
      userId,
      bossId,
      status: updatedProgress.status,
      bestScore: updatedProgress.bestScore,
      bestScoreDate: updatedProgress.bestScoreDate,
      attempts: updatedProgress.attempts,
      earnedRewards: JSON.stringify(updatedProgress.earnedRewards),
    };

    if (existing.documents.length > 0) {
      await db.updateDocument(
        DATABASE_ID,
        COLLECTIONS.BOSS_PROGRESS,
        existing.documents[0].$id,
        payload
      );
    } else {
      await db.createDocument(
        DATABASE_ID,
        COLLECTIONS.BOSS_PROGRESS,
        ID.unique(),
        payload,
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
        ]
      );
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("Boss complete error:", err);
    return NextResponse.json({ error: "Failed to record boss completion" }, { status: 500 });
  }
}
