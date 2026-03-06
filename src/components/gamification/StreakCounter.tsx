"use client";

import { useProgress } from "@/lib/progress/context";
import { useI18n } from "@/lib/i18n/context";
import { motion } from "framer-motion";

export function StreakCounter() {
  const { gamification } = useProgress();
  const { t } = useI18n();

  const isActive = gamification.streakDays > 0;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${
        isActive 
          ? "border-orange-500/30 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]" 
          : "border-[var(--border-glass)] bg-[var(--bg-muted)]"
      } transition-colors cursor-pointer`}
    >
      <motion.span 
        animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className={`text-base ${isActive ? "drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "grayscale opacity-50"}`}
      >
        🔥
      </motion.span>
      <div className="text-xs">
        <span className={`font-bold ${isActive ? "text-orange-500" : "text-[var(--text-primary)]"}`}>
          {gamification.streakDays}
        </span>
        <span className={`${isActive ? "text-orange-400" : "text-[var(--text-muted)]"} ml-1`}>
          {t("progress.days")}
        </span>
      </div>
    </motion.div>
  );
}
