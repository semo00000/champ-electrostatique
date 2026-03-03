"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { getCurriculum } from "@/lib/curriculum";

const SUBJECT_CONFIG: Record<string, { gradient: string; icon: React.ReactNode }> = {
  physique: {
    gradient: "from-indigo-500/20 to-indigo-600/5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  chimie: {
    gradient: "from-emerald-500/20 to-emerald-600/5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 3h6v7l5 8a2 2 0 0 1-1.7 3H5.7a2 2 0 0 1-1.7-3l5-8V3" />
        <path d="M7 3h10" />
      </svg>
    ),
  },
  maths: {
    gradient: "from-violet-500/20 to-violet-600/5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  svt: {
    gradient: "from-orange-500/20 to-orange-600/5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
};

const SUBJECT_COLOR: Record<string, string> = {
  physique: "var(--color-physique)",
  chimie: "var(--color-chimie)",
  maths: "var(--color-maths)",
  svt: "var(--color-svt)",
};

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function LandingPage() {
  const { t, localize } = useI18n();
  const curriculum = getCurriculum();

  return (
    <div className="space-y-16 pb-8">
      {/* ── Hero ── */}
      <section className="relative text-center pt-10 pb-2 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-info-border)] bg-[var(--color-info-bg)] text-xs font-semibold text-[var(--text-accent)] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-info)] animate-pulse" />
            {t("site.subtitle")}
          </div>

          {/* Headline — first word normal, rest gradient (works for FR/AR/EN) */}
          <h1 className="text-4xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
            {(() => {
              const words = t("hero.title").split(" ");
              const first = words[0];
              const rest = words.slice(1).join(" ");
              return (
                <>
                  <span className="text-[var(--text-primary)]">{first} </span>
                  <span className="gradient-text">{rest}</span>
                </>
              );
            })()}
          </h1>

          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            {t("hero.desc")}
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <Link
              href="/2bac"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "var(--shadow-glow-indigo), var(--shadow-md)",
              }}
            >
              {t("hero.browse")}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/2bac/sm/physique/champ-electrostatique/sim"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-glass-bright)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-hover)] hover:border-[var(--border-accent)] transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {t("hero.sim")}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            value: "131+", label: t("lessons"),
            icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
          },
          {
            value: "131+", label: "Quiz",
            icon: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
          },
          {
            value: "4", label: t("topics"),
            icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
          },
          {
            value: "GPU", label: t("simulations"),
            icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
          },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-card)] hover:border-[var(--border-accent)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--color-info-bg)] flex items-center justify-center text-[var(--text-accent)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {s.icon}
              </svg>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] leading-none">{s.value}</div>
            <div className="text-xs text-[var(--text-muted)] font-medium">{s.label}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Year / Subject cards ── */}
      <section className="space-y-14">
        {Object.entries(curriculum.years).map(([yearId, year], yIdx) => (
          <motion.div
            key={yearId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: yIdx * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{localize(year.title)}</h2>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">{t(`year.${yearId}.desc`)}</p>
              </div>
              <Link
                href={`/${yearId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-accent)] hover:text-[var(--text-accent-bright)] transition-colors"
              >
                {t("nav.viewAll")}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>

            <div className="space-y-7">
              {Object.entries(year.filieres).map(([filiereId, filiere]) => (
                <div key={filiereId}>
                  <Link
                    href={`/${yearId}/${filiereId}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors mb-3"
                  >
                    {localize(filiere.title)}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(filiere.subjects).map(([subjectId, subject]) => {
                      const cfg = SUBJECT_CONFIG[subjectId];
                      const color = SUBJECT_COLOR[subjectId];
                      return (
                        <Link
                          key={subjectId}
                          href={`/${yearId}/${filiereId}/${subjectId}`}
                          className="group relative p-5 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-card)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-glass-bright)] hover:shadow-[var(--shadow-lg)]"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${cfg?.gradient}`} />
                          <div
                            className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                            style={{ background: `${color}18`, color }}
                          >
                            {cfg?.icon}
                          </div>
                          <h3 className="relative text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors leading-snug">
                            {localize(subject.title)}
                          </h3>
                          <p className="relative text-xs text-[var(--text-muted)] mt-1 font-medium">
                            {subject.topics.length} {t("topics")}
                          </p>
                          <div
                            className="absolute top-4 right-4 w-2 h-2 rounded-full"
                            style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
