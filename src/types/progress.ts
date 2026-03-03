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
}

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
