/**
 * Boss fight logic — requirement checking, completion, reward granting.
 */

import type {
  BossFight,
  BossProgress,
  BossWithProgress,
  BossCompleteResponse,
} from "@/types/boss";
import type { GamificationData } from "@/types/progress";
import type { TopicProgress } from "@/types/progress";

export function getDefaultBossProgress(bossId: string, userId: string): BossProgress {
  return {
    bossId,
    userId,
    status: "locked",
    bestScore: null,
    bestScoreDate: null,
    attempts: 0,
    earnedRewards: [],
  };
}

export function checkRequirements(
  boss: BossFight,
  gamification: GamificationData,
  allProgress: Record<string, TopicProgress>
): { met: boolean; details: BossWithProgress["requirementProgress"] } {
  const entries = Object.values(allProgress);
  const quizzesCompleted = entries.filter((e) => e.quizScore !== null).length;
  const lessonsRead = entries.filter((e) => e.lessonRead).length;

  const details = boss.requirements.map((req) => {
    let currentValue = 0;
    switch (req.type) {
      case "quests_completed":
        currentValue = quizzesCompleted;
        break;
      case "xp_threshold":
        currentValue = gamification.xp;
        break;
      case "lessons_read":
        currentValue = lessonsRead;
        break;
      case "quiz_score":
        currentValue = Math.max(...entries.map((e) => e.quizScore ?? 0));
        break;
    }
    return { requirement: req, currentValue, met: currentValue >= req.value };
  });

  return { met: details.every((d) => d.met), details };
}

export function computeBossWithProgress(
  boss: BossFight,
  progress: BossProgress,
  gamification: GamificationData,
  allProgress: Record<string, TopicProgress>
): BossWithProgress {
  const { met, details } = checkRequirements(boss, gamification, allProgress);

  let status = progress.status;
  if (status === "locked" && met) status = "unlocked";

  return {
    ...boss,
    progress: { ...progress, status },
    requirementsMet: met,
    requirementProgress: details,
  };
}

export function processBossCompletion(
  boss: BossFight,
  progress: BossProgress,
  score: number
): { updatedProgress: BossProgress; response: BossCompleteResponse } {
  const scoreOutOf20 = (score / boss.totalPoints) * 20;
  const passed = scoreOutOf20 >= boss.passThreshold;

  const newBestScore = progress.bestScore === null
    ? score
    : Math.max(score, progress.bestScore);

  const newRewards = passed
    ? boss.rewards.filter((r) => !progress.earnedRewards.includes(r.id))
    : [];

  const newStatus: BossProgress["status"] = passed
    ? "defeated"
    : progress.attempts + 1 === 0
    ? "unlocked"
    : "attempted";

  const updatedProgress: BossProgress = {
    ...progress,
    status: newStatus,
    bestScore: newBestScore,
    bestScoreDate: passed
      ? new Date().toISOString()
      : (progress.bestScoreDate ?? null),
    attempts: progress.attempts + 1,
    earnedRewards: [
      ...progress.earnedRewards,
      ...newRewards.map((r) => r.id),
    ],
  };

  return {
    updatedProgress,
    response: {
      success: true,
      passed,
      newStatus,
      newRewards,
      score,
      scoreOutOf20: Math.round(scoreOutOf20 * 100) / 100,
    },
  };
}
