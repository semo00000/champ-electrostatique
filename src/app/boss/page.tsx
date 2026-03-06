"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BossMap } from "@/components/boss/BossMap";
import { useProgress } from "@/lib/progress/context";
import { useAuth } from "@/lib/auth/context";
import { computeBossWithProgress, getDefaultBossProgress } from "@/lib/boss";
import { BOSS_FIGHTS } from "@/lib/boss/data";
import type { BossWithProgress, BossProgress } from "@/types/boss";

export default function BossPage() {
  const { gamification, allProgress } = useProgress();
  const { user } = useAuth();
  const router = useRouter();

  const [bossProgresses, setBossProgresses] = useState<Record<string, BossProgress>>({});
  const [bosses, setBosses] = useState<BossWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/boss/status?userId=${user.$id}`);
      if (res.ok) {
        const data = await res.json();
        // API returns { statuses: [{ bossId, progress }] }
        const map: Record<string, BossProgress> = {};
        if (Array.isArray(data.statuses)) {
          for (const entry of data.statuses) {
            map[entry.bossId] = entry.progress;
          }
        }
        setBossProgresses(map);
      }
    } catch (e) {
      console.warn("Boss status fetch failed", e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  useEffect(() => {
    const computed = BOSS_FIGHTS.map((boss) =>
      computeBossWithProgress(
        boss,
        bossProgresses[boss.id] ?? getDefaultBossProgress(boss.id, user?.$id ?? ""),
        gamification,
        allProgress
      )
    );
    setBosses(computed);
  }, [gamification, allProgress, bossProgresses, user]);

  const handleAttempt = (bossId: string) => {
    const boss = BOSS_FIGHTS.find((b) => b.id === bossId);
    if (!boss) return;
    // Navigate to the exam for this boss (uses examId which maps to a lesson/exam route)
    router.push(`/exam/${bossId}`);
  };

  const defeatedCount = bosses.filter((b) => b.progress.status === "defeated").length;
  const totalXpFromBosses = bosses
    .filter((b) => b.progress.status === "defeated")
    .reduce((acc, b) => acc + b.difficulty * 100, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-[var(--border-glass)] p-8"
        style={{ background: "var(--gradient-brand-subtle)" }}
      >
        {/* BG particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-3xl opacity-10"
              style={{
                width: `${100 + i * 30}px`,
                height: `${100 + i * 30}px`,
                background: i % 2 === 0 ? "#e11d48" : "#d97706",
                left: `${10 + i * 18}%`,
                top: i % 2 === 0 ? "10%" : "40%",
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="text-8xl select-none">💀</div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Boss Fights</h1>
            <p className="text-[var(--text-muted)] max-w-lg text-sm leading-relaxed">
              Ces examens nationaux sont les derniers gardiens avant la mention. Prouve que tu es prêt.
              Chaque boss vaincu t&apos;apporte XP, BacCoins et un badge exclusif.
            </p>
            {defeatedCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-4 rounded-xl bg-[var(--bg-muted)] px-4 py-2 border border-[var(--border-glass)]">
                <span className="text-sm text-[var(--text-muted)]">
                  <span className="text-emerald-500 font-bold">{defeatedCount}</span>/{BOSS_FIGHTS.length} vaincus
                </span>
                {totalXpFromBosses > 0 && (
                  <span className="text-sm text-[var(--text-muted)]">
                    <span className="font-bold" style={{ color: '#d97706' }}>+{totalXpFromBosses.toLocaleString()}</span> XP gagné
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Boss grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-[var(--bg-elevated)] animate-pulse" />
          ))}
        </div>
      ) : (
        <BossMap bosses={bosses} onAttempt={user ? handleAttempt : undefined} />
      )}

      {!user && (
        <div className="text-center py-8 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-elevated)]">
          <div className="text-3xl mb-3">🔐</div>
          <p className="text-[var(--text-muted)] mb-4">
            Connecte-toi pour suivre ta progression et gagner des récompenses
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: 'var(--gradient-moroccan)', boxShadow: 'var(--shadow-glow-crimson)' }}
          >
            Se connecter
          </button>
        </div>
      )}
    </div>
  );
}
