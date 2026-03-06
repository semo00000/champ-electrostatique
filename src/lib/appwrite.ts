import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client();

if (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };

// Database and collection IDs
export const DATABASE_ID = "bac-sciences";
export const COLLECTIONS = {
  CURRICULUM: "curriculum",
  LESSONS: "lessons",
  QUIZZES: "quizzes",
  PROGRESS: "progress",
  GAMIFICATION: "gamification",
  PAYMENTS: "payments",
  FACTION_SCORES: "faction_scores",   // schoolId, userId, xpContributed, weeklyXP
  BOSS_PROGRESS: "boss_progress",     // userId, bossId, status, bestScore, attempts
} as const;
