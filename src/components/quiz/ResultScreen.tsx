"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";

interface ResultScreenProps {
  score: number;
  total: number;
  topicTitle: string;
  backHref: string;
  onRetry: () => void;
  onReview: () => void;
}

export function ResultScreen({ score, total, topicTitle, backHref, onRetry, onReview }: ResultScreenProps) {
  const { t } = useI18n();
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    if (percentage < 50) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    import("canvas-confetti").then(({ default: fire }) => {
      if (percentage === 100) {
        fire({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ["#FFD700", "#FFA500", "#6366f1", "#10b981"] });
        setTimeout(() => fire({ particleCount: 60, spread: 120, origin: { y: 0.55 } }), 350);
      } else if (percentage >= 80) {
        fire({ particleCount: 80, spread: 65, origin: { y: 0.6 }, colors: ["#6366f1", "#8b5cf6", "#10b981"] });
      } else {
        fire({ particleCount: 40, spread: 45, origin: { y: 0.6 } });
      }
    }).catch(() => {});
  }, [percentage]);

  const gradeConfig =
    percentage === 100
      ? { message: t("quiz.excellent"), color: "var(--color-success)", glow: "var(--shadow-glow-success)", emoji: "🏆" }
      : percentage >= 80
      ? { message: t("quiz.good"), color: "var(--color-success)", glow: "var(--shadow-glow-success)", emoji: "⭐" }
      : percentage >= 50
      ? { message: t("quiz.average"), color: "var(--color-warning)", glow: "none", emoji: "📚" }
      : { message: t("quiz.poor"), color: "var(--color-error)", glow: "var(--shadow-glow-error)", emoji: "💪" };

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColor =
    percentage >= 80 ? "#10b981"
    : percentage >= 50 ? "#f59e0b"
    : "#f87171";

  return (
    <div className="max-w-sm mx-auto text-center py-10 space-y-8">
      {/* Score circle */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
        className="relative inline-block"
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{ background: gradeConfig.color }}
        />

        <svg width="160" height="160" className="-rotate-90 relative">
          {/* Track */}
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--bg-hover)" strokeWidth="9"/>
          {/* Progress */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${strokeColor}80)` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-4xl font-bold text-[var(--text-primary)] leading-none">{percentage}%</span>
          <span className="text-sm text-[var(--text-muted)] font-medium">{score}/{total}</span>
        </div>
      </motion.div>

      {/* Grade */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="space-y-2"
      >
        <div className="text-3xl">{gradeConfig.emoji}</div>
        <h2 className="text-2xl font-bold" style={{ color: gradeConfig.color }}>
          {gradeConfig.message}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">{topicTitle}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="flex flex-col gap-2.5"
      >
        <button
          onClick={onRetry}
          className="w-full px-5 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow-indigo)" }}
        >
          {t("quiz.retry")}
        </button>
        <button
          onClick={onReview}
          className="w-full px-5 py-3 rounded-xl border border-[var(--border-glass-bright)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-hover)] hover:border-[var(--border-accent)] active:scale-[0.98] transition-all"
        >
          {t("quiz.review")}
        </button>
        <Link
          href={backHref}
          className="w-full px-5 py-2.5 rounded-xl text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors text-center"
        >
          {t("quiz.back")}
        </Link>
      </motion.div>
    </div>
  );
}
