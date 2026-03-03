"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { TableOfContents } from "@/components/lesson/TableOfContents";
import { ReadingProgress } from "@/components/lesson/ReadingProgress";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import type { LessonData } from "@/types/lesson";
import type { BilingualText } from "@/types/curriculum";

interface TopicPageClientProps {
  yearId: string;
  filiereId: string;
  subjectId: string;
  topicId: string;
  yearTitle: BilingualText;
  filiereTitle: BilingualText;
  subjectTitle: BilingualText;
  topicTitle: BilingualText;
  lesson: LessonData | null;
  hasQuiz: boolean;
  hasSimulation: boolean;
  simulationUrl?: string;
  prevTopic: { title: BilingualText; href: string } | null;
  nextTopic: { title: BilingualText; href: string } | null;
  isFirstTopic: boolean;
}

export function TopicPageClient({
  yearId,
  filiereId,
  subjectId,
  topicId,
  yearTitle,
  filiereTitle,
  subjectTitle,
  topicTitle,
  lesson,
  hasQuiz,
  hasSimulation,
  simulationUrl,
  prevTopic,
  nextTopic,
  isFirstTopic,
}: TopicPageClientProps) {
  const { t, localize, dir } = useI18n();

  const breadcrumbItems = [
    { label: t("nav.home"), href: "/" },
    { label: localize(yearTitle), href: `/${yearId}` },
    { label: localize(filiereTitle), href: `/${yearId}/${filiereId}` },
    { label: localize(subjectTitle), href: `/${yearId}/${filiereId}/${subjectId}` },
    { label: localize(topicTitle), href: `/${yearId}/${filiereId}/${subjectId}/${topicId}` },
  ];

  const basePath = `/${yearId}/${filiereId}/${subjectId}/${topicId}`;

  return (
    <div>
      <ReadingProgress />
      <Breadcrumb items={breadcrumbItems} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--border-glass)]">
        <TabLink href={basePath} label={t("tab.lesson")} active />
        {hasQuiz && (
          <TabLink href={`${basePath}/quiz`} label={t("tab.quiz")} />
        )}
        {hasSimulation && (
          <TabLink href={`${basePath}/sim`} label={t("tab.simulation")} />
        )}
      </div>

      {/* Lesson Content */}
      {lesson ? (
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <LessonRenderer lesson={lesson} simulationUrl={simulationUrl} />

            {/* Prev/Next Navigation */}
            <div className="flex gap-4 mt-12 pt-6 border-t border-[var(--border-glass)]">
              {prevTopic ? (
                <Link
                  href={prevTopic.href}
                  className="flex-1 group p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] hover:border-[var(--border-glass-bright)] transition-all"
                >
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={dir === "rtl" ? "rotate-180" : ""}>
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {t("quiz.back").replace(t("tab.lesson").toLowerCase(), "").trim() || "Precedent"}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                    {localize(prevTopic.title)}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextTopic ? (
                <Link
                  href={nextTopic.href}
                  className="flex-1 group p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] hover:border-[var(--border-glass-bright)] transition-all text-right"
                >
                  <div className="flex items-center justify-end gap-1 text-xs text-[var(--text-muted)] mb-1">
                    Suivant
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={dir === "rtl" ? "rotate-180" : ""}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                    {localize(nextTopic.title)}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>

            <UpgradeBanner isFirstTopic={isFirstTopic} hasQuiz={hasQuiz} />
          </div>
          <div className="hidden lg:block w-56 flex-shrink-0">
            <TableOfContents lesson={lesson} />
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-3xl">
            📚
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {t("empty.title")}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {t("empty.desc")}
          </p>
        </div>
      )}
    </div>
  );
}

function TabLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-[var(--color-info)] text-[var(--text-accent)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glass)]"
      }`}
    >
      {label}
    </Link>
  );
}
