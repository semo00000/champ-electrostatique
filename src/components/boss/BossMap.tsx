"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BossCard } from "./BossCard";
import type { BossWithProgress } from "@/types/boss";

interface BossMapProps {
  bosses: BossWithProgress[];
  onAttempt?: (bossId: string) => void;
}

const FILTER_OPTIONS = [
  { id: "all", label: "Tous", icon: "⚡" },
  { id: "physique-chimie", label: "Physique-Chimie", icon: "⚗️" },
  { id: "mathematiques", label: "Maths", icon: "📐" },
  { id: "svt", label: "SVT", icon: "🔬" },
  { id: "sm", label: "SM", icon: "🧮" },
  { id: "sp", label: "SP", icon: "🔭" },
] as const;

const YEAR_OPTIONS = [2024, 2023, 2022, 2021, 2020, 2019];

type FilterId = (typeof FILTER_OPTIONS)[number]["id"];

export function BossMap({ bosses, onAttempt }: BossMapProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "defeated">("all");

  const filtered = bosses.filter((b) => {
    if (filter !== "all") {
      if (filter === "sm" || filter === "sp") {
        if (!b.filiere.toLowerCase().includes(filter)) return false;
      } else {
        if (!b.subject.toLowerCase().includes(filter.split("-")[0])) return false;
      }
    }
    if (yearFilter && b.examYear !== yearFilter) return false;
    if (statusFilter !== "all") {
      if (statusFilter === "unlocked" && !["unlocked", "attempted"].includes(b.progress.status)) return false;
      if (statusFilter === "defeated" && b.progress.status !== "defeated") return false;
    }
    return true;
  });

  const defeatedCount = bosses.filter((b) => b.progress.status === "defeated").length;
  const unlockedCount = bosses.filter((b) => ["unlocked", "attempted"].includes(b.progress.status)).length;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon="💀" label="Vaincus" value={defeatedCount} color="#10b981" />
        <StatPill icon="⚡" label="Déverrouillés" value={unlockedCount} color="#fbbf24" />
        <StatPill icon="🔒" label="Verrouillés" value={bosses.length - defeatedCount - unlockedCount} color="#6b7280" />
      </div>

      {/* Subject filter */}
      <div>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all border ${
                filter === opt.id
                  ? "bg-[#be123c]/20 border-[#be123c]/50 text-[#be123c]"
                  : "border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glass-bright)]"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Year + status filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setYearFilter(null)}
            className={`px-3 py-1 rounded-lg text-xs border ${yearFilter === null ? "border-[#be123c]/50 text-[#be123c] bg-[#be123c]/10" : "border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          >
            Toutes années
          </button>
          {YEAR_OPTIONS.map((y) => (
            <button
              key={y}
              onClick={() => setYearFilter(y === yearFilter ? null : y)}
              className={`px-3 py-1 rounded-lg text-xs border ${yearFilter === y ? "border-[#be123c]/50 text-[#be123c] bg-[#be123c]/10" : "border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          {(["all", "unlocked", "defeated"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs border ${statusFilter === s ? "border-[#be123c]/50 text-[#be123c] bg-[#be123c]/10" : "border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              {s === "all" ? "Tous" : s === "unlocked" ? "⚡ Dispo" : "💀 Vaincus"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="text-4xl mb-3">🏜️</div>
          <div>Aucun boss pour ce filtre.</div>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {filtered.map((boss, i) => (
            <motion.div key={boss.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <BossCard boss={boss} onAttempt={onAttempt} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function StatPill({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-xl border"
      style={{ background: `${color}18`, borderColor: `${color}40` }}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <div className="font-bold text-lg leading-none" style={{ color }}>{value}</div>
        <div className="text-xs mt-0.5 text-[var(--text-secondary)]">{label}</div>
      </div>
    </div>
  );
}
