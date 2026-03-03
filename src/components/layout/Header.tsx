"use client";

import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { GamificationDropdown } from "@/components/gamification/GamificationDropdown";
import { SearchModal } from "@/components/search/SearchModal";

const LOCALE_LABELS: Record<string, string> = {
  fr: "FR",
  ar: "AR",
  en: "EN",
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const { t, locale, toggle: cycleLocale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMounted(true), []);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--spacing-header)] flex items-center justify-between px-4 md:px-6 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-xl backdrop-saturate-150">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 transition-shadow group-hover:shadow-[var(--shadow-glow-indigo)]"
          style={{ background: "var(--gradient-brand)" }}
        >
          B
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight tracking-[-0.01em]">
            {t("site.title")}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] leading-tight font-medium">
            {t("site.subtitle")}
          </p>
        </div>
      </Link>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        <GamificationDropdown />

        {/* Search — expanded on desktop */}
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

        {/* Language — cycles FR → AR → EN → FR */}
        <button
          onClick={cycleLocale}
          title={t(`lang.${locale}`)}
          className="h-8 min-w-[2.5rem] px-2.5 flex items-center justify-center rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-accent)] hover:bg-[var(--color-info-bg)] hover:border-[var(--color-info-border)] transition-all text-[11px] font-bold tracking-wide"
          aria-label={`Language: ${t(`lang.${locale}`)}`}
        >
          {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
        </button>

        {/* Theme */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-glass-bright)] transition-all"
            aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
            title={theme === "dark" ? t("theme.light") : t("theme.dark")}
          >
            {theme === "dark" ? (
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
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <SearchModal open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
