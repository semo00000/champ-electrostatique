"use client";

import { useState } from "react";
import { BlockMath } from "react-katex";
import { useI18n } from "@/lib/i18n/context";
import { MathText } from "./MathText";
import type { ExampleSection as ExampleSectionType } from "@/types/lesson";
import "katex/dist/katex.min.css";

interface Props {
  section: ExampleSectionType;
}

export function ExampleSection({ section }: Props) {
  const { t, localize } = useI18n();
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="my-6 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] overflow-hidden">
      {/* Title */}
      {section.title && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-glass)] bg-[var(--bg-hover)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-info)]">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {localize(section.title)}
          </span>
        </div>
      )}

      {/* Problem */}
      <div className="px-4 py-3">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          <MathText text={localize(section.problem)} />
        </p>
      </div>

      {/* Solution toggle */}
      {section.solution && (
        <div className="border-t border-[var(--border-glass)]">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[var(--text-accent)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <span>{showSolution ? t("lesson.hideSolution") : t("lesson.showSolution")}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-300 ${showSolution ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Solution content */}
          <div
            className={`overflow-hidden transition-all duration-300 ${showSolution ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="px-4 py-3 bg-[var(--bg-hover)]">
              {section.solution.latex && (
                <div className="mb-2">
                  <BlockMath math={section.solution.latex} />
                </div>
              )}
              {(section.solution.fr || section.solution.ar) && (
                <p className="text-sm text-[var(--text-secondary)]">
                  <MathText text={section.solution.fr || section.solution.ar || ""} />
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
