"use client";

import { useI18n } from "@/lib/i18n/context";
import { MathText } from "./MathText";
import type { ImportantSection as ImportantSectionType } from "@/types/lesson";

interface Props {
  section: ImportantSectionType;
}

export function ImportantSection({ section }: Props) {
  const { localize } = useI18n();

  return (
    <div className="my-6 flex gap-3 p-4 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5">
      <div className="flex-shrink-0 mt-0.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
        <MathText text={localize(section.text)} />
      </p>
    </div>
  );
}
