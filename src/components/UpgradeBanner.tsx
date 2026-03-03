"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { useSubscription } from "@/lib/subscription/context";
import { useI18n } from "@/lib/i18n/context";

interface UpgradeBannerProps {
  isFirstTopic: boolean;
  hasQuiz: boolean;
}

export function UpgradeBanner({ isFirstTopic, hasQuiz }: UpgradeBannerProps) {
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const { t } = useI18n();

  if (isPremium || isFirstTopic || !hasQuiz) return null;

  return (
    <div
      className="relative mt-10 p-5 rounded-2xl overflow-hidden border border-[var(--color-info-border)]"
      style={{ background: "var(--gradient-brand-subtle)" }}
    >
      {/* Decorative glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)", opacity: 0.5 }} />

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow-indigo)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--text-primary)]">{t("upgrade.quizCta")}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t("upgrade.quizCtaDesc")}</p>
        </div>

        {/* CTA */}
        <Link
          href={user ? "/pricing" : "/auth/login"}
          className="shrink-0 px-4 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 active:scale-[0.97] transition-all"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow-indigo)" }}
        >
          {t("paywall.unlock")}
        </Link>
      </div>
    </div>
  );
}
