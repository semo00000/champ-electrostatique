"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useSubscription } from "@/lib/subscription/context";
import { getYearData, getFiliereData, getSubjectData } from "@/lib/curriculum";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { notFound } from "next/navigation";

const SUBJECT_DOT_CLASSES: Record<string, string> = {
  physique: "bg-[var(--color-physique)]",
  chimie: "bg-[var(--color-chimie)]",
  maths: "bg-[var(--color-maths)]",
  svt: "bg-[var(--color-svt)]",
};

export default function SubjectPage() {
  const params = useParams<{ year: string; filiere: string; subject: string }>();
  const { t, localize } = useI18n();
  const { isPremium } = useSubscription();

  const { year: yearId, filiere: filiereId, subject: subjectId } = params;
  const year = getYearData(yearId);
  const filiere = getFiliereData(yearId, filiereId);
  const subject = getSubjectData(yearId, filiereId, subjectId);

  if (!year || !filiere || !subject) {
    notFound();
  }

  const breadcrumbItems = [
    { label: t("nav.home"), href: "/" },
    { label: localize(year.title), href: `/${yearId}` },
    { label: localize(filiere.title), href: `/${yearId}/${filiereId}` },
    { label: localize(subject.title), href: `/${yearId}/${filiereId}/${subjectId}` },
  ];

  const completedCount = subject.topics.filter((t) => t.status === "complete").length;

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className={`w-3 h-3 rounded-full ${SUBJECT_DOT_CLASSES[subjectId] || "bg-gray-500"}`} />
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {localize(subject.title)}
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {localize(year.title)} &mdash; {localize(filiere.title)}
        </p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-[var(--text-muted)]">
            {completedCount}/{subject.topics.length} {t("topics")}
          </span>
          <div className="flex-1 max-w-[200px] h-1.5 rounded-full bg-[var(--bg-hover)]">
            <div
              className={`h-full rounded-full ${SUBJECT_DOT_CLASSES[subjectId] || "bg-gray-500"} transition-all`}
              style={{ width: `${(completedCount / subject.topics.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-2">
        {subject.topics.map((topic, index) => (
          <Link
            key={topic.id}
            href={`/${yearId}/${filiereId}/${subjectId}/${topic.id}`}
            className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] hover:border-[var(--border-glass-bright)] hover:shadow-[var(--shadow-md)] transition-all"
          >
            {/* Number */}
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center text-xs font-semibold text-[var(--text-muted)]">
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors truncate">
                {localize(topic.title)}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                {topic.status === "complete" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-success)]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t("status.complete")}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">
                    {t("status.planned")}
                  </span>
                )}
                {topic.simulation && (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-info)]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    {t("status.sim")}
                  </span>
                )}
                {!isPremium && index > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]" title="Premium">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {t("status.premium")}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)] group-hover:text-[var(--text-accent)] transition-colors flex-shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
