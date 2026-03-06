/**
 * GET /api/faction/leaderboard
 * Returns global and weekly school leaderboard.
 */

import { NextResponse } from "next/server";
import { getServerDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { buildLeaderboard } from "@/lib/faction";
import type { FactionLeaderboardResponse } from "@/types/faction";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const db = getServerDatabases();

    // Fetch all faction score records
    let offset = 0;
    const limit = 200;
    const allDocs: {
      schoolId: string;
      userId: string;
      xpContributed: number;
      weeklyXpContributed: number;
      updatedAt: string;
    }[] = [];

    while (true) {
      const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.FACTION_SCORES, [
        Query.limit(limit),
        Query.offset(offset),
      ]);

      for (const doc of res.documents) {
        allDocs.push({
          schoolId: doc.schoolId as string,
          userId: doc.userId as string,
          xpContributed: (doc.xpContributed as number) ?? 0,
          weeklyXpContributed: (doc.weeklyXpContributed as number) ?? 0,
          updatedAt: (doc.updatedAt as string) ?? doc.$createdAt,
        });
      }

      if (res.documents.length < limit) break;
      offset += limit;
    }

    // Aggregate by school
    const now = Date.now();
    const schoolAgg = new Map<
      string,
      { totalXP: number; weeklyXP: number; memberCount: number }
    >();

    for (const doc of allDocs) {
      const existing = schoolAgg.get(doc.schoolId) ?? { totalXP: 0, weeklyXP: 0, memberCount: 0 };
      const updatedAt = new Date(doc.updatedAt).getTime();
      const isThisWeek = now - updatedAt < ONE_WEEK_MS;

      schoolAgg.set(doc.schoolId, {
        totalXP: existing.totalXP + doc.xpContributed,
        weeklyXP: existing.weeklyXP + (isThisWeek ? doc.weeklyXpContributed : 0),
        memberCount: existing.memberCount + 1,
      });
    }

    const rawScores = [...schoolAgg.entries()].map(([schoolId, v]) => ({
      schoolId,
      ...v,
    }));

    const global = buildLeaderboard(rawScores);
    const weekly = buildLeaderboard(rawScores).sort((a, b) => b.weeklyXP - a.weeklyXP)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    // Group by city
    const byCity: Record<string, typeof global> = {};
    for (const entry of global) {
      const city = entry.school.city;
      if (!byCity[city]) byCity[city] = [];
      byCity[city].push(entry);
    }

    const response: FactionLeaderboardResponse = {
      global,
      weekly,
      byCity,
      lastUpdated: new Date().toISOString(),
      totalSchools: global.length,
      totalStudents: allDocs.length,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Faction leaderboard error:", err);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
