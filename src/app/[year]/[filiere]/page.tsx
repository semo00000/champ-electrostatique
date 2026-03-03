"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { getYearData, getFiliereData } from "@/lib/curriculum";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { notFound } from "next/navigation";

const SUBJECT_COLOR_CLASSES: Record<string, string> = {
  physique: "border-l-[var(--color-physique)]",
  chimie: "border-l-[var(--color-chimie)]",
  maths: "border-l-[var(--color-maths)]",
  svt: "border-l-[var(--color-svt)]",
};

const SUBJECT_DOT_CLASSES: Record<string, string> = {
  physique: "bg-[var(--color-physique)]",
  chimie: "bg-[var(--color-chimie)]",
  maths: "bg-[var(--color-maths)]",
  svt: "bg-[var(--color-svt)]",
};

export default function FilierePage() {
  const params = useParams<{ year: string; filiere: string }>();
  const { t, localize } = useI18n();

  const { year: yearId, filiere: filiereId } = params;
  const year = getYearData(yearId);
  const filiere = getFiliereData(yearId, filiereId);

  if (!year || !filiere) {
    notFound();
  }

  const breadcrumbItems = [
    { label: t("nav.home"), href: "/" },
    { label: localize(year.title), href: `/${yearId}` },
    { label: localize(filiere.title), href: `/${yearId}/${filiereId}` },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
          {localize(filiere.title)}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {localize(year.title)} &mdash; {t(`filiere.${filiereId}.desc`)}
        </p>
      </div>

      {/* Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(filiere.subjects).map(([subjectId, subject]) => (
          <Link
            key={subjectId}
            href={`/${yearId}/${filiereId}/${subjectId}`}
            className={`group p-6 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] hover:border-[var(--border-glass-bright)] hover:shadow-[var(--shadow-md)] transition-all border-l-4 ${SUBJECT_COLOR_CLASSES[subjectId] || ""}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${SUBJECT_DOT_CLASSES[subjectId] || "bg-gray-500"}`} />
                <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                  {localize(subject.title)}
                </h2>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)] group-hover:text-[var(--text-accent)] transition-colors">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            <div className="space-y-1">
              {subject.topics.slice(0, 4).map((topic) => (
                <div key={topic.id} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className={`w-1.5 h-1.5 rounded-full ${topic.status === "complete" ? "bg-[var(--color-success)]" : "bg-[var(--text-muted)]"}`} />
                  {localize(topic.title)}
                </div>
              ))}
              {subject.topics.length > 4 && (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  +{subject.topics.length - 4} {t("topics")}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border-glass)]">
              <span className="text-xs text-[var(--text-muted)]">
                {subject.topics.length} {t("topics")}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {subject.topics.filter((t) => t.status === "complete").length} {t("status.complete").toLowerCase()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
