"use client";

import { useMemo, useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { motion, AnimatePresence } from "framer-motion";
import type { FactionLeaderboardEntry } from "@/types/faction";
import { useI18n } from "@/lib/i18n/context";

interface FactionLeaderboardProps {
  entries: FactionLeaderboardEntry[];
  weekly?: boolean;
  userSchoolId?: string | null;
  title?: string;
}

const TREND_ICONS = {
  up: { icon: "↑", color: "#10b981" },
  down: { icon: "↓", color: "#ef4444" },
  stable: { icon: "→", color: "#6b7280" },
};

const PODIUM_COLORS = [
  { bg: "linear-gradient(135deg, #ffd700 0%, #ffb700 100%)", shadow: "rgba(255,215,0,0.4)", medal: "🥇" },
  { bg: "linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)", shadow: "rgba(192,192,192,0.4)", medal: "🥈" },
  { bg: "linear-gradient(135deg, #cd7f32 0%, #b8691e 100%)", shadow: "rgba(205,127,50,0.4)", medal: "🥉" },
];

function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`;
  return xp.toString();
}

export function FactionLeaderboard({
  entries,
  weekly = false,
  userSchoolId,
  title,
}: FactionLeaderboardProps) {
  const { locale } = useI18n();
  // URL-persisted filter — survives page refresh and is shareable
  const [filter, setFilter] = useQueryState("city", parseAsString.withDefault("all"));

  const cities = useMemo(() => {
    const set = new Set(entries.map((e) => e.school.city));
    return ["all", ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.school.city === filter)),
    [entries, filter]
  );

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => (weekly ? b.weeklyXP - a.weeklyXP : b.totalXP - a.totalXP)),
    [filtered, weekly]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {title ?? (weekly ? "🏆 Classement Hebdomadaire" : "🏫 Classement des Lycées")}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {entries.length} lycées en compétition
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <span className="animate-pulse inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
          Live
        </div>
      </div>

      {/* City filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setFilter(city)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
              filter === city
                ? "bg-[#be123c]/20 border-[#be123c]/50 text-[#be123c]"
                : "border-[var(--border-glass)] text-[var(--text-muted)] hover:border-[var(--border-glass-bright)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {city === "all" ? "Toutes les villes" : city}
          </button>
        ))}
      </div>

      {/* Podium (top 3) */}
      {sorted.length >= 3 && filter === "all" && (
        <div className="flex items-end justify-center gap-3 pt-4 pb-2 px-4">
          {/* 2nd */}
          <PodiumItem entry={sorted[1]} place={2} weekly={weekly} isUser={sorted[1].schoolId === userSchoolId} />
          {/* 1st */}
          <PodiumItem entry={sorted[0]} place={1} weekly={weekly} isUser={sorted[0].schoolId === userSchoolId} />
          {/* 3rd */}
          <PodiumItem entry={sorted[2]} place={3} weekly={weekly} isUser={sorted[2].schoolId === userSchoolId} />
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {sorted.map((entry, i) => (
          <LeaderboardRow
            key={entry.schoolId}
            entry={entry}
            rank={i + 1}
            weekly={weekly}
            isUser={entry.schoolId === userSchoolId}
          />
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)] text-sm">
            Aucune école pour cette ville
          </div>
        )}
      </div>
    </div>
  );
}

// ── Podium Item ───────────────────────────────────────────────────────────────

function PodiumItem({
  entry,
  place,
  weekly,
  isUser,
}: {
  entry: FactionLeaderboardEntry;
  place: 1 | 2 | 3;
  weekly: boolean;
  isUser: boolean;
}) {
  const colors = PODIUM_COLORS[place - 1];
  const heights = { 1: "h-24", 2: "h-16", 3: "h-12" };
  const widths = { 1: "w-32", 2: "w-28", 3: "w-28" };

  return (
    <div className={`flex flex-col items-center gap-2 ${widths[place as 1 | 2 | 3]}`}>
      {/* School name */}
      <div className={`text-center ${place === 1 ? "text-sm font-bold" : "text-xs font-medium"} text-[var(--text-primary)] line-clamp-2`}>
        {entry.school.name.replace(/^Lycée /i, "")}
      </div>
      {/* City */}
      <div className="text-xs text-[var(--text-muted)]">{entry.school.city}</div>
      {/* XP */}
      <div className={`font-bold tabular-nums ${place === 1 ? "text-base" : "text-sm"}`} style={{ color: colors.bg.includes("ffd700") ? "#ffd700" : place === 2 ? "#c0c0c0" : "#cd7f32" }}>
        {formatXP(weekly ? entry.weeklyXP : entry.totalXP)} XP
      </div>
      {/* Podium block */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: (3 - place) * 0.1 }}
        style={{ transformOrigin: "bottom", background: colors.bg, boxShadow: `0 4px 20px ${colors.shadow}` }}
        className={`w-full ${heights[place as 1 | 2 | 3]} rounded-t-lg flex items-center justify-center text-2xl relative ${isUser ? "ring-2 ring-[#d97706]" : ""}`}
      >
        {colors.medal}
        {place === 1 && (
          <div className="absolute -top-4 text-2xl animate-bounce">👑</div>
        )}
      </motion.div>
    </div>
  );
}

// ── Leaderboard Row ───────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  rank,
  weekly,
  isUser,
}: {
  entry: FactionLeaderboardEntry;
  rank: number;
  weekly: boolean;
  isUser: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const trend = TREND_ICONS[entry.trend];

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all cursor-pointer ${
        isUser
          ? "border-[#d97706]/50 bg-[#d97706]/10 shadow-[0_0_20px_rgba(217,119,6,0.15)]"
          : "border-[var(--border-glass)] bg-[var(--bg-elevated)] hover:border-[var(--border-glass-bright)]"
      }`}
      onClick={() => setExpanded((p) => !p)}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Rank */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
          rank === 2 ? "bg-slate-400/20 text-[var(--text-secondary)]" :
          rank === 3 ? "bg-amber-700/20 text-amber-600" :
          "bg-[var(--bg-muted)] text-[var(--text-muted)]"
        }`}>
          {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank}
        </div>

        {/* School info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[var(--text-primary)] truncate flex items-center gap-2">
            {entry.school.name}
            {isUser && <span className="text-xs font-normal" style={{ color: '#d97706' }}>← ton lycée</span>}
          </div>
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
            <span>{entry.school.city}</span>
            <span>·</span>
            <span>{entry.memberCount} élèves</span>
            <span>·</span>
            <span style={{ color: trend.color }}>{trend.icon} {entry.trend}</span>
          </div>
        </div>

        {/* XP */}
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-sm text-[var(--text-primary)]">
            {formatXP(weekly ? entry.weeklyXP : entry.totalXP)} XP
          </div>
          {!weekly && entry.weeklyXP > 0 && (
            <div className="text-xs text-emerald-400">+{formatXP(entry.weeklyXP)} cette semaine</div>
          )}
        </div>

        <div className={`text-[var(--text-muted)] text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▾</div>
      </div>

      {/* Expanded top contributors */}
      <AnimatePresence>
        {expanded && entry.topContributors.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-3 pb-3"
          >
            <div className="border-t border-[var(--border-glass)] pt-3 space-y-1">
              <div className="text-xs text-[var(--text-muted)] mb-2 font-medium">Top contributeurs</div>
              {entry.topContributors.slice(0, 5).map((c, i) => (
                <div key={c.userId} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{i + 1}. {c.name}</span>
                  <span className="font-medium" style={{ color: '#d97706' }}>{formatXP(c.xp)} XP</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
