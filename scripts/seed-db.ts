import { Client, Databases } from "node-appwrite";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const DATABASE_ID = "bac-sciences";
const DATA_DIR = path.join(process.cwd(), "public", "data");

const COLLECTIONS = {
  CURRICULUM: "curriculum",
  LESSONS: "lessons",
  QUIZZES: "quizzes",
} as const;

async function main() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey || apiKey === "your-server-api-key") {
    console.error(
      "Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, " +
        "and APPWRITE_API_KEY in .env.local before running this script."
    );
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const db = new Databases(client);

  // 1. Seed curriculum
  console.log("Seeding curriculum...");
  const curriculumRaw = fs.readFileSync(
    path.join(DATA_DIR, "curriculum.json"),
    "utf-8"
  );
  await upsertDocument(db, COLLECTIONS.CURRICULUM, "main", {
    data: curriculumRaw,
    version: 1,
  });
  console.log("  [OK] curriculum (1 document)");

  // 2. Discover all topic paths from curriculum
  const curriculum = JSON.parse(curriculumRaw);
  const paths = getAllPaths(curriculum);
  console.log(`\nFound ${paths.length} topic paths`);

  // 3. Seed lessons and quizzes
  let lessonCount = 0;
  let quizCount = 0;

  for (const p of paths) {
    const topicDir = path.join(DATA_DIR, p.year, p.filiere, p.subject, p.topic);
    const docId = makeDocId(p.year, p.filiere, p.subject, p.topic);

    // Lesson
    const lessonPath = path.join(topicDir, "lesson.json");
    if (fs.existsSync(lessonPath)) {
      const lessonRaw = fs.readFileSync(lessonPath, "utf-8");
      const lessonData = JSON.parse(lessonRaw);
      await upsertDocument(db, COLLECTIONS.LESSONS, docId, {
        yearId: p.year,
        filiereId: p.filiere,
        subjectId: p.subject,
        topicId: p.topic,
        titleFr: lessonData.title?.fr || "",
        titleAr: lessonData.title?.ar || "",
        data: lessonRaw,
      });
      lessonCount++;
    }

    // Quiz
    const quizPath = path.join(topicDir, "quiz.json");
    if (fs.existsSync(quizPath)) {
      const quizRaw = fs.readFileSync(quizPath, "utf-8");
      const quizData = JSON.parse(quizRaw);
      const questions = Array.isArray(quizData)
        ? quizData
        : quizData.questions ?? [];
      await upsertDocument(db, COLLECTIONS.QUIZZES, docId, {
        yearId: p.year,
        filiereId: p.filiere,
        subjectId: p.subject,
        topicId: p.topic,
        questionCount: questions.length,
        data: quizRaw,
      });
      quizCount++;
    }
  }

  console.log(`\nSeed complete: ${lessonCount} lessons, ${quizCount} quizzes`);
}

function makeDocId(year: string, filiere: string, subject: string, topic: string): string {
  const raw = `${year}_${filiere}_${subject}_${topic}`.replace(/[^a-zA-Z0-9_]/g, "_");
  if (raw.length <= 36) return raw;
  return crypto.createHash("md5").update(raw).digest("hex").slice(0, 32);
}

async function upsertDocument(
  db: Databases,
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>
) {
  try {
    await db.updateDocument(DATABASE_ID, collectionId, documentId, data);
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 404) {
      await db.createDocument(DATABASE_ID, collectionId, documentId, data);
    } else {
      throw err;
    }
  }
}

interface TopicPath {
  year: string;
  filiere: string;
  subject: string;
  topic: string;
}

function getAllPaths(curriculum: {
  years: Record<
    string,
    {
      filieres: Record<
        string,
        { subjects: Record<string, { topics: { id: string }[] }> }
      >;
    }
  >;
}): TopicPath[] {
  const paths: TopicPath[] = [];

  for (const [yearId, year] of Object.entries(curriculum.years)) {
    for (const [filiereId, filiere] of Object.entries(year.filieres)) {
      for (const [subjectId, subject] of Object.entries(filiere.subjects)) {
        for (const topic of subject.topics) {
          paths.push({
            year: yearId,
            filiere: filiereId,
            subject: subjectId,
            topic: topic.id,
          });
        }
      }
    }
  }

  return paths;
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
