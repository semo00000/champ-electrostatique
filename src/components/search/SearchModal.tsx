"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { searchEntries, type SearchEntry } from "@/lib/search/index";
import { SUBJECT_COLORS } from "@/types/curriculum";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { t, localize } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(searchEntries(query));
      setActiveIndex(0);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Keyboard shortcut to open (Ctrl+K)
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        // Will be handled by parent
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  const navigate = useCallback(
    (entry: SearchEntry) => {
      router.push(entry.path);
      onClose();
    },
    [router, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      navigate(results[activeIndex]);
    } else if (e.key === "Escape") {
      onClose();
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
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[71] w-[90%] max-w-lg rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-glass)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("search.placeholder")}
                className="flex-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <kbd className="hidden sm:block text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border-glass)] bg-[var(--bg-muted)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                  {t("search.noResults")}
                </div>
              )}

              {results.map((entry, i) => (
                <button
                  key={entry.path}
                  onClick={() => navigate(entry)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i === activeIndex
                      ? "bg-[var(--bg-hover)]"
                      : "hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {/* Subject color dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: SUBJECT_COLORS[entry.subject],
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {localize(entry.title)}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      {localize(entry.subjectTitle)} &middot; {entry.year}/{entry.filiere}
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {entry.hasSim && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        SIM
                      </span>
                    )}
                    {entry.status === "planned" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                        Soon
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="px-4 py-2 border-t border-[var(--border-glass)] flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                <span>
                  <kbd className="px-1 py-0.5 rounded border border-[var(--border-glass)] bg-[var(--bg-muted)]">
                    ↑↓
                  </kbd>{" "}
                  navigate
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded border border-[var(--border-glass)] bg-[var(--bg-muted)]">
                    ↵
                  </kbd>{" "}
                  open
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
