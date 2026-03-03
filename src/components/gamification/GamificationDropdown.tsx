"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/lib/progress/context";
import { useI18n } from "@/lib/i18n/context";
import { levelProgress, xpForCurrentLevel, xpToNextLevel } from "@/lib/progress/xp";
import { ActivityHeatmap } from "./ActivityHeatmap";

export function GamificationDropdown() {
  const { gamification, allProgress } = useProgress();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const progress = levelProgress(gamification.xp);
  const currentXP = xpForCurrentLevel(gamification.xp);
  const toNext = xpToNextLevel(gamification.xp);

  const entries = Object.values(allProgress);
  const lessonsRead = entries.filter((e) => e.lessonRead).length;
  const quizzesTaken = entries.filter((e) => e.quizScore !== null).length;
  const avgScore =
    quizzesTaken > 0
      ? Math.round(
          entries.reduce((sum, e) => {
            if (e.quizScore !== null && e.quizTotal) {
              return sum + (e.quizScore / e.quizTotal) * 100;
            }
            return sum;
          }, 0) / quizzesTaken
        )
      : 0;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
        aria-label="Gamification stats"
      >
        {/* XP circle */}
        <div className="relative w-8 h-8">
          <svg width="32" height="32" className="-rotate-90">
            <circle cx="16" cy="16" r="12" fill="none" stroke="var(--bg-hover)" strokeWidth="2.5"/>
            <circle
              cx="16" cy="16" r="12" fill="none"
              stroke="url(#xpGrad)" strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 12}
              strokeDashoffset={2 * Math.PI * 12 * (1 - progress)}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-[var(--text-primary)]">{gamification.level}</span>
          </div>
        </div>

        {gamification.streakDays > 0 && (
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            🔥{gamification.streakDays}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] shadow-[var(--shadow-xl)] p-4 space-y-4 overflow-hidden"
          >
            {/* Subtle gradient header */}
            <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none" style={{ background: "var(--gradient-brand-subtle)" }} />

            {/* Level + XP */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {gamification.level}
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {t("progress.level")} {gamification.level}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {gamification.xp} {t("progress.totalXP")}
                </span>
              </div>

              {/* XP bar */}
              <div className="h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress * 100}%`,
                    background: "var(--gradient-brand)",
                    boxShadow: "var(--shadow-glow-indigo)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-medium">{currentXP} XP</span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium">+{toNext} XP</span>
              </div>
            </div>

            {/* Streak */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${gamification.streakDays > 0 ? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)]" : "border-[var(--border-glass)] bg-[var(--bg-muted)]"}`}>
              <span className={`text-xl ${gamification.streakDays > 0 ? "" : "grayscale opacity-40"}`}>🔥</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {gamification.streakDays} {t("progress.days")}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-medium">{t("progress.streak")}</div>
              </div>
              {gamification.streakDays > 0 && (
                <div className="text-xs font-bold text-[var(--color-warning)] px-2 py-0.5 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)]">
                  Active
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: lessonsRead, label: t("progress.lessonsRead") },
                { value: quizzesTaken, label: t("progress.quizzesTaken") },
                { value: `${avgScore}%`, label: t("progress.avgScore") },
              ].map((s) => (
                <div key={s.label} className="p-2.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-glass)] text-center">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{s.value}</div>
                  <div className="text-[9px] text-[var(--text-muted)] mt-0.5 font-medium leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Activity heatmap */}
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                7 {t("progress.days")}
              </div>
              <ActivityHeatmap />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
