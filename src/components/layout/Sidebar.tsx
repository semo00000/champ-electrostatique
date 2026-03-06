"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Curriculum } from "@/types/curriculum";
import { SUBJECT_COLORS } from "@/types/curriculum";
import type { SubjectId } from "@/types/curriculum";
import { useProgress } from "@/lib/progress/context";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 56;

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────────
   SUBJECT ICONS
───────────────────────────────────────────── */

function PhysiqueIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="2.5" fill="currentColor" strokeWidth="0" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function ChimieIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3h6v6l4.5 7.5A2 2 0 0 1 17.8 20H6.2a2 2 0 0 1-1.7-3.5L9 9V3" />
      <path d="M6.5 3h11" />
      <circle cx="10" cy="16" r="1" fill="currentColor" strokeWidth="0" />
      <circle cx="14.5" cy="13.5" r="0.8" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}

function MathsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
      <polyline points="16 4 5 4 11.5 12 5 20 16 20" />
    </svg>
  );
}

function SvtIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

const SUBJECT_ICONS: Record<SubjectId, () => JSX.Element> = {
  physique: PhysiqueIcon,
  chimie: ChimieIcon,
  maths: MathsIcon,
  svt: SvtIcon,
};

/* ─────────────────────────────────────────────
   CHEVRON ICON (animated rotation via parent)
───────────────────────────────────────────── */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.25, ease: EASE_EXPO }}
      style={{ display: "block", flexShrink: 0 }}
    >
      <polyline points="9 18 15 12 9 6" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS DOT — 3-tier indicator
   not started → lesson read → quiz done
───────────────────────────────────────────── */

function ProgressDot({
  color,
  lessonRead,
  quizDone,
}: {
  color: string;
  lessonRead: boolean;
  quizDone: boolean;
}) {
  if (quizDone) {
    // Solid filled dot with glow — quiz completed
    return (
      <span
        className="shrink-0 w-1.5 h-1.5 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    );
  }
  if (lessonRead) {
    // Ring only — lesson read, quiz not done
    return (
      <span
        className="shrink-0 w-1.5 h-1.5 rounded-full border"
        style={{ borderColor: color, opacity: 0.75 }}
      />
    );
  }
  return null;
}

/* ─────────────────────────────────────────────
   HOME ICON
───────────────────────────────────────────── */

function HomeIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      {!filled && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   COLLAPSE TOGGLE ICON
───────────────────────────────────────────── */

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      animate={{ rotate: collapsed ? 180 : 0 }}
      transition={{ duration: 0.3, ease: EASE_EXPO }}
    >
      <polyline points="15 18 9 12 15 6" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────
   SUBJECT ACCORDION
───────────────────────────────────────────── */

function SubjectAccordion({
  yearId,
  filiereId,
  subjectId,
  subject,
  pathname,
  allProgress,
  localize,
}: {
  yearId: string;
  filiereId: string;
  subjectId: string;
  subject: { title: { fr: string; ar: string }; topics: Array<{ id: string; title: { fr: string; ar: string }; status: string; simulation: string | null }> };
  pathname: string;
  allProgress: Record<string, { lessonRead: boolean; quizScore: number | null; quizTotal: number | null }>;
  localize: (text: { fr: string; ar: string }) => string;
}) {
  const subjectPath = `/${yearId}/${filiereId}/${subjectId}`;
  const isSubjectActive = pathname.startsWith(subjectPath);
  const color = SUBJECT_COLORS[subjectId as SubjectId] ?? "#818cf8";
  const Icon = SUBJECT_ICONS[subjectId as SubjectId];

  // Auto-open accordion when a topic under this subject is active
  const [open, setOpen] = useState(isSubjectActive);

  useEffect(() => {
    if (isSubjectActive) setOpen(true);
  }, [isSubjectActive]);

  return (
    <div>
      {/* Subject accordion header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200"
        style={
          isSubjectActive
            ? {
                color,
                background: `${color}15`,
                boxShadow: `inset 3px 0 0 ${color}, 0 0 18px ${color}1a`,
                fontWeight: 600,
              }
            : {
                color: "var(--text-secondary)",
              }
        }
      >
        <span
          className="shrink-0 transition-colors"
          style={{ color: isSubjectActive ? color : "var(--text-muted)" }}
        >
          {Icon && <Icon />}
        </span>

        <span className="truncate leading-snug flex-1 text-start">
          {localize(subject.title)}
        </span>

        <ChevronIcon open={open} />
      </button>

      {/* Topics accordion panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="topics"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_EXPO }}
            style={{ overflow: "hidden" }}
          >
            <div className="ms-5 mt-0.5 mb-1 space-y-0.5 border-s border-[var(--border-glass)] ps-2">
              {subject.topics.map((topic) => {
                const topicKey = `${yearId}/${filiereId}/${subjectId}/${topic.id}`;
                const topicPath = `${subjectPath}/${topic.id}`;
                const isActive = pathname === topicPath || pathname.startsWith(topicPath + "/");
                const isPlanned = topic.status === "planned";
                const prog = allProgress[topicKey];
                const lessonRead = prog?.lessonRead ?? false;
                const quizDone = prog?.quizScore != null && prog.quizScore > 0;

                const content = (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: isPlanned ? 0.45 : 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: EASE_EXPO }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] leading-snug transition-all duration-200"
                    style={
                      isActive
                        ? {
                            color,
                            background: `${color}15`,
                            boxShadow: `inset 3px 0 0 ${color}, 0 0 14px ${color}22`,
                            fontWeight: 600,
                            cursor: "default",
                          }
                        : isPlanned
                        ? {
                            color: "var(--text-muted)",
                            cursor: "default",
                          }
                        : {
                            color: "var(--text-muted)",
                          }
                    }
                  >
                    <span className="truncate flex-1">{localize(topic.title)}</span>
                    {!isPlanned && (
                      <ProgressDot
                        color={color}
                        lessonRead={lessonRead}
                        quizDone={quizDone}
                      />
                    )}
                    {isPlanned && (
                      <span
                        className="shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "var(--text-muted)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        soon
                      </span>
                    )}
                  </motion.div>
                );

                if (isPlanned || isActive) {
                  return (
                    <div
                      key={topic.id}
                      onClick={isPlanned ? (e) => e.preventDefault() : undefined}
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link key={topic.id} href={topicPath} className="block group">
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.22, ease: EASE_EXPO }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] leading-snug transition-all duration-200"
                      style={{
                        color: "var(--text-muted)",
                      }}
                    >
                      <span className="truncate flex-1 group-hover:text-[var(--text-primary)] transition-colors">
                        {localize(topic.title)}
                      </span>
                      <ProgressDot
                        color={color}
                        lessonRead={lessonRead}
                        quizDone={quizDone}
                      />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */

interface SidebarProps {
  curriculum: Curriculum;
}

export function Sidebar({ curriculum }: SidebarProps) {
  const pathname = usePathname();
  const { t, localize } = useI18n();
  const { allProgress } = useProgress();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <motion.aside
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={{ duration: 0.35, ease: EASE_EXPO }}
      className="hidden md:flex flex-col fixed top-[var(--spacing-header)] start-0 bottom-0 border-e border-[var(--border-glass)] overflow-y-auto overflow-x-hidden z-40 backdrop-blur-xl"
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      {/* ── Collapse toggle ── */}
      <motion.button
        onClick={toggleCollapse}
        whileHover={{ scale: 1.05, backgroundColor: "var(--bg-hover)" }}
        whileTap={{ scale: 0.92 }}
        className="flex items-center justify-center h-10 shrink-0 border-b border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <CollapseIcon collapsed={collapsed} />
      </motion.button>

      <nav className="flex-1 py-3 space-y-0.5" style={{ minWidth: 0 }}>

        {/* ── Home link ── */}
        <div className="px-2">
          <Link
            href="/"
            title={collapsed ? t("nav.home") : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              pathname === "/"
                ? "bg-[var(--color-info-bg)] text-[var(--text-accent)] border border-[var(--color-info-border)] font-medium shadow-[var(--shadow-glow-crimson)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <span className="shrink-0">
              <HomeIcon filled={pathname === "/"} />
            </span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="home-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.22, ease: EASE_EXPO }}
                  className="truncate overflow-hidden whitespace-nowrap"
                >
                  {t("nav.home")}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* ── Game modes ── */}
        <div className="px-2 space-y-0.5">
          {[
            { href: "/faction", icon: "⚔️", labelKey: "Lycée vs. Lycée" },
            { href: "/boss", icon: "💀", labelKey: "Boss Fights" },
          ].map(({ href, icon, labelKey }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? labelKey : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-[var(--color-info-bg)] text-[var(--text-accent)] border border-[var(--color-info-border)] font-medium"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className="shrink-0 text-base leading-none">{icon}</span>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key={`${href}-label`}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.22, ease: EASE_EXPO }}
                      className="truncate overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      {labelKey}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-[var(--border-glass)] mx-3 my-2" />

        {/* ── Year sections ── */}
        {Object.entries(curriculum.years).map(([yearId, year]) => {
          const isYearActive = pathname.startsWith(`/${yearId}`);

          return (
            <div key={yearId} className="mb-1">

              {/* Year header row */}
              <div className={`px-2 mb-1.5 ${collapsed ? "flex justify-center" : ""}`}>
                {collapsed ? (
                  <Link
                    href={`/${yearId}`}
                    title={localize(year.title)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-bold transition-all"
                    style={
                      isYearActive
                        ? {
                            background: "var(--gradient-brand)",
                            color: "white",
                              boxShadow: "var(--shadow-glow-crimson)",
                          }
                        : { background: "var(--bg-hover)", color: "var(--text-muted)" }
                    }
                  >
                    {yearId === "1bac" ? "1" : "2"}
                  </Link>
                ) : (
                  <Link
                    href={`/${yearId}`}
                    className={`flex items-center gap-2.5 px-1 py-1 rounded-lg transition-colors ${
                      isYearActive
                        ? "text-[var(--text-accent)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-all"
                      style={
                        isYearActive
                          ? {
                              background: "var(--gradient-brand)",
                              color: "white",
                              boxShadow: "var(--shadow-glow-crimson)",
                            }
                          : { background: "var(--bg-hover)", color: "var(--text-muted)" }
                      }
                    >
                      {yearId === "1bac" ? "1" : "2"}
                    </span>
                    <AnimatePresence initial={false}>
                      <motion.span
                        key="year-label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] font-bold uppercase tracking-[0.1em] truncate leading-none"
                      >
                        {localize(year.title)}
                      </motion.span>
                    </AnimatePresence>
                  </Link>
                )}
              </div>

              {/* Filières + subjects + topics — expanded only */}
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    key={`${yearId}-tree`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE_EXPO }}
                  >
                    {Object.entries(year.filieres).map(([filiereId, filiere]) => {
                      const isFiliereActive = pathname.startsWith(`/${yearId}/${filiereId}`);

                      return (
                        <div key={filiereId} className="mb-3">
                          {/* Filière label */}
                          <Link
                            href={`/${yearId}/${filiereId}`}
                            className={`flex items-center mx-3 px-2 py-1 rounded-lg text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-colors mb-1.5 ${
                              isFiliereActive
                                ? "text-[var(--text-secondary)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            }`}
                          >
                            <span className="truncate">{localize(filiere.title)}</span>
                          </Link>

                          {/* Subjects */}
                          <div className="space-y-0.5 px-2">
                            {Object.entries(filiere.subjects).map(([subjectId, subject]) => (
                              <SubjectAccordion
                                key={subjectId}
                                yearId={yearId}
                                filiereId={filiereId}
                                subjectId={subjectId}
                                subject={subject}
                                pathname={pathname}
                                allProgress={allProgress}
                                localize={localize}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Year divider */}
              {!collapsed && (
                <div className="h-px bg-[var(--border-glass)] mx-3 mt-3 mb-2" />
              )}
            </div>
          );
        })}
      </nav>
    </motion.aside>
  );
}
