"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/lib/progress/context";
import { useAuth } from "@/lib/auth/context";
import { getSchoolsByCityGrouped } from "@/lib/faction";
import type { SchoolEntry } from "@/types/faction";

/* ── Fully-styled custom select — no native popup ── */
interface SelectOption { value: string; label: string; }
interface SelectFieldProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
}
function SelectField({ value, onChange, options, placeholder, disabled }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
  }, []);

  return (
    <div ref={ref} className="relative w-full mt-1.5">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKey}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border ${
          open ? "border-[#be123c]/60" : "border-[var(--border-glass)]"
        } bg-[var(--bg-muted)] text-sm text-left transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={selected ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-muted)" strokeWidth="2"
          className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{ transformOrigin: "top" }}
            className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 max-h-56 overflow-y-auto rounded-xl border border-[var(--border-glass-bright)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] py-1"
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    opt.value === value
                      ? "bg-[#be123c]/15 text-[#be123c] font-medium"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SchoolSelectorProps {
  onJoined?: (school: SchoolEntry) => void;
}

export function SchoolSelector({ onJoined }: SchoolSelectorProps) {
  const { gamification, joinSchool } = useProgress();
  const { user } = useAuth();

  const grouped = useMemo(() => getSchoolsByCityGrouped(), []);
  const cities = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [step, setStep] = useState<"city" | "school" | "confirm" | "done">(
    gamification.schoolId ? "done" : "city"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedSchool, setJoinedSchool] = useState<SchoolEntry | null>(null);

  const schoolsInCity = selectedCity ? (grouped[selectedCity] ?? []) : [];
  const selectedSchoolObj = schoolsInCity.find((s) => s.id === selectedSchool) ?? null;

  useEffect(() => {
    if (gamification.schoolId && step === "done") {
      // Find the school info for display
      for (const schools of Object.values(grouped)) {
        const found = schools.find((s) => s.id === gamification.schoolId);
        if (found) {
          setJoinedSchool(found);
          break;
        }
      }
    }
  }, [gamification.schoolId, grouped, step]);

  async function handleJoin() {
    if (!user || !selectedSchoolObj) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/faction/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.$id, schoolId: selectedSchool }),
      });

      if (!res.ok) throw new Error("Failed to join");

      joinSchool(selectedSchool);
      setJoinedSchool(selectedSchoolObj);
      setStep("done");
      onJoined?.(selectedSchoolObj);
    } catch {
      setError("Une erreur s'est produite. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && joinedSchool) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl border border-[#d97706]/30 bg-[#d97706]/10 p-5 space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d97706]/20 flex items-center justify-center text-xl">🏫</div>
          <div>
            <div className="font-bold text-[var(--text-primary)]">{joinedSchool.name}</div>
            <div className="text-sm text-[var(--text-muted)]">{joinedSchool.city} · {joinedSchool.region}</div>
          </div>
        </div>
        <div className="text-sm font-medium" style={{ color: '#059669' }}>
          ✓ Tu représentes ce lycée — chaque XP gagné le fait monter dans le classement.
        </div>
        <button
          onClick={() => setStep("city")}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline"
        >
          Changer de lycée
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-5 space-y-4">
      <div>
        <h3 className="font-bold text-[var(--text-primary)]">🏫 Rejoins ton lycée</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Chaque quiz que tu fais contribue au score de ton lycée dans le classement national.
        </p>
      </div>

      {/* Step 1: city */}
      <div>
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Ville
        </label>
        <SelectField
          value={selectedCity}
          onChange={(val) => { setSelectedCity(val); setSelectedSchool(""); }}
          placeholder="— Choisir une ville —"
          options={cities.map((c) => ({ value: c, label: c }))}
        />
      </div>

      {/* Step 2: school */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Lycée
            </label>
            <SelectField
              value={selectedSchool}
              onChange={setSelectedSchool}
              placeholder="— Choisir un lycée —"
              options={schoolsInCity.map((s) => ({ value: s.id, label: s.name }))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview card */}
      <AnimatePresence>
        {selectedSchoolObj && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-muted)] p-3 flex items-center gap-3"
          >
            <div className="text-2xl">🏫</div>
            <div>
              <div className="font-semibold text-sm text-[var(--text-primary)]">{selectedSchoolObj.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{selectedSchoolObj.nameAr || selectedSchoolObj.city} · {selectedSchoolObj.region}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        onClick={handleJoin}
        disabled={!selectedSchool || loading || !user}
        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
        style={{ background: 'var(--gradient-moroccan)', boxShadow: 'var(--shadow-glow-crimson)' }}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Rejoindre ce lycée ⚡"
        )}
      </button>

      {!user && (
        <p className="text-xs text-center text-[var(--text-muted)]">
          Connecte-toi pour rejoindre un lycée.
        </p>
      )}
    </div>
  );
}
