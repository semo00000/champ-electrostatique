"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { getCurriculum, getYearData } from "@/lib/curriculum";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { notFound } from "next/navigation";

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  physique: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  chimie: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3h6v7l5 8a2 2 0 0 1-1.7 3H5.7a2 2 0 0 1-1.7-3l5-8V3" />
      <path d="M7 3h10" />
    </svg>
  ),
  maths: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  svt: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const SUBJECT_COLOR_CLASSES: Record<string, string> = {
  physique: "bg-[var(--color-physique)]",
  chimie: "bg-[var(--color-chimie)]",
  maths: "bg-[var(--color-maths)]",
  svt: "bg-[var(--color-svt)]",
};

const SUBJECT_BG_CLASSES: Record<string, string> = {
  physique: "bg-[var(--color-physique)]/10",
  chimie: "bg-[var(--color-chimie)]/10",
  maths: "bg-[var(--color-maths)]/10",
  svt: "bg-[var(--color-svt)]/10",
};

export default function YearPage() {
  const params = useParams<{ year: string }>();
  const { t, localize } = useI18n();

  const yearId = params.year;
  const year = getYearData(yearId);

  if (!year) {
    notFound();
  }

  const breadcrumbItems = [
    { label: t("nav.home"), href: "/" },
    { label: localize(year.title), href: `/${yearId}` },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} />

      {/* Year Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
          {localize(year.title)}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {t(`year.${yearId}.desc`)}
        </p>
      </div>

      {/* Filieres */}
      <div className="space-y-8">
        {Object.entries(year.filieres).map(([filiereId, filiere]) => (
          <section key={filiereId}>
            <Link
              href={`/${yearId}/${filiereId}`}
              className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-colors mb-4"
            >
              {localize(filiere.title)}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(filiere.subjects).map(([subjectId, subject]) => (
                <Link
                  key={subjectId}
                  href={`/${yearId}/${filiereId}/${subjectId}`}
                  className="group relative p-5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] hover:border-[var(--border-glass-bright)] hover:shadow-[var(--shadow-md)] transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${SUBJECT_BG_CLASSES[subjectId] || "bg-gray-500/10"}`}>
                    <span className={`text-[var(--color-${subjectId})]`}>
                      {SUBJECT_ICONS[subjectId]}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                    {localize(subject.title)}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {subject.topics.length} {t("topics")}
                  </p>
                  <div className="absolute top-3 right-3">
                    <span className={`w-2 h-2 rounded-full inline-block ${SUBJECT_COLOR_CLASSES[subjectId] || "bg-gray-500"}`} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
