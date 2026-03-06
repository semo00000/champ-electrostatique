"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { BossWithProgress } from "@/types/boss";
import { useI18n } from "@/lib/i18n/context";

interface BossCardProps {
  boss: BossWithProgress;
  onAttempt?: (bossId: string) => void;
}

const DIFFICULTY_LABELS = ["", "Facile", "Modéré", "Difficile", "Très difficile", "Légendaire"];
const DIFFICULTY_COLORS = ["", "#10b981", "#d97706", "#f59e0b", "#e11d48", "#be123c"];
const STATUS_CONFIG = {
  locked: { label: "Verrouillé", icon: "🔒", color: "#6b7280" },
  unlocked: { label: "Déverrouillé", icon: "⚡", color: "#fbbf24" },
  attempted: { label: "En cours", icon: "⚔️", color: "#f97316" },
  defeated: { label: "Vaincu", icon: "💀", color: "#10b981" },
};

export function BossCard({ boss, onAttempt }: BossCardProps) {
  const { locale } = useI18n();
  const status = boss.progress.status;
  const cfg = STATUS_CONFIG[status];
  const diffColor = DIFFICULTY_COLORS[boss.difficulty];
  const title = locale === "ar" ? boss.titleAr : boss.title;
  const flavor = locale === "ar" ? boss.flavorAr : boss.flavor;

  const scoreOutOf20 = boss.progress.bestScore !== null
    ? Math.round((boss.progress.bestScore / boss.totalPoints) * 20 * 10) / 10
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={status !== "locked" ? { scale: 1.01, y: -2 } : {}}
      className="relative rounded-2xl overflow-hidden border transition-all"
      style={{
        border: status === "defeated"
          ? "1px solid rgba(16, 185, 129, 0.4)"
          : status === "unlocked"
          ? "1px solid rgba(251, 191, 36, 0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: status === "defeated"
          ? "0 0 30px rgba(16,185,129,0.15)"
          : status === "unlocked"
          ? "0 0 30px rgba(251,191,36,0.1)"
          : "none",
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: boss.bgGradient, opacity: status === "locked" ? 0.4 : 0.8 }}
      />

      {/* Locked overlay */}
      {status === "locked" && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2">🔒</div>
            <div className="text-white/60 text-sm">Complète les quêtes pour débloquer</div>
          </div>
        </div>
      )}

      {/* Defeated shimmer */}
      {status === "defeated" && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, transparent 60%)" }} />
      )}

      <div className="relative z-20 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{boss.iconEmoji}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${diffColor}20`, color: diffColor, border: `1px solid ${diffColor}40` }}
                >
                  {DIFFICULTY_LABELS[boss.difficulty]}
                </span>
                <span className="text-xs text-white/50">{boss.examYear}</span>
              </div>
              <h3 className="font-bold text-white text-sm leading-tight max-w-[240px]">
                {title.replace(/Examen National \d{4} – /i, "")}
              </h3>
            </div>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </div>
        </div>

        {/* Flavor text */}
        <p className="text-sm text-white/60 italic leading-relaxed">
          &quot;{flavor}&quot;
        </p>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5">
          {boss.topics.slice(0, 4).map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white/60">
              {t}
            </span>
          ))}
        </div>

        {/* Requirements progress */}
        {status !== "defeated" && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              Conditions d&apos;accès
            </div>
            {boss.requirementProgress.map((rp, i) => {
              const pct = Math.min(1, rp.currentValue / rp.requirement.value);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={rp.met ? "text-emerald-400" : "text-white/50"}>
                      {rp.met ? "✓ " : ""}{rp.requirement.label}
                    </span>
                    <span className="text-white/40">
                      {rp.currentValue}/{rp.requirement.value}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: rp.met ? "#10b981" : "#be123c" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Best score (if attempted/defeated) */}
        {scoreOutOf20 !== null && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Meilleur score :</span>
            <span
              className="font-bold"
              style={{ color: scoreOutOf20 >= boss.passThreshold ? "#10b981" : "#f97316" }}
            >
              {scoreOutOf20}/20
              {status === "defeated" && " 🏆"}
            </span>
            <span className="text-white/30 text-xs">(seuil : {boss.passThreshold}/20)</span>
          </div>
        )}

        {/* Rewards preview */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Récompenses :</span>
          <div className="flex gap-1.5">
            {boss.rewards.map((r) => (
              <span
                key={r.id}
                className="text-xs px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              >
                {r.type === "profile_frame" ? "🖼️" : r.type === "baccoins" ? "🪙" : "🏅"} {r.label.slice(0, 20)}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        {status !== "locked" && onAttempt && (
          <button
            onClick={() => onAttempt(boss.id)}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
              status === "defeated"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            {status === "defeated" ? "Refaire le boss ↺" : status === "attempted" ? "Relever le défi ⚔️" : "Commencer le combat ⚡"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
