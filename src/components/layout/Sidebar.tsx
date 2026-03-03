"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useState } from "react";
import type { Curriculum } from "@/types/curriculum";

const SUBJECT_COLORS: Record<string, string> = {
  physique: "#6366f1",
  chimie: "#10b981",
  maths: "#8b5cf6",
  svt: "#f97316",
};

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

const SUBJECT_ICONS: Record<string, () => JSX.Element> = {
  physique: PhysiqueIcon,
  chimie: ChimieIcon,
  maths: MathsIcon,
  svt: SvtIcon,
};

interface SidebarProps {
  curriculum: Curriculum;
}

export function Sidebar({ curriculum }: SidebarProps) {
  const pathname = usePathname();
  const { t, localize } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-[var(--spacing-header)] start-0 bottom-0 border-e border-[var(--border-glass)] bg-[var(--bg-secondary)] overflow-y-auto overflow-x-hidden z-40 ${
        collapsed ? "w-[56px]" : "w-[var(--spacing-sidebar)]"
      }`}
      style={{ transition: "width 300ms cubic-bezier(0.16,1,0.3,1)" }}
    >
      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 shrink-0 border-b border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <nav className="flex-1 py-3 space-y-0.5">
        {/* ── Home ── */}
        <div className="px-2">
          <Link
            href="/"
            title={collapsed ? t("nav.home") : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              pathname === "/"
                ? "bg-[var(--color-info-bg)] text-[var(--text-accent)] border border-[var(--color-info-border)] font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <span className="shrink-0">
              <HomeIcon filled={pathname === "/"} />
            </span>
            {!collapsed && <span className="truncate">{t("nav.home")}</span>}
          </Link>
        </div>

        {/* ── Spacer / divider ── */}
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
                            boxShadow: "var(--shadow-glow-indigo)",
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
                              boxShadow: "var(--shadow-glow-indigo)",
                            }
                          : { background: "var(--bg-hover)", color: "var(--text-muted)" }
                      }
                    >
                      {yearId === "1bac" ? "1" : "2"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] truncate leading-none">
                      {localize(year.title)}
                    </span>
                  </Link>
                )}
              </div>

              {/* Filieres — only when expanded */}
              {!collapsed &&
                Object.entries(year.filieres).map(([filiereId, filiere]) => {
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

                      {/* Subject links */}
                      <div className="space-y-0.5 px-2">
                        {Object.entries(filiere.subjects).map(([subjectId, subject]) => {
                          const isActive = pathname.startsWith(
                            `/${yearId}/${filiereId}/${subjectId}`
                          );
                          const color = SUBJECT_COLORS[subjectId];
                          const Icon = SUBJECT_ICONS[subjectId];

                          return (
                            <Link
                              key={subjectId}
                              href={`/${yearId}/${filiereId}/${subjectId}`}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                isActive
                                  ? "font-semibold"
                                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                              }`}
                              style={
                                isActive
                                  ? {
                                      color,
                                      background: `${color}18`,
                                      boxShadow: `inset 3px 0 0 ${color}`,
                                    }
                                  : undefined
                              }
                            >
                              <span
                                className="shrink-0 transition-colors"
                                style={{ color: isActive ? color : "var(--text-muted)" }}
                              >
                                {Icon && <Icon />}
                              </span>
                              <span className="truncate leading-snug">
                                {localize(subject.title)}
                              </span>
                              {isActive && (
                                <span
                                  className="ms-auto w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              {/* Year divider */}
              {!collapsed && (
                <div className="h-px bg-[var(--border-glass)] mx-3 mt-3 mb-2" />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
