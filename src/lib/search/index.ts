import { getCurriculum } from "@/lib/curriculum";
import type { BilingualText, SubjectId } from "@/types/curriculum";

export interface SearchEntry {
  type: "topic";
  title: BilingualText;
  path: string;
  subject: SubjectId;
  year: string;
  filiere: string;
  subjectTitle: BilingualText;
  status: string;
  hasSim: boolean;
}

let _index: SearchEntry[] | null = null;

export function getSearchIndex(): SearchEntry[] {
  if (_index) return _index;

  const curriculum = getCurriculum();
  const entries: SearchEntry[] = [];

  for (const [yearId, year] of Object.entries(curriculum.years)) {
    for (const [filiereId, filiere] of Object.entries(year.filieres)) {
      for (const [subjectId, subject] of Object.entries(filiere.subjects)) {
        for (const topic of subject.topics) {
          entries.push({
            type: "topic",
            title: topic.title,
            path: `/${yearId}/${filiereId}/${subjectId}/${topic.id}`,
            subject: subjectId as SubjectId,
            year: yearId,
            filiere: filiereId,
            subjectTitle: subject.title,
            status: topic.status,
            hasSim: !!topic.simulation,
          });
        }
      }
    }
  }

  _index = entries;
  return entries;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function searchEntries(query: string): SearchEntry[] {
  if (!query.trim()) return [];

  const index = getSearchIndex();
  const q = normalize(query);

  return index.filter((entry) => {
    const titleFr = normalize(entry.title.fr);
    const titleAr = entry.title.ar.toLowerCase();
    const subjectFr = normalize(entry.subjectTitle.fr);
    return titleFr.includes(q) || titleAr.includes(q) || subjectFr.includes(q);
  });
}
