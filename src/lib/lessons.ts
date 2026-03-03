import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { LessonData } from "@/types/lesson";
import type { QuizQuestion } from "@/types/quiz";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const DATABASE_ID = "bac-sciences";

function makeDocId(year: string, filiere: string, subject: string, topic: string): string {
  const raw = `${year}_${filiere}_${subject}_${topic}`.replace(/[^a-zA-Z0-9_]/g, "_");
  if (raw.length <= 36) return raw;
  return crypto.createHash("md5").update(raw).digest("hex").slice(0, 32);
}

// ---------- Async (Appwrite-first, filesystem fallback) ----------

export async function getLessonDataAsync(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): Promise<LessonData | null> {
  const docId = makeDocId(yearId, filiereId, subjectId, topicId);

  try {
    const { getServerDatabases } = await import("./appwrite-server");
    const db = getServerDatabases();
    const doc = await db.getDocument(DATABASE_ID, "lessons", docId);
    return JSON.parse(doc.data) as LessonData;
  } catch {
    return getLessonData(yearId, filiereId, subjectId, topicId);
  }
}

export async function getQuizDataAsync(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): Promise<QuizQuestion[] | null> {
  const docId = makeDocId(yearId, filiereId, subjectId, topicId);

  try {
    const { getServerDatabases } = await import("./appwrite-server");
    const db = getServerDatabases();
    const doc = await db.getDocument(DATABASE_ID, "quizzes", docId);
    const data = JSON.parse(doc.data);
    return Array.isArray(data) ? data : data.questions ?? null;
  } catch {
    return getQuizData(yearId, filiereId, subjectId, topicId);
  }
}

export async function hasLessonDataAsync(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): Promise<boolean> {
  const docId = makeDocId(yearId, filiereId, subjectId, topicId);
  try {
    const { getServerDatabases } = await import("./appwrite-server");
    const db = getServerDatabases();
    await db.getDocument(DATABASE_ID, "lessons", docId);
    return true;
  } catch {
    return hasLessonData(yearId, filiereId, subjectId, topicId);
  }
}

export async function hasQuizDataAsync(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): Promise<boolean> {
  const docId = makeDocId(yearId, filiereId, subjectId, topicId);
  try {
    const { getServerDatabases } = await import("./appwrite-server");
    const db = getServerDatabases();
    await db.getDocument(DATABASE_ID, "quizzes", docId);
    return true;
  } catch {
    return hasQuizData(yearId, filiereId, subjectId, topicId);
  }
}

// ---------- Sync (filesystem-only, kept as fallback) ----------

export function getLessonData(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): LessonData | null {
  const filePath = path.join(
    DATA_DIR,
    yearId,
    filiereId,
    subjectId,
    topicId,
    "lesson.json"
  );

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as LessonData;
  } catch {
    return null;
  }
}

export function getQuizData(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): QuizQuestion[] | null {
  const filePath = path.join(
    DATA_DIR,
    yearId,
    filiereId,
    subjectId,
    topicId,
    "quiz.json"
  );

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    // Quiz JSON can be { questions: [...] } or just [...]
    return Array.isArray(data) ? data : data.questions ?? null;
  } catch {
    return null;
  }
}

export function hasLessonData(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): boolean {
  const filePath = path.join(
    DATA_DIR,
    yearId,
    filiereId,
    subjectId,
    topicId,
    "lesson.json"
  );
  return fs.existsSync(filePath);
}

export function hasQuizData(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
): boolean {
  const filePath = path.join(
    DATA_DIR,
    yearId,
    filiereId,
    subjectId,
    topicId,
    "quiz.json"
  );
  return fs.existsSync(filePath);
}
