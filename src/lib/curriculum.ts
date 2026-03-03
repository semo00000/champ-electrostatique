import type { Curriculum } from "@/types/curriculum";
import curriculumData from "../../public/data/curriculum.json";

// ---------- Sync (build-time bundled, used by client + search) ----------

let _curriculum: Curriculum | null = null;

export function getCurriculum(): Curriculum {
  if (!_curriculum) {
    _curriculum = curriculumData as Curriculum;
  }
  return _curriculum;
}

// ---------- Async (Appwrite-first, fallback to static JSON) ----------

let _curriculumCache: { data: Curriculum; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCurriculumAsync(): Promise<Curriculum> {
  if (_curriculumCache && Date.now() - _curriculumCache.ts < CACHE_TTL_MS) {
    return _curriculumCache.data;
  }

  try {
    const { getServerDatabases } = await import("./appwrite-server");
    const db = getServerDatabases();
    const doc = await db.getDocument("bac-sciences", "curriculum", "main");
    const parsed = JSON.parse(doc.data) as Curriculum;
    _curriculumCache = { data: parsed, ts: Date.now() };
    return parsed;
  } catch {
    return getCurriculum();
  }
}

// ---------- Sync helpers (used everywhere) ----------

export function getYearData(yearId: string) {
  const curriculum = getCurriculum();
  return curriculum.years[yearId as keyof typeof curriculum.years] ?? null;
}

export function getFiliereData(yearId: string, filiereId: string) {
  const year = getYearData(yearId);
  if (!year) return null;
  return year.filieres[filiereId as keyof typeof year.filieres] ?? null;
}

export function getSubjectData(
  yearId: string,
  filiereId: string,
  subjectId: string
) {
  const filiere = getFiliereData(yearId, filiereId);
  if (!filiere) return null;
  return (
    filiere.subjects[subjectId as keyof typeof filiere.subjects] ?? null
  );
}

export function getTopicData(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
) {
  const subject = getSubjectData(yearId, filiereId, subjectId);
  if (!subject) return null;
  return subject.topics.find((t) => t.id === topicId) ?? null;
}

export function getAdjacentTopics(
  yearId: string,
  filiereId: string,
  subjectId: string,
  topicId: string
) {
  const subject = getSubjectData(yearId, filiereId, subjectId);
  if (!subject) return { prev: null, next: null };

  const idx = subject.topics.findIndex((t) => t.id === topicId);
  return {
    prev: idx > 0 ? subject.topics[idx - 1] : null,
    next: idx < subject.topics.length - 1 ? subject.topics[idx + 1] : null,
  };
}

/**
 * Generate all valid paths for static generation
 */
export function getAllTopicPaths() {
  const curriculum = getCurriculum();
  const paths: Array<{
    year: string;
    filiere: string;
    subject: string;
    topic: string;
  }> = [];

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
