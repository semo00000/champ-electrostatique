"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useSubscription } from "@/lib/subscription/context";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { Paywall } from "@/components/Paywall";
import type { QuizQuestion } from "@/types/quiz";
import type { BilingualText } from "@/types/curriculum";

interface QuizPageClientProps {
  yearId: string;
  filiereId: string;
  subjectId: string;
  topicId: string;
  yearTitle: BilingualText;
  filiereTitle: BilingualText;
  subjectTitle: BilingualText;
  topicTitle: BilingualText;
  questions: QuizQuestion[];
  hasSimulation: boolean;
  isFirstTopic: boolean;
}

export function QuizPageClient({
  yearId,
  filiereId,
  subjectId,
  topicId,
  yearTitle,
  filiereTitle,
  subjectTitle,
  topicTitle,
  questions,
  hasSimulation,
  isFirstTopic,
}: QuizPageClientProps) {
  const { t, localize } = useI18n();
  const { isPremium, isLoading } = useSubscription();

  const basePath = `/${yearId}/${filiereId}/${subjectId}/${topicId}`;

  const breadcrumbItems = [
    { label: t("nav.home"), href: "/" },
    { label: localize(yearTitle), href: `/${yearId}` },
    { label: localize(filiereTitle), href: `/${yearId}/${filiereId}` },
    { label: localize(subjectTitle), href: `/${yearId}/${filiereId}/${subjectId}` },
    { label: localize(topicTitle), href: basePath },
    { label: t("tab.quiz"), href: `${basePath}/quiz` },
  ];

  const canAccess = isPremium || isFirstTopic;

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--border-glass)]">
        <TabLink href={basePath} label={t("tab.lesson")} />
        <TabLink href={`${basePath}/quiz`} label={t("tab.quiz")} active />
        {hasSimulation && (
          <TabLink href={`${basePath}/sim`} label={t("tab.simulation")} />
        )}
      </div>

      {/* Quiz or Paywall */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--text-muted)] border-t-[var(--text-accent)] rounded-full animate-spin" />
        </div>
      ) : canAccess ? (
        <QuizEngine
          questions={questions}
          topicTitle={localize(topicTitle)}
          backHref={basePath}
        />
      ) : (
        <Paywall type="quiz" />
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
