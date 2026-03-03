import type { BilingualText, BilingualArray } from "./curriculum";

export type LessonSectionType =
  | "heading"
  | "paragraph"
  | "formula"
  | "example"
  | "important"
  | "definition"
  | "simulation-link"
  | "image"
  | "list";

export interface HeadingSection {
  type: "heading";
  level: 2 | 3 | 4;
  text: BilingualText;
}

export interface ParagraphSection {
  type: "paragraph";
  text: BilingualText;
}

export interface FormulaSection {
  type: "formula";
  latex: string;
  note?: BilingualText;
}

export interface ExampleSection {
  type: "example";
  title?: BilingualText;
  problem: BilingualText;
  solution?: {
    fr?: string;
    ar?: string;
    latex?: string;
  };
}

export interface ImportantSection {
  type: "important";
  text: BilingualText;
}

export interface DefinitionSection {
  type: "definition";
  term?: BilingualText;
  text: BilingualText;
}

export interface SimulationLinkSection {
  type: "simulation-link";
  simulation?: string;
  caption?: BilingualText;
}

export interface ImageSection {
  type: "image";
  src: string;
  alt?: BilingualText;
}

export interface ListSection {
  type: "list";
  ordered?: boolean;
  items: BilingualArray;
}

export type LessonSection =
  | HeadingSection
  | ParagraphSection
  | FormulaSection
  | ExampleSection
  | ImportantSection
  | DefinitionSection
  | SimulationLinkSection
  | ImageSection
  | ListSection;

export interface LessonData {
  id: string;
  title: BilingualText;
  objectives: BilingualArray;
  sections: LessonSection[];
}
