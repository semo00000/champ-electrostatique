"use client";

import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, Permission, Role, ID } from "appwrite";
import type { TopicProgress, GamificationData, RankId } from "@/types/progress";

// ---------- Progress CRUD ----------

export async function fetchCloudProgress(
  userId: string
): Promise<Record<string, TopicProgress>> {
  const result: Record<string, TopicProgress> = {};
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROGRESS,
      [
        Query.equal("userId", userId),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    for (const doc of response.documents) {
      result[doc.topicKey as string] = {
        lessonRead: doc.lessonRead as boolean,
        quizScore: (doc.quizScore as number) ?? null,
        quizTotal: (doc.quizTotal as number) ?? null,
        lastVisit: (doc.lastVisit as number) ?? undefined,
        lastQuiz: (doc.lastQuiz as number) ?? undefined,
      };
    }

    if (response.documents.length < limit) break;
    offset += limit;
  }

  return result;
}

export async function pushProgressEntry(
  userId: string,
  topicKey: string,
  entry: TopicProgress
): Promise<void> {
  const existing = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PROGRESS,
    [
      Query.equal("userId", userId),
      Query.equal("topicKey", topicKey),
      Query.limit(1),
    ]
  );

  const data = {
    userId,
    topicKey,
    lessonRead: entry.lessonRead,
    quizScore: entry.quizScore ?? null,
    quizTotal: entry.quizTotal ?? null,
    lastVisit: entry.lastVisit ?? null,
    lastQuiz: entry.lastQuiz ?? null,
  };

  if (existing.documents.length > 0) {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROGRESS,
      existing.documents[0].$id,
      data
    );
  } else {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROGRESS,
      ID.unique(),
      data,
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
  }
}

// ---------- Gamification CRUD ----------

export async function fetchCloudGamification(
  userId: string
): Promise<GamificationData | null> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.GAMIFICATION,
    [Query.equal("userId", userId), Query.limit(1)]
  );

  if (response.documents.length === 0) return null;

  const doc = response.documents[0];
  return {
    xp: doc.xp as number,
    level: doc.level as number,
    streakDays: doc.streakDays as number,
    lastActiveDate: (doc.lastActiveDate as string) ?? null,
    activityMap: JSON.parse((doc.activityMap as string) || "{}"),
    bacCoins: (doc.bacCoins as number) ?? 0,
    streakFreezeCount: (doc.streakFreezeCount as number) ?? 0,
    streakFreezeUsedAt: (doc.streakFreezeUsedAt as string) ?? null,
    rank: (doc.rank as RankId) ?? "jid3_mouchtarak",
    schoolId: (doc.schoolId as string) ?? null,
    earnedRewards: JSON.parse((doc.earnedRewards as string) || "[]"),
  };
}

export async function pushGamification(
  userId: string,
  data: GamificationData
): Promise<void> {
  const existing = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.GAMIFICATION,
    [Query.equal("userId", userId), Query.limit(1)]
  );

  const payload = {
    userId,
    xp: data.xp,
    level: data.level,
    streakDays: data.streakDays,
    lastActiveDate: data.lastActiveDate,
    activityMap: JSON.stringify(data.activityMap),
    bacCoins: data.bacCoins ?? 0,
    streakFreezeCount: data.streakFreezeCount ?? 0,
    streakFreezeUsedAt: data.streakFreezeUsedAt ?? null,
    rank: data.rank ?? "jid3_mouchtarak",
    schoolId: data.schoolId ?? null,
    earnedRewards: JSON.stringify(data.earnedRewards ?? []),
  };

  if (existing.documents.length > 0) {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GAMIFICATION,
      existing.documents[0].$id,
      payload
    );
  } else {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GAMIFICATION,
      ID.unique(),
      payload,
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
  }
}

// ---------- Merge Strategies ----------

export function mergeProgress(
  local: Record<string, TopicProgress>,
  cloud: Record<string, TopicProgress>
): Record<string, TopicProgress> {
  const merged: Record<string, TopicProgress> = { ...cloud };

  for (const [key, localEntry] of Object.entries(local)) {
    const cloudEntry = merged[key];
    if (!cloudEntry) {
      merged[key] = localEntry;
    } else {
      const quizScore =
        localEntry.quizScore === null && cloudEntry.quizScore === null
          ? null
          : Math.max(localEntry.quizScore ?? 0, cloudEntry.quizScore ?? 0);

      merged[key] = {
        lessonRead: localEntry.lessonRead || cloudEntry.lessonRead,
        quizScore,
        quizTotal: localEntry.quizTotal ?? cloudEntry.quizTotal ?? null,
        lastVisit:
          Math.max(localEntry.lastVisit ?? 0, cloudEntry.lastVisit ?? 0) ||
          undefined,
        lastQuiz:
          Math.max(localEntry.lastQuiz ?? 0, cloudEntry.lastQuiz ?? 0) ||
          undefined,
      };
    }
  }

  return merged;
}

export function mergeGamification(
  local: GamificationData,
  cloud: GamificationData | null
): GamificationData {
  if (!cloud) return local;

  // Keep the version with higher XP (more progress)
  const winner = local.xp >= cloud.xp ? local : cloud;

  // Merge activity maps (keep max XP per day from either source)
  const mergedMap: Record<string, number> = { ...cloud.activityMap };
  for (const [date, xp] of Object.entries(local.activityMap)) {
    mergedMap[date] = Math.max(mergedMap[date] ?? 0, xp);
  }

  return {
    ...winner,
    activityMap: mergedMap,
    bacCoins: Math.max(local.bacCoins ?? 0, cloud.bacCoins ?? 0),
    streakFreezeCount: Math.max(local.streakFreezeCount ?? 0, cloud.streakFreezeCount ?? 0),
    streakFreezeUsedAt: local.streakFreezeUsedAt ?? cloud.streakFreezeUsedAt ?? null,
    rank: winner.rank ?? "jid3_mouchtarak",
    schoolId: local.schoolId ?? cloud.schoolId ?? null,
    earnedRewards: Array.from(new Set([...(local.earnedRewards ?? []), ...(cloud.earnedRewards ?? [])])),
  };
}
