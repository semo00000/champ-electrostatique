"use client";

import { useProgress } from "@/lib/progress/context";
import { useI18n } from "@/lib/i18n/context";

export function StreakCounter() {
  const { gamification } = useProgress();
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-base ${gamification.streakDays > 0 ? "" : "grayscale opacity-50"}`}>
        🔥
      </span>
      <div className="text-xs">
        <span className="font-medium text-[var(--text-primary)]">
          {gamification.streakDays}
        </span>
        <span className="text-[var(--text-muted)] ml-1">
          {t("progress.days")}
        </span>
      </div>
    </div>
  );
}
