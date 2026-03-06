import {
  XP_PER_LEVEL,
  XP_LESSON_READ,
  XP_PER_QUIZ_POINT,
  BACCOINS_PER_LESSON,
  BACCOINS_PER_QUIZ_POINT,
  BACCOINS_STREAK_FREEZE_COST,
  RANKS,
  type RankId,
} from "@/types/progress";

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpForCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
}

export function levelProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export function calculateLessonXP(): number {
  return XP_LESSON_READ;
}

export function calculateQuizXP(score: number, prevScore: number): number {
  const improvement = Math.max(0, score - prevScore);
  return improvement * XP_PER_QUIZ_POINT;
}

export function checkStreak(
  lastActiveDate: string | null,
  today: string
): { streakDays: number; isNewDay: boolean } {
  if (!lastActiveDate) {
    return { streakDays: 1, isNewDay: true };
  }

  if (lastActiveDate === today) {
    return { streakDays: 0, isNewDay: false }; // Same day, no change
  }

  const last = new Date(lastActiveDate);
  const now = new Date(today);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streakDays: 1, isNewDay: true }; // Consecutive day, increment
  }

  return { streakDays: -(diffDays - 1), isNewDay: true }; // Gap, reset streak
}

// ── BacCoins ──────────────────────────────────────────────────────────────────

export function calculateLessonBacCoins(): number {
  return BACCOINS_PER_LESSON;
}

export function calculateQuizBacCoins(score: number, prevScore: number): number {
  const improvement = Math.max(0, score - prevScore);
  return improvement * BACCOINS_PER_QUIZ_POINT;
}

export function canBuyStreakFreeze(bacCoins: number): boolean {
  return bacCoins >= BACCOINS_STREAK_FREEZE_COST;
}

export function spendStreakFreeze(bacCoins: number): number {
  return Math.max(0, bacCoins - BACCOINS_STREAK_FREEZE_COST);
}

// ── Rank ──────────────────────────────────────────────────────────────────────

export function calculateRank(xp: number): RankId {
  const sorted = [...RANKS].sort((a, b) => b.minXP - a.minXP);
  const match = sorted.find((r) => xp >= r.minXP);
  return match?.id ?? "jid3_mouchtarak";
}

export function getRankInfo(xp: number) {
  const id = calculateRank(xp);
  return RANKS.find((r) => r.id === id)!;
}

export function getNextRankInfo(xp: number) {
  const currentId = calculateRank(xp);
  const idx = RANKS.findIndex((r) => r.id === currentId);
  return RANKS[idx + 1] ?? null;
}

// ── Streak with freeze ────────────────────────────────────────────────────────

export function checkStreakWithFreeze(
  lastActiveDate: string | null,
  today: string,
  streakFreezeCount: number,
  streakFreezeUsedAt: string | null
): {
  streakDays: number;
  isNewDay: boolean;
  usedFreeze: boolean;
  newFreezeCount: number;
  newFreezeUsedAt: string | null;
} {
  if (!lastActiveDate) {
    return { streakDays: 1, isNewDay: true, usedFreeze: false, newFreezeCount: streakFreezeCount, newFreezeUsedAt: streakFreezeUsedAt };
  }

  if (lastActiveDate === today) {
    return { streakDays: 0, isNewDay: false, usedFreeze: false, newFreezeCount: streakFreezeCount, newFreezeUsedAt: streakFreezeUsedAt };
  }

  const last = new Date(lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streakDays: 1, isNewDay: true, usedFreeze: false, newFreezeCount: streakFreezeCount, newFreezeUsedAt: streakFreezeUsedAt };
  }

  // Missed exactly 1 day and have a freeze and haven't used one this week
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const freezeUsedRecently = streakFreezeUsedAt && new Date(streakFreezeUsedAt) >= weekAgo;

  if (diffDays === 2 && streakFreezeCount > 0 && !freezeUsedRecently) {
    return {
      streakDays: 1, // streak preserved
      isNewDay: true,
      usedFreeze: true,
      newFreezeCount: streakFreezeCount - 1,
      newFreezeUsedAt: today,
    };
  }

  return { streakDays: -(diffDays - 1), isNewDay: true, usedFreeze: false, newFreezeCount: streakFreezeCount, newFreezeUsedAt: streakFreezeUsedAt };
}

