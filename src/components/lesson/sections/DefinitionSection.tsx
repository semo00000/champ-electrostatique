"use client";

import { useI18n } from "@/lib/i18n/context";
import { MathText } from "./MathText";
import type { DefinitionSection as DefinitionSectionType } from "@/types/lesson";

interface Props {
  section: DefinitionSectionType;
}

export function DefinitionSection({ section }: Props) {
  const { localize } = useI18n();

  return (
    <div className="my-6 p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)]">
      {section.term && (
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-info)]">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {localize(section.term)}
          </span>
        </div>
      )}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        <MathText text={localize(section.text)} />
      </p>
    </div>
  );
}
