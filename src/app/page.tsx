"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  useReducedMotion,
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

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

type SubjectCfg = { color: string; glow: string; icon: React.ReactNode };

const SUBJECT_CONFIG: Record<string, SubjectCfg> = {
  physique: {
    color: "#059669",
    glow: "rgba(5,150,105,0.40)",
    icon: <Atom size={22} strokeWidth={1.6} />,
  },
  chimie: {
    color: "#d97706",
    glow: "rgba(217,119,6,0.40)",
    icon: <Beaker size={22} strokeWidth={1.6} />,
  },
  maths: {
    color: "#be123c",
    glow: "rgba(190,18,60,0.40)",
    icon: <Calculator size={22} strokeWidth={1.6} />,
  },
  svt: {
    color: "#0f766e",
    glow: "rgba(15,118,110,0.40)",
    icon: <Activity size={22} strokeWidth={1.6} />,
  },
};

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */

function AnimatedCounter({
  target,
  suffix = "",
  duration = 1.4,
  delay = 0.5,
}: {
  target: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  // Always init to 0 — same value server and client, no hydration mismatch.
  // Reduced-motion is checked client-only inside useEffect.
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      count.set(target);
      return;
    }
    const controls = animate(count, target, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, delay]);

  return (
    <>
      <motion.span suppressHydrationWarning>{rounded}</motion.span>
      {suffix && <span>{suffix}</span>}
    </>
  );
}

/* ─────────────────────────────────────────────
   AURORA BACKGROUND  (replaces HeroBackground + ParticleField)
   All orb positions are deterministic — zero SSR hydration mismatch.
───────────────────────────────────────────── */

function AuroraBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none hero-noise">
      {/* Orb 1 — Crimson */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(225,29,72,0.32) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "aurora-drift-1 16s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 2 — Gold */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          right: "-8%",
          width: 750,
          height: 750,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(217,119,6,0.28) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-drift-2 13s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 3 — Emerald */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "20%",
          width: 650,
          height: 650,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.25) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "aurora-drift-3 20s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 4 — Crimson soft */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "40%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(190,18,60,0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
          animation: "aurora-drift-4 24s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 5 — Deep teal */}
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          right: "10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(5,150,105,0.20) 0%, transparent 70%)",
          filter: "blur(85px)",
          animation: "aurora-drift-5 18s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 6 — Gold accent */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "55%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.16) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "aurora-drift-1 9s ease-in-out infinite reverse",
          willChange: "transform",
        }}
      />

      {/* Faint grid */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(255,255,255,0.045)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   LENS FLARE
───────────────────────────────────────────── */

function LensFlare() {
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none hidden lg:block"
      style={{
        top: "18%",
        right: "12%",
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "white",
        boxShadow: [
          "0 0 0 6px rgba(255,255,255,0.06)",
          "0 0 0 16px rgba(251,191,36,0.12)",
          "0 0 40px 14px rgba(217,119,6,0.35)",
          "0 0 80px 28px rgba(217,119,6,0.18)",
          "0 0 160px 60px rgba(217,119,6,0.08)",
        ].join(", "),
        animation: "glow-pulse 3.5s ease-in-out infinite",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   SPOTLIGHT CARD  — cursor radial gradient + 3D tilt
───────────────────────────────────────────── */

function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(217,119,6,0.25)",
  accentColor,
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  accentColor?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 200, damping: 22, mass: 0.5 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 200, damping: 22, mass: 0.5 });

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    const relX = (clientX - left) / width - 0.5;
    const relY = (clientY - top) / height - 0.5;
    rotateYRaw.set(relX * 9);
    rotateXRaw.set(-relY * 9);
  }

  function onMouseLeave() {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  }

  const bg = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`group relative ${className}`}
    >
      {/* Spotlight layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-[inherit]"
        style={{ background: bg }}
      />
      {/* Gradient top-border accent on hover */}
      {accentColor && (
        <div
          className="absolute top-0 inset-x-0 h-[2px] rounded-t-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          }}
        />
      )}
      {/* Glass border highlight on hover */}
      <div className="absolute inset-0 rounded-[inherit] border border-white/0 group-hover:border-white/10 transition-colors duration-300 pointer-events-none z-20" />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAGNETIC CTA BUTTON
───────────────────────────────────────────── */

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
  const x = useSpring(0, { stiffness: 220, damping: 14, mass: 0.1 });
  const y = useSpring(0, { stiffness: 220, damping: 14, mass: 0.1 });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

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
          {/* Shimmer sweep — one-shot on hover, not looping */}
          <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
              style={{
                background:
                  "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.28) 50%, transparent 75%)",
                transition:
                  "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </span>
        </>
      )}
      <span className="relative flex items-center gap-2.5">{children}</span>
    </motion.a>
  );
}

/* ─────────────────────────────────────────────
   BENTO STAT CARD
───────────────────────────────────────────── */

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
      // NOTE: no overflow-hidden here — it would clip the gradient-border-card ::before mask
      className={`gradient-border-card rounded-3xl border border-[var(--border-glass)] bg-[var(--bg-card)] ${className}`}
    >
      {children}
    </SpotlightCard>
  );
}

/* ─────────────────────────────────────────────
   STREAK WIDGET — SVG ring progress + CSS-animated flame
───────────────────────────────────────────── */

const STREAK_CIRCUMFERENCE = 2 * Math.PI * 40; // ≈ 251.3

function StreakWidget() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const completed = [true, true, true, true, true, true, false];

  return (
    <div className="flex flex-col h-full p-7 justify-between rounded-3xl overflow-hidden">
      {/* Top row — ring + text + flame */}
      <div className="flex items-center justify-between gap-4">
        {/* SVG ring + centered number */}
        <div
          className="relative flex items-center justify-center shrink-0"
          style={{ width: 96, height: 96 }}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            className="absolute inset-0"
          >
            <defs>
              <linearGradient
                id="flameRingGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="rgba(249,115,22,0.14)"
              strokeWidth="5"
            />
            {/* Progress */}
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="url(#flameRingGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              style={{ rotate: -90, transformOrigin: "48px 48px" }}
              strokeDasharray={STREAK_CIRCUMFERENCE}
              initial={{ strokeDashoffset: STREAK_CIRCUMFERENCE }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: EASE_EXPO, delay: 0.3 }}
            />
          </svg>
          <span
            className="relative z-10"
            style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              lineHeight: 1,
              background: "linear-gradient(135deg,#fb923c,#f43f5e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            7
          </span>
        </div>

        {/* Label */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p
            className="text-xs font-black uppercase"
            style={{
              background: "linear-gradient(90deg,#fb923c,#f43f5e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.14em",
            }}
          >
            Streak
          </p>
          <span className="text-2xl font-black text-orange-400">Days</span>
        </div>

        {/* Flame — CSS animated */}
        <div
          className="shrink-0"
          style={{
            animation: "flame-breathe 2.4s ease-in-out infinite",
            willChange: "transform, filter",
          }}
        >
          <Flame size={72} strokeWidth={1.2} className="text-orange-500" />
        </div>
      </div>

      {/* Day pips */}
      <div className="flex items-center gap-2 mt-5">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE_EXPO }}
              className={`w-full h-7 rounded-lg flex items-center justify-center ${
                completed[i]
                  ? "bg-orange-500/30 border border-orange-500/60"
                  : "bg-white/[0.04] border border-white/[0.07]"
              }`}
            >
              {completed[i] && (
                <CheckCircle2
                  size={13}
                  className="text-orange-400"
                  strokeWidth={2.2}
                />
              )}
            </motion.div>
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
              {d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function LandingPage() {
  const { t, localize } = useI18n();
  const curriculum = getCurriculum();
  const shouldReduce = useReducedMotion();

  // Delay hero animation until after hydration to avoid server/client style mismatch.
  // Server + client first paint both render "hidden"; useEffect fires "show" after hydration.
  const [heroAnimate, setHeroAnimate] = useState<"hidden" | "show">("hidden");
  useEffect(() => setHeroAnimate("show"), []);

  const heroStagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.12,
        delayChildren: shouldReduce ? 0 : 0.1,
      },
    },
  };

  const heroChild = {
    hidden: {
      opacity: 0,
      y: shouldReduce ? 0 : 24,
      scale: shouldReduce ? 1 : 0.97,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.65, ease: EASE_EXPO },
    },
  };

  return (
    <div className="relative overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[92vh] pt-32 pb-24 -mx-4 md:-mx-8 -mt-6 px-4 md:px-8 overflow-hidden">
        <AuroraBackground />
        <LensFlare />

        <motion.div
          initial="hidden"
          animate={heroAnimate}
          variants={heroStagger}
          className="relative z-10 max-w-4xl mx-auto space-y-8"
        >
          {/* Badge */}
          <motion.div
            variants={heroChild}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-[rgba(217,119,6,0.55)] bg-[rgba(217,119,6,0.10)] shadow-[0_0_24px_rgba(217,119,6,0.22),inset_0_0_12px_rgba(217,119,6,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]"
            style={{
              color: "var(--text-gold)",
              textShadow: "0 0 16px rgba(251,191,36,0.55)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--color-info)] opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--color-info)]" />
            </span>
            {t("site.subtitle")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={heroChild}
            style={{
              fontSize: "clamp(3.2rem, 10vw, 7rem)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
              color: "var(--text-primary)",
            }}
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

          {/* Subtitle */}
          <motion.p
            variants={heroChild}
            className="text-xl md:text-2xl font-medium text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.desc")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={heroChild}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3"
          >
            <MagneticCTA href="/2bac" variant="primary">
              {t("hero.browse")}
              <ArrowRight
                size={16}
                strokeWidth={2.5}
                className="translate-x-0 group-hover:translate-x-0.5 transition-transform"
              />
            </MagneticCTA>
            <MagneticCTA
              href="/2bac/sm/physique/champ-electrostatique/sim"
              variant="secondary"
            >
              <PlaySquare size={16} className="text-[var(--text-accent)]" />
              {t("hero.sim")}
            </MagneticCTA>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </section>

      {/* ── BENTO STATS ──────────────────────────────── */}
      <section className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE_EXPO }}
          className="max-w-5xl mx-auto grid gap-3.5"
          style={{
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gridTemplateRows: "210px 210px",
          }}
        >
          {/* Streak — 2 cols × 2 rows */}
          <StatCard
            className="col-span-2 row-span-2 border-orange-500/15 bg-gradient-to-br from-orange-500/[0.07] to-rose-500/[0.04]"
            spotlightColor="rgba(249,115,22,0.20)"
          >
            <StreakWidget />
          </StatCard>

          {/* Lessons — 2 cols × 1 row */}
          <StatCard
            className="col-span-2 row-span-1"
            spotlightColor="rgba(190,18,60,0.28)"
          >
            <div className="flex items-center gap-5 h-full p-7 rounded-3xl overflow-hidden">
              <div
                className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--color-info-bg)",
                  boxShadow: "var(--shadow-glow-crimson)",
                }}
              >
                <BookOpen
                  size={26}
                  className="text-[var(--color-info-bright)]"
                  strokeWidth={1.6}
                />
              </div>
              <div>
                <div className="text-[2.4rem] font-black leading-none tracking-tight text-[var(--text-primary)]">
                  <AnimatedCounter target={131} suffix="+" />
                </div>
                <div className="text-sm text-[var(--text-muted)] font-medium mt-1">
                  {t("lessons")} interactives
                </div>
              </div>
            </div>
          </StatCard>

          {/* Topics — 1 col × 1 row */}
          <StatCard
            className="col-span-1 row-span-1"
            spotlightColor="rgba(5,150,105,0.28)"
          >
            <div className="flex flex-col items-start justify-between h-full p-6 rounded-3xl overflow-hidden">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-info-bg)" }}
              >
                <Layers
                  size={20}
                  className="text-[var(--color-info-bright)]"
                  strokeWidth={1.6}
                />
              </div>
              <div>
                <div className="text-3xl font-black leading-none text-[var(--text-primary)]">
                  <AnimatedCounter target={4} duration={0.8} />
                </div>
                <div className="text-xs text-[var(--text-muted)] font-medium mt-1">
                  {t("topics")}
                </div>
              </div>
            </div>
          </StatCard>

          {/* Simulations — 1 col × 1 row */}
          <StatCard
            className="col-span-1 row-span-1 border-[var(--color-emerald-border)] bg-gradient-to-br from-[var(--color-emerald-bg)] to-transparent"
            spotlightColor="rgba(5,150,105,0.28)"
          >
            <div className="flex flex-col items-start justify-between h-full p-6 rounded-3xl overflow-hidden">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--color-emerald-bg)",
                  boxShadow: "var(--shadow-glow-emerald)",
                }}
              >
                <Zap
                  size={20}
                  className="text-[var(--color-emerald-bright)]"
                  strokeWidth={1.6}
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(16,185,129,0.7))",
                  }}
                />
              </div>
              <div>
                <div className="text-3xl font-black leading-none text-[var(--text-primary)]">
                  3D
                </div>
                <div className="text-xs text-[var(--text-muted)] font-medium mt-1">
                  {t("simulations")} GPU
                </div>
              </div>
            </div>
          </StatCard>
        </motion.div>
      </section>

      {/* ── CURRICULUM ───────────────────────────────── */}
      <section className="px-4 pb-32 max-w-6xl mx-auto space-y-28">
        {Object.entries(curriculum.years).map(([yearId, year], yIdx) => (
          <div key={yearId}>
            {/* Year header */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: yIdx * 0.05,
                ease: EASE_EXPO,
              }}
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
              {Object.entries(year.filieres).map(
                ([filiereId, filiere], fIdx) => (
                  <motion.div
                    key={filiereId}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.55,
                      delay: fIdx * 0.06,
                      ease: EASE_EXPO,
                    }}
                    className="flex flex-col lg:flex-row gap-8"
                  >
                    {/* Sidebar label */}
                    <div className="lg:w-52 shrink-0 pt-1">
                      <Link
                        href={`/${yearId}/${filiereId}`}
                        className="group inline-block"
                      >
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
                      {Object.entries(filiere.subjects).map(
                        ([subjectId, subject], sIdx) => {
                          const cfg: SubjectCfg = SUBJECT_CONFIG[
                            subjectId
                          ] ?? {
                            color: "#818cf8",
                            glow: "rgba(129,140,248,0.40)",
                            icon: (
                              <BrainCircuit size={22} strokeWidth={1.6} />
                            ),
                          };

                          return (
                            <motion.div
                              key={subjectId}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-40px" }}
                              transition={{
                                duration: 0.5,
                                delay: sIdx * 0.07,
                                ease: EASE_EXPO,
                              }}
                            >
                              <SpotlightCard
                                spotlightColor={cfg.glow}
                                accentColor={cfg.color}
                                className="h-full rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--border-glass-bright)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)]"
                              >
                                <Link
                                  href={`/${yearId}/${filiereId}/${subjectId}`}
                                  className="flex flex-col h-full p-6 min-h-[172px] rounded-2xl overflow-hidden"
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

                                  {/* Text + chevron */}
                                  <div className="mt-auto">
                                    <div className="flex items-end justify-between gap-2">
                                      <div className="min-w-0">
                                        <h3
                                          className="text-base font-bold leading-snug mb-1"
                                          style={{
                                            color: "var(--text-primary)",
                                          }}
                                        >
                                          {localize(subject.title)}
                                        </h3>
                                        <p className="text-xs font-semibold text-[var(--text-muted)]">
                                          {subject.topics.length}{" "}
                                          {t("topics")}
                                        </p>
                                      </div>
                                      {/* Chevron slides in from left on group-hover */}
                                      <ArrowRight
                                        size={15}
                                        strokeWidth={2.5}
                                        className="opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[250ms] shrink-0 mb-0.5"
                                        style={{ color: cfg.color }}
                                      />
                                    </div>
                                  </div>
                                </Link>
                              </SpotlightCard>
                            </motion.div>
                          );
                        }
                      )}
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
