"use client";

import { levelProgress, xpForCurrentLevel, xpToNextLevel } from "@/lib/progress/xp";
import { useProgress } from "@/lib/progress/context";
import { useI18n } from "@/lib/i18n/context";
import { motion } from "framer-motion";

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
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)]/50 backdrop-blur-md cursor-pointer hover:border-[var(--color-info-border)] transition-colors"
    >
      {/* Circle */}
      <div className="relative w-10 h-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
        <svg width="40" height="40" className="-rotate-90">
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="var(--bg-hover)"
            strokeWidth="3.5"
          />
          <motion.circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="var(--color-info)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black text-[var(--color-info)]">
            {gamification.level}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="text-xs">
        <div className="font-bold text-[var(--text-primary)]">
          {t("progress.level")} {gamification.level}
        </div>
        <div className="text-[10px] font-medium text-[var(--color-info)] opacity-80">
          {currentXP} / {currentXP + toNext} {t("progress.xp")}
        </div>
      </div>
    </motion.div>
  );
}
