"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/lib/i18n/context";

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-4"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow-indigo)" }}
          >
            B
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {t("auth.login")}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t("site.subtitle")}</p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-card)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-sm text-[var(--color-error)] flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] tracking-wide uppercase">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--color-info-bg)] transition-all placeholder:text-[var(--text-muted)]"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] tracking-wide uppercase">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--color-info-bg)] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all mt-2"
              style={{ background: "var(--gradient-brand)", boxShadow: loading ? "none" : "var(--shadow-glow-indigo)" }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  {t("auth.loggingIn")}
                </span>
              ) : t("auth.login")}
            </button>
          </form>
        </div>

        <p className="text-sm text-center text-[var(--text-muted)] mt-5">
          {t("auth.noAccount")}{" "}
          <Link href="/auth/register" className="text-[var(--text-accent)] font-semibold hover:text-[var(--text-accent-bright)] transition-colors">
            {t("auth.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
