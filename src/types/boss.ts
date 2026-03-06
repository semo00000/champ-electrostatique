// ─── National Boss Fight types ─────────────────────────────────────────────

export type BossStatus =
  | "locked"       // prerequisites not met
  | "unlocked"     // can be attempted
  | "attempted"    // started but not passed
  | "defeated";    // passed the threshold

export interface BossRequirement {
  type: "quests_completed" | "quiz_score" | "xp_threshold" | "lessons_read";
  value: number;
  label: string;
}

export interface BossReward {
  type: "profile_frame" | "badge" | "baccoins" | "theme";
  id: string;
  label: string;
  labelAr: string;
  iconUrl?: string;
  cssClass?: string; // for profile frame glow etc.
}

export interface BossFight {
  id: string;
  title: string;
  titleAr: string;
  examYear: number;
  subject: "physique-chimie" | "maths" | "svt";
  filiere: "sm" | "sp" | "general";
  level: "2bac";
  passThreshold: number;  // out of 20 (e.g. 14)
  totalPoints: number;    // 20 for national exams
  difficulty: 1 | 2 | 3 | 4 | 5;
  requirements: BossRequirement[];
  rewards: BossReward[];
  topics: string[];
  examPdfUrl?: string;
  correctionPdfUrl?: string;
  description?: string;
  descriptionAr?: string;
  flavor: string;        // dramatic text shown on the boss card
  flavorAr: string;
  bgGradient: string;    // CSS gradient for the card
  iconEmoji: string;
}

export interface BossProgress {
  bossId: string;
  userId: string;
  status: BossStatus;
  bestScore: number | null;      // raw score (out of totalPoints)
  bestScoreDate: string | null;  // ISO date
  attempts: number;
  earnedRewards: string[];       // reward IDs
}

export interface BossWithProgress extends BossFight {
  progress: BossProgress;
  requirementsMet: boolean;
  requirementProgress: {
    requirement: BossRequirement;
    currentValue: number;
    met: boolean;
  }[];
}

export interface BossCompleteRequest {
  bossId: string;
  score: number;       // raw score out of totalPoints
}

export interface BossCompleteResponse {
  success: boolean;
  passed: boolean;
  newStatus: BossStatus;
  newRewards: BossReward[];
  score: number;
  scoreOutOf20: number;
}
