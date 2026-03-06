"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/lib/progress/context";
import { BACCOINS_STREAK_FREEZE_COST } from "@/types/progress";

interface StreakFreezeModalProps {
  open: boolean;
  onClose: () => void;
}

export function StreakFreezeModal({ open, onClose }: StreakFreezeModalProps) {
  const { gamification, buyStreakFreeze } = useProgress();
  const [buying, setBuying] = useState(false);
  const [result, setResult] = useState<"success" | "fail" | null>(null);

  const canAfford = gamification.bacCoins >= BACCOINS_STREAK_FREEZE_COST;

  const handleBuy = async () => {
    setBuying(true);
    const ok = buyStreakFreeze();
    await new Promise((r) => setTimeout(r, 500));
    setResult(ok ? "success" : "fail");
    setBuying(false);
    if (ok) {
      setTimeout(() => {
        setResult(null);
        onClose();
      }, 1500);
    } else {
      setTimeout(() => setResult(null), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] shadow-[var(--shadow-xl)] overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-6 text-center"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)" }}
              >
                <div className="text-6xl mb-3">🧊</div>
                <h2 className="text-xl font-black text-[var(--text-primary)]">Freeze de Streak</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Protège ta flamme pour un jour d&apos;absence
                </p>
              </div>

              <div className="p-5 space-y-4">
                {/* Current freeze count */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-glass)]">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧊</span>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Freezes possédés</div>
                      <div className="text-xs text-[var(--text-muted)]">Utilisé automatiquement</div>
                    </div>
                  </div>
                  <span className="text-2xl font-black" style={{ color: '#059669' }}>
                    {gamification.streakFreezeCount}
                  </span>
                </div>

                {/* How it works */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Comment ça marche
                  </div>
                  {[
                    "Si tu rates un jour, le freeze s'active automatiquement",
                    "Ta flamme est préservée pour cette journée manquée",
                    "Un seul freeze peut être utilisé par semaine",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="mt-0.5 flex-shrink-0" style={{ color: '#d97706' }}>✶</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                {/* Buy section */}
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    background: "rgba(251,191,36,0.05)",
                    borderColor: "rgba(251,191,36,0.2)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Acheter 1 freeze</span>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <span>🪙</span>
                      <span>{BACCOINS_STREAK_FREEZE_COST}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
                    <span>Ton solde</span>
                    <span className="text-yellow-400 font-semibold">🪙 {gamification.bacCoins}</span>
                  </div>

                  {!canAfford && (
                    <div className="text-xs text-red-400 mb-2 text-center">
                      Pas assez de BacCoins (manque {BACCOINS_STREAK_FREEZE_COST - gamification.bacCoins} 🪙)
                    </div>
                  )}

                  <button
                    onClick={handleBuy}
                    disabled={!canAfford || buying || result === "success"}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: result === "success" ? "#10b981" : result === "fail" ? "#ef4444" : canAfford ? "#fbbf24" : "#374151",
                      color: result === "success" || result === "fail" ? "white" : "black",
                    }}
                  >
                    {buying ? "Achat en cours..." : result === "success" ? "✓ Acheté !" : result === "fail" ? "✗ Échec" : "Acheter"}
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
