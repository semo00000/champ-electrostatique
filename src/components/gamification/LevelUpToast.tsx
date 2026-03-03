"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "@/lib/progress/context";
import { useI18n } from "@/lib/i18n/context";

export function LevelUpToast() {
  const { levelUpEvent, clearLevelUp } = useProgress();
  const { t } = useI18n();

  useEffect(() => {
    if (levelUpEvent === null) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.82 },
        colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#f59e0b", "#10b981"],
      });
      setTimeout(() => {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.82 }, angle: 60 });
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.82 }, angle: 120 });
      }, 200);
    }

    const timer = setTimeout(clearLevelUp, 4500);
    return () => clearTimeout(timer);
  }, [levelUpEvent, clearLevelUp]);

  return (
    <AnimatePresence>
      {levelUpEvent !== null && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] cursor-pointer"
          onClick={clearLevelUp}
        >
          <div
            className="relative px-5 py-3.5 rounded-2xl flex items-center gap-4 overflow-hidden"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-glass-bright)",
              boxShadow: "var(--shadow-xl), var(--shadow-glow-indigo)",
            }}
          >
            {/* Animated gradient bg */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: "var(--gradient-brand)" }}
            />

            {/* Level badge */}
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow-indigo)" }}
            >
              {levelUpEvent}
            </div>

            {/* Text */}
            <div className="relative">
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {t("progress.levelUp")}
              </div>
              <div className="text-xs text-[var(--text-accent)] font-semibold">
                {t("progress.level")} {levelUpEvent}
              </div>
            </div>

            {/* Stars */}
            <div className="relative flex gap-0.5">
              {["✦", "✦", "✦"].map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 350 }}
                  className="text-yellow-400 text-sm"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
