"use client";

import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GamificationDropdown } from "@/components/gamification/GamificationDropdown";
import { SearchModal } from "@/components/search/SearchModal";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */

const LOCALES = ["fr", "ar", "en"] as const;
type Locale = (typeof LOCALES)[number];

const LOCALE_LABELS: Record<Locale, string> = {
  fr: "FR",
  ar: "AR",
  en: "EN",
};

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

/* ─────────────────────────────────────────────
   THEME TOGGLE
   Sun ↔ Moon with spring physics
───────────────────────────────────────────── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg border border-[var(--border-glass)]" />;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-glass-bright)] hover:bg-[var(--bg-hover)] transition-colors overflow-hidden"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          /* Moon */
          <motion.span
            key="moon"
            initial={{ rotate: -45, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 45, scale: 0, opacity: 0 }}
            transition={SPRING}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </motion.span>
        ) : (
          /* Sun */
          <motion.span
            key="sun"
            initial={{ rotate: 45, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -45, scale: 0, opacity: 0 }}
            transition={SPRING}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   LANGUAGE SWITCHER
   iOS-style segmented control with layoutId gliding pill
───────────────────────────────────────────── */

interface LangSwitcherProps {
  locale: string;
  onSelect: (loc: Locale) => void;
}

function LangSwitcher({ locale, onSelect }: LangSwitcherProps) {
  return (
    <div
      className="flex items-center h-8 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-muted)] p-0.5 gap-0"
      role="group"
      aria-label="Language switcher"
    >
      {LOCALES.map((loc) => {
        const isActive = locale === loc;
        return (
          <button
            key={loc}
            onClick={() => onSelect(loc)}
            aria-pressed={isActive}
            className="relative h-full min-w-[2.1rem] px-2 rounded-[10px] text-[11px] font-bold leading-none transition-colors z-10"
            style={{
              color: isActive
                ? "white"
                : "var(--text-muted)",
            }}
          >
            {/* Gliding pill — shared layoutId so Framer Motion animates between locales */}
            {isActive && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-[10px] z-[-1]"
                style={{ background: "var(--gradient-brand)" }}
                transition={SPRING}
              />
            )}
            {LOCALE_LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */

export function Header() {
  const { t, locale, toggle: cycleLocale } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Cycle to a specific locale by calling toggle the right number of times
  const goToLocale = useCallback(
    (target: Locale) => {
      const currentIdx = LOCALES.indexOf(locale as Locale);
      const targetIdx = LOCALES.indexOf(target);
      const steps = (targetIdx - currentIdx + LOCALES.length) % LOCALES.length;
      for (let i = 0; i < steps; i++) cycleLocale?.();
    },
    [locale, cycleLocale]
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--spacing-header)] flex items-center justify-between px-4 md:px-6 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] bg-zellige backdrop-blur-xl backdrop-saturate-150">

      {/* ── Left: Logo ── */}
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 shadow-[var(--shadow-glow-crimson)]"
          style={{ background: "var(--gradient-brand)" }}
        >
          B
        </motion.div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight tracking-[-0.01em]">
            {t("site.title")}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] leading-tight font-medium">
            {t("site.subtitle")}
          </p>
        </div>
      </Link>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1.5">
        <GamificationDropdown />

        {/* Search — expanded pill on desktop */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glass-bright)] hover:bg-[var(--bg-hover)] transition-all text-xs"
          aria-label={t("search.title")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="hidden md:block text-[var(--text-muted)]">{t("search.button")}</span>
          <kbd className="hidden lg:block px-1.5 py-0.5 rounded text-[9px] bg-[var(--bg-hover)] border border-[var(--border-glass)] font-mono leading-none">⌘K</kbd>
        </button>

        {/* Search icon only (mobile) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          aria-label={t("search.title")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[var(--border-glass)] mx-0.5" />

        {/* iOS segmented language switcher */}
        <LangSwitcher locale={locale} onSelect={goToLocale} />

        <div className="w-px h-5 bg-[var(--border-glass)] mx-0.5" />

        {/* Animated theme toggle */}
        <ThemeToggle />
      </div>

      <SearchModal open={searchOpen} onClose={closeSearch} />
    </header>
  );
}

