"use client";

import { useI18n } from "@/lib/i18n/context";
import type { LessonData, LessonSection } from "@/types/lesson";
import { HeadingSection } from "./sections/HeadingSection";
import { ParagraphSection } from "./sections/ParagraphSection";
import { FormulaSection } from "./sections/FormulaSection";
import { ExampleSection } from "./sections/ExampleSection";
import { ImportantSection } from "./sections/ImportantSection";
import { DefinitionSection } from "./sections/DefinitionSection";
import { ImageSection } from "./sections/ImageSection";
import { ListSection } from "./sections/ListSection";
import { SimulationLinkSection } from "./sections/SimulationLinkSection";
import { MathText } from "./sections/MathText";

interface LessonRendererProps {
  lesson: LessonData;
  simulationUrl?: string;
}

export function LessonRenderer({ lesson, simulationUrl }: LessonRendererProps) {
  const { t, localize, localizeArray } = useI18n();

  // Estimate reading time
  const textContent = JSON.stringify(lesson).replace(/<[^>]+>/g, " ");
  const wordCount = textContent.split(/\s+/).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 150));

  // Generate heading IDs for TOC
  let headingIdx = 0;
  const getHeadingId = () => `heading-${headingIdx++}`;

  return (
    <article className="lesson-content">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
          {localize(lesson.title)}
        </h1>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{readingTimeMin} {t("lesson.readingTime")}</span>
        </div>
      </div>

      {/* Objectives */}
      {lesson.objectives && (
        <div className="mb-8 p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            {t("lesson.objectives")}
          </h3>
          <ul className="space-y-2">
            {localizeArray(lesson.objectives).map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <MathText text={obj} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sections */}
      {lesson.sections.map((section, i) => (
        <SectionRenderer
          key={i}
          section={section}
          headingId={section.type === "heading" ? getHeadingId() : undefined}
          simulationUrl={simulationUrl}
        />
      ))}
    </article>
  );
}

interface SectionRendererProps {
  section: LessonSection;
  headingId?: string;
  simulationUrl?: string;
}

function SectionRenderer({ section, headingId, simulationUrl }: SectionRendererProps) {
  switch (section.type) {
    case "heading":
      return <HeadingSection section={section} id={headingId} />;
    case "paragraph":
      return <ParagraphSection section={section} />;
    case "formula":
      return <FormulaSection section={section} />;
    case "example":
      return <ExampleSection section={section} />;
    case "important":
      return <ImportantSection section={section} />;
    case "definition":
      return <DefinitionSection section={section} />;
    case "image":
      return <ImageSection section={section} />;
    case "list":
      return <ListSection section={section} />;
    case "simulation-link":
      return <SimulationLinkSection section={section} simulationUrl={simulationUrl} />;
    default:
      return null;
  }
}
