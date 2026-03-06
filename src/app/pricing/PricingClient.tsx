"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useSubscription } from "@/lib/subscription/context";
import { PLANS, type PlanKey } from "@/config/pricing";
import { ZelligeSVG, GoldCornerAccent, MoroccanArchSVG, MoroccanStarSeparator } from "@/components/ui/MoroccanDecor";

// ✦ star tick for feature rows
function StarTick({ gold = false }: { gold?: boolean }) {
  return (
    <span
      className="inline-block text-base leading-none select-none"
      style={{ color: gold ? "#d97706" : "#059669" }}
      aria-hidden="true"
    >
      ✦
    </span>
  );
}

export function PricingClient() {
  const { t, locale } = useI18n();
  const localKey = locale === "en" ? "fr" : (locale as "fr" | "ar");
  const { isPremium, plan: currentPlan } = useSubscription();

  const features = [
    { key: "pricing.lessons", free: true, premium: true },
    { key: "pricing.firstQuiz", free: true, premium: true },
    { key: "pricing.allQuizzes", free: false, premium: true },
    { key: "pricing.simulations", free: false, premium: true },
    { key: "pricing.analytics", free: false, premium: true },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <MoroccanArchSVG color="#d97706" width={80} height={52} className="mx-auto mb-2 opacity-50" />
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {t("pricing.title")}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
          {t("pricing.subtitle")}
        </p>
        <MoroccanStarSeparator color="#d97706" className="mx-auto mt-4" />
      </div>

      {/* Comparison table */}
      <div className="relative rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] overflow-hidden">
        {/* subtle zellige bg */}
        <div className="absolute inset-0 pointer-events-none">
          <ZelligeSVG variant="diamond" opacity={0.018} color="#d97706" size={44} />
        </div>
        <table className="relative w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-glass)]">
              <th className="text-left px-5 py-4 font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-xs">
                {t("pricing.feature")}
              </th>
              <th className="px-4 py-4 font-semibold text-[var(--text-secondary)] text-center w-28 uppercase tracking-wide text-xs">
                {t("pricing.free")}
              </th>
              <th
                className="px-4 py-4 font-bold text-center w-28 text-xs uppercase tracking-wide"
                style={{ color: "#d97706" }}
              >
                ✦ Premium
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-glass)]">
            {features.map((row) => (
              <tr key={row.key} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 text-[var(--text-primary)]">{t(row.key)}</td>
                <td className="px-4 py-3.5 text-center">
                  {row.free ? (
                    <StarTick />
                  ) : (
                    <span className="text-[var(--text-muted)] text-base">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <StarTick gold />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Beta banner */}
      {isPremium && currentPlan === "beta" && (
        <div className="relative overflow-hidden rounded-2xl border p-5 text-center" style={{ borderColor: "rgba(5,150,105,0.4)", background: "rgba(5,150,105,0.06)" }}>
          <GoldCornerAccent position="top-left" size={22} />
          <GoldCornerAccent position="top-right" size={22} />
          <p className="text-sm font-semibold relative z-10" style={{ color: "#059669" }}>
            {t("pricing.betaActive")}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 relative z-10">
            {t("pricing.betaDesc")}
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
          ([key, plan]) => {
            const isYearly = key === "yearly";
            return (
              <div
                key={key}
                className="relative rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
                style={{
                  border: isYearly ? "1px solid rgba(217,119,6,0.6)" : "1px solid var(--border-glass)",
                  background: "var(--bg-elevated)",
                  boxShadow: isYearly ? "0 0 32px rgba(217,119,6,0.12), 0 0 0 1px rgba(217,119,6,0.08)" : undefined,
                }}
              >
                {/* Yearly: zellige watermark */}
                {isYearly && (
                  <div className="absolute inset-0 pointer-events-none">
                    <ZelligeSVG variant="8star" opacity={0.03} color="#d97706" size={60} />
                  </div>
                )}

                {/* Yearly: top gradient strip */}
                {isYearly && (
                  <div
                    className="relative h-1.5 w-full"
                    style={{ background: "var(--gradient-moroccan)" }}
                  />
                )}

                {/* Gold corners on yearly card */}
                {isYearly && (
                  <>
                    <GoldCornerAccent position="top-left" size={24} />
                    <GoldCornerAccent position="top-right" size={24} />
                    <GoldCornerAccent position="bottom-left" size={24} />
                    <GoldCornerAccent position="bottom-right" size={24} />
                  </>
                )}

                <div className="relative z-10 p-6 text-center space-y-4">
                  {/* Savings badge */}
                  {isYearly && plan.savings && (
                    <div
                      className="inline-block px-3 py-0.5 rounded-full text-white text-xs font-semibold mb-1"
                      style={{ background: "var(--gradient-moroccan)", boxShadow: "var(--shadow-glow-crimson)" }}
                    >
                      {plan.savings[localKey]}
                    </div>
                  )}

                  {/* Plan name */}
                  <h3
                    className="text-lg font-bold tracking-tight"
                    style={{ color: isYearly ? "#d97706" : "var(--text-primary)" }}
                  >
                    {isYearly ? "✦ " : ""}{plan.label[localKey]}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span
                      className="text-4xl font-extrabold tracking-tight"
                      style={{ color: isYearly ? "#d97706" : "var(--text-primary)" }}
                    >
                      {plan.amount}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      MAD/{plan.interval === "month" ? t("pricing.month") : t("pricing.year")}
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed transition-all"
                    style={
                      isYearly
                        ? {
                            background: "var(--gradient-moroccan)",
                            color: "#fff",
                            opacity: 0.55,
                            boxShadow: "none",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border-glass)",
                            opacity: 0.7,
                          }
                    }
                  >
                    {t("pricing.comingSoon")}
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Back link */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-sm text-[var(--text-muted)] transition-colors hover:opacity-80"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#d97706")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ← {t("pricing.backToLessons")}
        </Link>
      </div>
    </div>
  );
}
