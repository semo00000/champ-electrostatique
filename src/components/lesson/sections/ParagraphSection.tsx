"use client";

import { useI18n } from "@/lib/i18n/context";
import { MathText } from "./MathText";
import type { ParagraphSection as ParagraphSectionType } from "@/types/lesson";

interface Props {
  section: ParagraphSectionType;
}

export function ParagraphSection({ section }: Props) {
  const { localize } = useI18n();
  const text = localize(section.text);

  return (
    <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)] mb-4">
      <MathText text={text} />
    </p>
  );
}
