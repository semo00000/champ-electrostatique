import { XP_PER_LEVEL, XP_LESSON_READ, XP_PER_QUIZ_POINT } from "@/types/progress";

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
