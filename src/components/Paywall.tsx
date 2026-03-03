"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/lib/i18n/context";

interface PaywallProps {
  type: "quiz" | "simulation";
}

const FEATURES = {
  quiz: ["Tous les quiz de tous les chapitres", "Corrections détaillées", "Suivi de progression", "Score et classement"],
  simulation: ["Simulations GPU interactives", "Visualisation en temps réel", "Paramètres ajustables", "Accès sur tous les appareils"],
};

export function Paywall({ type }: PaywallProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const features = FEATURES[type];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-14 px-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-glass)] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            {t("paywall.loginRequired")}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {type === "quiz" ? t("paywall.quizLoginDesc") : t("paywall.simLoginDesc")}
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow-indigo)" }}
        >
          {t("auth.login")}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 px-6 text-center max-w-md mx-auto">
      {/* Icon + badge */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--gradient-brand-subtle)", border: "1px solid var(--color-info-border)" }}
        >
          {type === "simulation" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          )}
        </div>
        <div
          className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wide"
          style={{ background: "var(--gradient-brand)" }}
        >
          PRO
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {t("paywall.premiumRequired")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {type === "quiz" ? t("paywall.quizDesc") : t("paywall.simDesc")}
        </p>
      </div>

      {/* Feature list */}
      <div className="w-full space-y-2 text-left">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
            <div className="w-5 h-5 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)] flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            {f}
          </div>
        ))}
      </div>

      <div className="w-full space-y-2.5">
        <Link
          href="/pricing"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow-indigo)" }}
        >
          {t("paywall.unlock")}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </Link>
        <p className="text-xs text-[var(--text-muted)] font-medium">{t("paywall.startingAt")}</p>
      </div>
    </div>
  );
}
