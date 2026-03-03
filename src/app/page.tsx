"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { getCurriculum } from "@/lib/curriculum";
import {
  Flame,
  BookOpen,
  Atom,
  Beaker,
  Calculator,
  Zap,
  PlaySquare,
  ArrowRight,
  BrainCircuit,
  Activity,
  CheckCircle2,
  Layers,
} from "lucide-react";

/* 
   DESIGN TOKENS
    */

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

type SubjectCfg = { color: string; glow: string; icon: React.ReactNode };

const SUBJECT_CONFIG: Record<string, SubjectCfg> = {
  physique: {
    color: "#6366f1",
    glow: "rgba(99,102,241,0.25)",
    icon: <Atom size={22} strokeWidth={1.6} />,
  },
  chimie: {
    color: "#10b981",
    glow: "rgba(16,185,129,0.25)",
    icon: <Beaker size={22} strokeWidth={1.6} />,
  },
  maths: {
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.25)",
    icon: <Calculator size={22} strokeWidth={1.6} />,
  },
  svt: {
    color: "#f97316",
    glow: "rgba(249,115,22,0.25)",
    icon: <Activity size={22} strokeWidth={1.6} />,
  },
};

/* 
   ANIMATED PARTICLE FIELD  SSR-safe (positions from useEffect)
    */

type Particle = { cx: number; cy: number; r: number; dur: number; delay: number };

function ParticleField() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Deferred so React Compiler doesn't flag synchronous setState-in-effect,
    // and avoids SSR/hydration mismatch for Math.random()
    const id = requestAnimationFrame(() => {
      setParticles(
        Array.from({ length: 28 }, () => ({
          cx: Math.random() * 100,
          cy: Math.random() * 100,
          r: 0.8 + Math.random() * 1.6,
          dur: 4 + Math.random() * 6,
          delay: Math.random() * 5,
        }))
      );
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Faint grid */}
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.028)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Orbiting glow rings */}
      <motion.ellipse
        cx="50%" cy="30%" rx="34%" ry="16%"
        fill="none" stroke="rgba(99,102,241,0.07)" strokeWidth="1"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50% 30%" }}
      />
      <motion.ellipse
        cx="50%" cy="30%" rx="22%" ry="9%"
        fill="none" stroke="rgba(139,92,246,0.09)" strokeWidth="0.8"
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50% 30%" }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.circle
          key={i}
          cx={`${p.cx}%`}
          cy={`${p.cy}%`}
          r={p.r}
          fill="currentColor"
          className="text-indigo-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.55, 0.1], scale: [1, 1.6, 1] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Connecting lines between nearby particles (static aesthetic) */}
      {particles.slice(0, 8).map((p, i) =>
        particles.slice(i + 1, i + 3).map((q, j) => (
          <line
            key={`${i}-${j}`}
            x1={`${p.cx}%`} y1={`${p.cy}%`}
            x2={`${q.cx}%`} y2={`${q.cy}%`}
            stroke="rgba(99,102,241,0.05)" strokeWidth="0.5"
          />
        ))
      )}
    </svg>
  );
}

/* 
   HERO BACKGROUND
    */

function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base radial */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 65% at 50% -5%, rgba(99,102,241,0.18) 0%, transparent 60%)",
        }}
      />
      {/* Slow drifting orbs */}
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-12, 12, -12] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ y: [18, -18, 18], x: [10, -10, 10] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[5%] w-[420px] h-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[0%] left-[30%] w-[380px] h-[280px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }}
      />
      <ParticleField />
    </div>
  );
}

/* 
   SPOTLIGHT CARD  cursor-following radial gradient
    */

function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(99,102,241,0.18)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const bg = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

  return (
    <div
      onMouseMove={onMouseMove}
      className={`group relative overflow-hidden ${className}`}
    >
      {/* Spotlight layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: bg }}
      />
      {/* Glass border highlight on hover */}
      <div className="absolute inset-0 rounded-[inherit] border border-white/0 group-hover:border-white/10 transition-colors duration-300 pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/* 
   MAGNETIC BUTTON
    */

function MagneticCTA({
  children,
  href,
  variant = "secondary",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 180, damping: 16, mass: 0.12 });
  const y = useSpring(0, { stiffness: 180, damping: 16, mass: 0.12 });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.18);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.18);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const isPrimary = variant === "primary";

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }}
      className={`group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-shadow duration-300 select-none ${
        isPrimary
          ? "text-white"
          : "border border-[var(--border-glass-bright)] bg-white/[0.04] text-[var(--text-primary)] hover:bg-white/[0.08] backdrop-blur-md"
      }`}
    >
      {isPrimary && (
        <>
          {/* Gradient fill */}
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--gradient-brand)" }}
          />
          {/* Glow halo */}
          <span
            className="absolute -inset-1 rounded-full blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500"
            style={{ background: "var(--gradient-brand)" }}
          />
        </>
      )}
      <span className="relative flex items-center gap-2.5">{children}</span>
    </motion.a>
  );
}

/* 
   BENTO STAT CARD (reusable inner shell)
    */

function StatCard({
  children,
  className = "",
  spotlightColor,
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  return (
    <SpotlightCard
      spotlightColor={spotlightColor}
      className={`rounded-3xl border border-[var(--border-glass)] bg-[var(--bg-card)] overflow-hidden ${className}`}
    >
      {children}
    </SpotlightCard>
  );
}

/* 
   STREAK FLAME WIDGET
    */

function StreakWidget() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const completed = [true, true, true, true, true, true, false];

  return (
    <div className="flex flex-col h-full p-7 justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500/70 mb-1">
            Current Streak
          </p>
          <div className="flex items-end gap-2">
            <span
              className="text-5xl font-black leading-none"
              style={{
                background: "linear-gradient(135deg,#fb923c,#f43f5e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              7
            </span>
            <span className="text-xl font-bold text-orange-400 mb-1">Days</span>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [-4, 4, -4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame
            size={52}
            strokeWidth={1.4}
            className="text-orange-500"
            style={{ filter: "drop-shadow(0 0 18px rgba(249,115,22,0.6))" }}
          />
        </motion.div>
      </div>

      {/* Day pips */}
      <div className="flex items-center gap-2 mt-4">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE_EXPO }}
              className={`w-full h-7 rounded-lg flex items-center justify-center ${
                completed[i]
                  ? "bg-orange-500/20 border border-orange-500/40"
                  : "bg-white/5 border border-white/8"
              }`}
            >
              {completed[i] && (
                <CheckCircle2 size={13} className="text-orange-400" strokeWidth={2.2} />
              )}
            </motion.div>
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 
   PAGE
    */

export default function LandingPage() {
  const { t, localize } = useI18n();
  const curriculum = getCurriculum();

  return (
    <div className="relative overflow-x-hidden">

      {/*  HERO  */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[88vh] pt-28 pb-20 px-4">
        <HeroBackground />

        {/* Staggered entrance */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
          }}
          className="relative z-10 max-w-4xl mx-auto space-y-7"
        >
          {/* Badge */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_EXPO } } }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[var(--border-glass-bright)] bg-[var(--bg-elevated)] text-xs font-semibold tracking-wider uppercase text-[var(--text-accent)]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--color-info)] opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--color-info)]" />
            </span>
            {t("site.subtitle")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_EXPO } } }}
            className="text-[clamp(2.8rem,8vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-[var(--text-primary)]"
          >
            {(() => {
              const words = t("hero.title").split(" ");
              const first = words.slice(0, -1).join(" ");
              const last = words[words.length - 1];
              return (
                <>
                  {first}{" "}
                  <span
                    style={{
                      background: "var(--gradient-brand)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {last}
                  </span>
                </>
              );
            })()}
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_EXPO } } }}
            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.desc")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_EXPO } } }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3"
          >
            <MagneticCTA href="/2bac" variant="primary">
              {t("hero.browse")}
              <ArrowRight size={16} strokeWidth={2.5} className="translate-x-0 group-hover:translate-x-0.5 transition-transform" />
            </MagneticCTA>
            <MagneticCTA href="/2bac/sm/physique/champ-electrostatique/sim" variant="secondary">
              <PlaySquare size={16} className="text-[var(--text-accent)]" />
              {t("hero.sim")}
            </MagneticCTA>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </section>

      {/*  BENTO STATS  */}
      <section className="px-4 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE_EXPO }}
          className="grid gap-3.5"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gridTemplateRows: "200px 200px" }}
        >
          {/*  Streak  spans 2 cols  2 rows */}
          <StatCard
            className="col-span-2 row-span-2 border-orange-500/15 bg-gradient-to-br from-orange-500/[0.06] to-rose-500/[0.04]"
            spotlightColor="rgba(249,115,22,0.14)"
          >
            <StreakWidget />
          </StatCard>

          {/*  Lessons */}
          <StatCard className="col-span-2 row-span-1" spotlightColor="rgba(99,102,241,0.18)">
            <div className="flex items-center gap-5 h-full p-7">
              <div
                className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--color-info-bg)", boxShadow: "var(--shadow-glow-indigo)" }}
              >
                <BookOpen size={26} className="text-[var(--color-info-bright)]" strokeWidth={1.6} />
              </div>
              <div>
                <div className="text-[2.4rem] font-black leading-none tracking-tight text-[var(--text-primary)]">
                  131<span className="text-[var(--text-accent)] text-3xl">+</span>
                </div>
                <div className="text-sm text-[var(--text-muted)] font-medium mt-1">{t("lessons")} interactives</div>
              </div>
            </div>
          </StatCard>

          {/*  Topics */}
          <StatCard className="col-span-1 row-span-1" spotlightColor="rgba(139,92,246,0.18)">
            <div className="flex flex-col items-start justify-between h-full p-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-info-bg)" }}
              >
                <Layers size={20} className="text-[var(--color-info-bright)]" strokeWidth={1.6} />
              </div>
              <div>
                <div className="text-3xl font-black leading-none text-[var(--text-primary)]">4</div>
                <div className="text-xs text-[var(--text-muted)] font-medium mt-1">{t("topics")}</div>
              </div>
            </div>
          </StatCard>

          {/*  Simulations */}
          <StatCard
            className="col-span-1 row-span-1 border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.05] to-transparent"
            spotlightColor="rgba(6,182,212,0.2)"
          >
            <div className="flex flex-col items-start justify-between h-full p-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(6,182,212,0.1)", boxShadow: "0 0 16px rgba(6,182,212,0.15)" }}
              >
                <Zap
                  size={20}
                  className="text-cyan-400"
                  strokeWidth={1.6}
                  style={{ filter: "drop-shadow(0 0 6px rgba(6,182,212,0.7))" }}
                />
              </div>
              <div>
                <div className="text-3xl font-black leading-none text-[var(--text-primary)]">3D</div>
                <div className="text-xs text-[var(--text-muted)] font-medium mt-1">{t("simulations")} GPU</div>
              </div>
            </div>
          </StatCard>
        </motion.div>
      </section>

      {/*  CURRICULUM  */}
      <section className="px-4 pb-32 max-w-6xl mx-auto space-y-28">
        {Object.entries(curriculum.years).map(([yearId, year], yIdx) => (
          <div key={yearId}>
            {/* Year header */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: yIdx * 0.05, ease: EASE_EXPO }}
              className="flex items-end justify-between pb-6 mb-12 border-b border-[var(--border-glass)]"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  {t(`year.${yearId}.desc`)}
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] leading-tight">
                  {localize(year.title)}
                </h2>
              </div>
              <Link
                href={`/${yearId}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-accent)] hover:text-[var(--text-accent-bright)] transition-colors"
              >
                {t("nav.viewAll")}
                <ArrowRight size={15} />
              </Link>
            </motion.div>

            {/* Filieres */}
            <div className="space-y-14">
              {Object.entries(year.filieres).map(([filiereId, filiere], fIdx) => (
                <motion.div
                  key={filiereId}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: fIdx * 0.06, ease: EASE_EXPO }}
                  className="flex flex-col lg:flex-row gap-8"
                >
                  {/* Sidebar label */}
                  <div className="lg:w-52 shrink-0 pt-1">
                    <Link href={`/${yearId}/${filiereId}`} className="group inline-block">
                      <div className="text-sm font-black uppercase tracking-[0.12em] text-[var(--text-secondary)] group-hover:text-[var(--text-accent)] transition-colors duration-200">
                        {localize(filiere.title)}
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-[var(--text-muted)] opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                        Explore <ArrowRight size={11} />
                      </div>
                    </Link>
                  </div>

                  {/* Subject cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
                    {Object.entries(filiere.subjects).map(([subjectId, subject], sIdx) => {
                      const cfg: SubjectCfg = SUBJECT_CONFIG[subjectId] ?? {
                        color: "#818cf8",
                        glow: "rgba(129,140,248,0.25)",
                        icon: <BrainCircuit size={22} strokeWidth={1.6} />,
                      };

                      return (
                        <motion.div
                          key={subjectId}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.5, delay: sIdx * 0.07, ease: EASE_EXPO }}
                        >
                          <SpotlightCard
                            spotlightColor={cfg.glow}
                            className="h-full rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-glass-bright)] hover:shadow-[var(--shadow-lg)]"
                          >
                            <Link
                              href={`/${yearId}/${filiereId}/${subjectId}`}
                              className="flex flex-col h-full p-6 min-h-[172px]"
                            >
                              {/* Icon row */}
                              <div className="flex items-center justify-between mb-7">
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/5"
                                  style={{
                                    backgroundColor: `${cfg.color}18`,
                                    color: cfg.color,
                                    boxShadow: `inset 0 0 14px ${cfg.color}10`,
                                  }}
                                >
                                  {cfg.icon}
                                </div>
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: cfg.color,
                                    boxShadow: `0 0 8px 1px ${cfg.color}`,
                                  }}
                                />
                              </div>

                              {/* Text */}
                              <div className="mt-auto">
                                <h3
                                  className="text-base font-bold leading-snug mb-1"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {localize(subject.title)}
                                </h3>
                                <p className="text-xs font-semibold text-[var(--text-muted)]">
                                  {subject.topics.length} {t("topics")}
                                </p>
                              </div>
                            </Link>
                          </SpotlightCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
