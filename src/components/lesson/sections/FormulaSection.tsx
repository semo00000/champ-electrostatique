"use client";

import { useState } from "react";
import { BlockMath } from "react-katex";
import { useI18n } from "@/lib/i18n/context";
import { MathText } from "./MathText";
import type { FormulaSection as FormulaSectionType } from "@/types/lesson";
import "katex/dist/katex.min.css";

interface Props {
  section: FormulaSectionType;
}

export function FormulaSection({ section }: Props) {
  const { localize } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(section.latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="relative my-6 p-4 md:p-6 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] overflow-x-auto">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        title="Copy LaTeX"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      {/* LaTeX formula */}
      <div className="text-center">
        <BlockMath math={section.latex} />
      </div>

      {/* Note */}
      {section.note && (
        <div className="mt-3 pt-3 border-t border-[var(--border-glass)] text-xs text-[var(--text-muted)]">
          <MathText text={localize(section.note)} />
        </div>
      )}
    </div>
  );
}
