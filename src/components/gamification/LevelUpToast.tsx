"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "@/lib/progress/context";
import { useI18n } from "@/lib/i18n/context";
import { ZelligeSVG, GoldCornerAccent } from "@/components/ui/MoroccanDecor";

export function LevelUpToast() {
  const { levelUpEvent, clearLevelUp } = useProgress();
  const { t } = useI18n();

  useEffect(() => {
    if (levelUpEvent === null) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.82 },
        colors: ["#e11d48", "#be123c", "#fbbf24", "#f59e0b", "#10b981"],
      });
      setTimeout(() => {
        confetti({ particleCount: 50, spread: 55, origin: { y: 0.82 }, angle: 55 });
        confetti({ particleCount: 50, spread: 55, origin: { y: 0.82 }, angle: 125 });
      }, 220);
    }

    const timer = setTimeout(clearLevelUp, 4800);
    return () => clearTimeout(timer);
  }, [levelUpEvent, clearLevelUp]);

  return (
    <AnimatePresence>
      {levelUpEvent !== null && (
        <motion.div
          initial={{ opacity: 0, y: 64, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.93 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] cursor-pointer"
          onClick={clearLevelUp}
        >
          {/* Royal decree card */}
          <div
            className="relative px-6 py-4 rounded-2xl flex items-center gap-5 overflow-hidden min-w-[280px]"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid rgba(217,119,6,0.55)",
              boxShadow: "0 0 48px rgba(217,119,6,0.18), 0 0 0 1px rgba(217,119,6,0.1), var(--shadow-xl)",
            }}
          >
            {/* Zellige watermark */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <ZelligeSVG variant="8star" opacity={0.025} color="#d97706" size={52} />
            </div>

            {/* Gold top strip */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: "var(--gradient-moroccan)" }}
            />

            {/* Gold corner accents */}
            <GoldCornerAccent position="top-left" size={20} />
            <GoldCornerAccent position="top-right" size={20} />
            <GoldCornerAccent position="bottom-left" size={20} />
            <GoldCornerAccent position="bottom-right" size={20} />

            {/* Level badge (medallion) */}
            <div className="relative shrink-0">
              <div
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-extrabold text-xl leading-none"
                style={{
                  background: "var(--gradient-moroccan)",
                  boxShadow: "var(--shadow-glow-crimson), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <span className="text-[10px] font-semibold opacity-70 tracking-widest uppercase mb-0.5">Lv</span>
                {levelUpEvent}
              </div>
              {/* Glow ring */}
              <div
                className="absolute -inset-1 rounded-2xl opacity-30 pointer-events-none"
                style={{ border: "1px solid #d97706" }}
              />
            </div>

            {/* Text */}
            <div className="relative flex-1">
              <div
                className="text-xs font-bold uppercase tracking-[0.15em] mb-0.5"
                style={{ color: "#d97706" }}
              >
                ✦ {t("progress.levelUp")} ✦
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] leading-tight">
                {t("progress.level")} {levelUpEvent}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                {t("progress.levelUpDesc") ?? "Keep up the great work!"}
              </div>
            </div>

            {/* Animated stars */}
            <div className="relative flex flex-col gap-1 items-center shrink-0">
              {["✦", "✦", "✦"].map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.12 + i * 0.09, type: "spring", stiffness: 380, damping: 16 }}
                  className="text-sm leading-none"
                  style={{ color: i === 1 ? "#e11d48" : "#d97706" }}
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
