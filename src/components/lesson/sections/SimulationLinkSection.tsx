"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import type { SimulationLinkSection as SimLinkSectionType } from "@/types/lesson";

interface Props {
  section: SimLinkSectionType;
  simulationUrl?: string;
}

export function SimulationLinkSection({ section, simulationUrl }: Props) {
  const { t, localize } = useI18n();

  if (!simulationUrl) return null;

  return (
    <Link
      href={simulationUrl}
      className="group my-6 flex items-center gap-4 p-4 rounded-xl border border-[var(--color-info)]/30 bg-[var(--color-info)]/5 hover:bg-[var(--color-info)]/10 transition-colors cursor-pointer"
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--color-info)]/20 flex items-center justify-center text-2xl flex-shrink-0">
        ⚡
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
          {t("lesson.openSim")}
        </h4>
        {section.caption && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {localize(section.caption)}
          </p>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
