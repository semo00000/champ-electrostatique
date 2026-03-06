export interface TopicProgress {
  lessonRead: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  lastVisit?: number; // timestamp
  lastQuiz?: number; // timestamp
}

export interface GamificationData {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string | null; // ISO date "YYYY-MM-DD"
  activityMap: Record<string, number>; // date → XP earned
  // BacCoins economy
  bacCoins: number;
  streakFreezeCount: number;   // owned freezes
  streakFreezeUsedAt: string | null; // last date a freeze was used
  // RPG rank (derived, but stored for display caching)
  rank: RankId;
  // Faction membership
  schoolId: string | null;
  // Earned rewards (boss frames, badges, etc.)
  earnedRewards: string[];
}

// ── RPG Ranks ────────────────────────────────────────────────────────────────
export type RankId =
  | "jid3_mouchtarak"   // XP 0–149
  | "thaleb"            // XP 150–449
  | "moutafawwiq"       // XP 450–899
  | "first_bac"         // XP 900–1799
  | "second_bac"        // XP 1800–3599
  | "mention_assez_bien"// XP 3600–5999
  | "mention_bien"      // XP 6000–9999
  | "mention_tres_bien"; // XP 10000+

export interface RankInfo {
  id: RankId;
  label: string;
  labelAr: string;
  minXP: number;
  color: string;        // hex
  glowColor: string;    // rgba for glow
  badgeEmoji: string;
  perks: string[];      // e.g. ["custom_theme", "golden_username"]
}

export const RANKS: RankInfo[] = [
  { id: "jid3_mouchtarak", label: "Jid3 Mouchtarak", labelAr: "جدع مشترك", minXP: 0, color: "#6b7280", glowColor: "rgba(107,114,128,0.4)", badgeEmoji: "🎒", perks: [] },
  { id: "thaleb", label: "Thâleb", labelAr: "طالب", minXP: 150, color: "#10b981", glowColor: "rgba(16,185,129,0.4)", badgeEmoji: "📖", perks: [] },
  { id: "moutafawwiq", label: "Moutafawwiq", labelAr: "متفوق", minXP: 450, color: "#3b82f6", glowColor: "rgba(59,130,246,0.4)", badgeEmoji: "⭐", perks: [] },
  { id: "first_bac", label: "1 BAC", labelAr: "أولى باك", minXP: 900, color: "#8b5cf6", glowColor: "rgba(139,92,246,0.4)", badgeEmoji: "🏅", perks: [] },
  { id: "second_bac", label: "2 BAC", labelAr: "ثانية باك", minXP: 1800, color: "#f59e0b", glowColor: "rgba(245,158,11,0.4)", badgeEmoji: "🥇", perks: [] },
  { id: "mention_assez_bien", label: "Mention Assez Bien", labelAr: "حسن", minXP: 3600, color: "#ef4444", glowColor: "rgba(239,68,68,0.4)", badgeEmoji: "🔥", perks: ["dark_theme"] },
  { id: "mention_bien", label: "Mention Bien", labelAr: "حسن جداً", minXP: 6000, color: "#f97316", glowColor: "rgba(249,115,22,0.5)", badgeEmoji: "💎", perks: ["dark_theme", "colored_username"] },
  { id: "mention_tres_bien", label: "Mention Très Bien", labelAr: "ممتاز", minXP: 10000, color: "#ffd700", glowColor: "rgba(255,215,0,0.6)", badgeEmoji: "👑", perks: ["dark_theme", "colored_username", "custom_frame"] },
];

export interface UserProgress {
  topics: Record<string, TopicProgress>; // key: "2bac/sm/physique/electrostatique"
  gamification: GamificationData;
}

export interface GamificationStats {
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  streakDays: number;
  activityMap: Record<string, number>;
}

// XP constants
export const XP_PER_LEVEL = 150;
export const XP_LESSON_READ = 50;
export const XP_PER_QUIZ_POINT = 10;

// BacCoin constants
export const BACCOINS_PER_LESSON = 5;
export const BACCOINS_PER_QUIZ_POINT = 2;
export const BACCOINS_STREAK_FREEZE_COST = 30;
export const BACCOINS_BOSS_ATTEMPT_BONUS = 20;
export const BACCOINS_BOSS_WIN_BONUS = 100;
