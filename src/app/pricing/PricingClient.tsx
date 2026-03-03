"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useSubscription } from "@/lib/subscription/context";
import { PLANS, type PlanKey } from "@/config/pricing";

export function PricingClient() {
  const { t, locale } = useI18n();
  const localKey = locale === "en" ? "fr" : (locale as "fr" | "ar");
  const { isPremium, plan: currentPlan } = useSubscription();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {t("pricing.title")}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto">
          {t("pricing.subtitle")}
        </p>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-glass)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">
                {t("pricing.feature")}
              </th>
              <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-center w-28">
                {t("pricing.free")}
              </th>
              <th className="px-4 py-3 font-medium text-[var(--text-accent)] text-center w-28">
                Premium
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-glass)]">
            {[
              { key: "pricing.lessons", free: true, premium: true },
              { key: "pricing.firstQuiz", free: true, premium: true },
              { key: "pricing.allQuizzes", free: false, premium: true },
              { key: "pricing.simulations", free: false, premium: true },
              { key: "pricing.analytics", free: false, premium: true },
            ].map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-3 text-[var(--text-primary)]">{t(row.key)}</td>
                <td className="px-4 py-3 text-center">
                  {row.free ? (
                    <svg className="w-5 h-5 mx-auto text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <svg className="w-5 h-5 mx-auto text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Beta banner */}
      {isPremium && currentPlan === "beta" && (
        <div className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-4 text-center">
          <p className="text-sm font-medium text-[var(--color-success)]">
            {t("pricing.betaActive")}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {t("pricing.betaDesc")}
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
          ([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-xl border p-6 text-center space-y-4 ${
                key === "yearly"
                  ? "border-[var(--text-accent)] bg-[var(--bg-elevated)] shadow-lg"
                  : "border-[var(--border-glass)] bg-[var(--bg-elevated)]"
              }`}
            >
              {key === "yearly" && plan.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[var(--text-accent)] text-white text-xs font-medium">
                  {plan.savings[localKey]}
                </div>
              )}
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {plan.label[localKey]}
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  {plan.amount}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  MAD/{plan.interval === "month" ? t("pricing.month") : t("pricing.year")}
                </span>
              </div>
              <button
                disabled
                className="w-full py-2.5 rounded-lg bg-[var(--text-accent)]/10 text-[var(--text-accent)] text-sm font-medium cursor-not-allowed opacity-60"
              >
                {t("pricing.comingSoon")}
              </button>
            </div>
          )
        )}
      </div>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors"
        >
          {t("pricing.backToLessons")}
        </Link>
      </div>
    </div>
  );
}
