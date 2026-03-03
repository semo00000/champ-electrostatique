"use client";

import { levelProgress, xpForCurrentLevel, xpToNextLevel } from "@/lib/progress/xp";
import { useProgress } from "@/lib/progress/context";
import { useI18n } from "@/lib/i18n/context";

export function XPBar() {
  const { gamification } = useProgress();
  const { t } = useI18n();

  const progress = levelProgress(gamification.xp);
  const currentXP = xpForCurrentLevel(gamification.xp);
  const toNext = xpToNextLevel(gamification.xp);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex items-center gap-2">
      {/* Circle */}
      <div className="relative w-10 h-10">
        <svg width="40" height="40" className="-rotate-90">
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="var(--bg-hover)"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="var(--color-info)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[var(--text-primary)]">
            {gamification.level}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="text-xs">
        <div className="font-medium text-[var(--text-primary)]">
          {t("progress.level")} {gamification.level}
        </div>
        <div className="text-[var(--text-muted)]">
          {currentXP}/{currentXP + toNext} {t("progress.xp")}
        </div>
      </div>
    </div>
  );
}
