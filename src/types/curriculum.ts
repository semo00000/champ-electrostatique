// Bilingual text — the fundamental building block for all content
export interface BilingualText {
  fr: string;
  ar: string;
}

// Bilingual array — used for objectives, list items, etc.
export interface BilingualArray {
  fr: string[];
  ar: string[];
}

export type Locale = "fr" | "ar" | "en";

export type TopicStatus = "complete" | "planned";

export type SubjectId = "physique" | "chimie" | "maths" | "svt";

export type FiliereId = "sm" | "sp";

export type YearId = "1bac" | "2bac";

export interface Topic {
  id: string;
  title: BilingualText;
  status: TopicStatus;
  simulation: string | null;
}

export interface Subject {
  title: BilingualText;
  topics: Topic[];
}

export interface Filiere {
  title: BilingualText;
  subjects: Record<SubjectId, Subject>;
}

export interface Year {
  title: BilingualText;
  filieres: Record<FiliereId, Filiere>;
}

export interface Curriculum {
  years: Record<YearId, Year>;
}

// Subject color mapping
export const SUBJECT_COLORS: Record<SubjectId, string> = {
  physique: "#6366f1",
  chimie: "#10b981",
  maths: "#8b5cf6",
  svt: "#f97316",
};
