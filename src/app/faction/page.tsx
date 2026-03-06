"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FactionLeaderboard } from "@/components/faction/FactionLeaderboard";
import { SchoolSelector } from "@/components/faction/SchoolSelector";
import { useProgress } from "@/lib/progress/context";
import { useAuth } from "@/lib/auth/context";
import type { FactionLeaderboardResponse } from "@/types/faction";

export default function FactionPage() {
  const { gamification } = useProgress();
  const { user } = useAuth();
  const [board, setBoard] = useState<FactionLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"global" | "weekly">("global");

  useEffect(() => {
    fetch("/api/faction/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        // Only set board if it's a valid leaderboard response
        if (data && Array.isArray(data.global)) setBoard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-[var(--border-glass)] p-8 text-center"
        style={{ background: "var(--gradient-brand-subtle)" }}
      >
        {/* Background glow particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 blur-2xl"
              style={{
                width: `${60 + i * 20}px`,
                height: `${60 + i * 20}px`,
                background: i % 2 === 0 ? "#e11d48" : "#059669",
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="text-5xl mb-4">⚔️</div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Lycée vs. Lycée</h1>
          <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
            Chaque XP que tu gagnes propulse ton lycée dans le classement national.
            Défends l&apos;honneur de ta ville. Écrase la concurrence.
          </p>
          {board && (
            <div className="flex items-center justify-center gap-6 mt-5">
              <Stat label="Lycées en compétition" value={board.totalSchools.toString()} />
              <div className="w-px h-8 bg-[var(--border-glass-bright)]" />
              <Stat label="Élèves actifs" value={board.totalStudents.toString()} />
              {board.global[0] && (
                <>
                  <div className="w-px h-8 bg-[var(--border-glass-bright)]" />
                  <Stat label="En tête" value={board.global[0].school.city} />
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* School selector */}
      <SchoolSelector />

      {/* Leaderboard */}
      <div>
        {/* Tab selector */}
        <div className="flex gap-2 mb-4">
          {(["global", "weekly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                tab === t
                  ? "bg-[#be123c]/20 border-[#be123c]/50 text-[#be123c]"
                  : "border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glass-bright)]"
              }`}
            >
              {t === "global" ? "🌍 All time" : "📅 Cette semaine"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[var(--bg-elevated)] animate-pulse" />
            ))}
          </div>
        ) : board ? (
          <FactionLeaderboard
            entries={tab === "global" ? board.global : board.weekly}
            weekly={tab === "weekly"}
            userSchoolId={gamification.schoolId}
          />
        ) : (
          <div className="text-center py-12 text-[var(--text-muted)]">
            Impossible de charger le classement.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[var(--text-primary)] font-bold text-xl">{value}</div>
      <div className="text-[var(--text-muted)] text-xs mt-0.5">{label}</div>
    </div>
  );
}
