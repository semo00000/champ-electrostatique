"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n/context";
import { useSubscription } from "@/lib/subscription/context";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Paywall } from "@/components/Paywall";
import type { BilingualText } from "@/types/curriculum";

interface SimPageClientProps {
  yearId: string;
  filiereId: string;
  subjectId: string;
  topicId: string;
  yearTitle: BilingualText;
  filiereTitle: BilingualText;
  subjectTitle: BilingualText;
  topicTitle: BilingualText;
  simulationFolder: string;
}

export function SimPageClient({
  yearId,
  filiereId,
  subjectId,
  topicId,
  yearTitle,
  filiereTitle,
  subjectTitle,
  topicTitle,
  simulationFolder,
}: SimPageClientProps) {
  const { t, localize } = useI18n();
  const { theme } = useTheme();
  const { isPremium, isLoading } = useSubscription();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const basePath = `/${yearId}/${filiereId}/${subjectId}/${topicId}`;
  const simSrc = `/simulations/${simulationFolder}/index.html`;

  // Sync theme to iframe via postMessage
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sendTheme = () => {
      iframe.contentWindow?.postMessage(
        { type: "theme-change", theme: theme || "dark" },
        "*"
      );
    };

    // Send on load and on theme change
    iframe.addEventListener("load", sendTheme);
    sendTheme();

    return () => {
      iframe.removeEventListener("load", sendTheme);
    };
  }, [theme]);

  const breadcrumbItems = [
    { label: t("nav.home"), href: "/" },
    { label: localize(yearTitle), href: `/${yearId}` },
    { label: localize(filiereTitle), href: `/${yearId}/${filiereId}` },
    { label: localize(subjectTitle), href: `/${yearId}/${filiereId}/${subjectId}` },
    { label: localize(topicTitle), href: basePath },
    { label: t("tab.simulation"), href: `${basePath}/sim` },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--border-glass)]">
        <TabLink href={basePath} label={t("tab.lesson")} />
        <TabLink href={`${basePath}/quiz`} label={t("tab.quiz")} />
        <TabLink href={`${basePath}/sim`} label={t("tab.simulation")} active />
      </div>

      {/* Simulation or Paywall */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--text-muted)] border-t-[var(--text-accent)] rounded-full animate-spin" />
        </div>
      ) : !isPremium ? (
        <Paywall type="simulation" />
      ) : (
        <>
          {/* Simulation iframe */}
          <div className="relative rounded-xl overflow-hidden border border-[var(--border-glass)] bg-black" style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}>
            <iframe
              ref={iframeRef}
              src={simSrc}
              className="w-full h-full border-0"
              allow="fullscreen; webgl; webgl2"
              title={localize(topicTitle) + " - Simulation"}
            />
          </div>

          {/* Controls footer */}
          <div className="flex items-center justify-between mt-4 text-xs text-[var(--text-muted)]">
            <span>
              {localize(topicTitle)} — {t("tab.simulation")}
            </span>
            <button
              onClick={() => {
                const iframe = iframeRef.current;
                if (iframe) {
                  iframe.requestFullscreen?.();
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--border-glass)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              Fullscreen
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TabLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-[var(--color-info)] text-[var(--text-accent)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glass)]"
      }`}
    >
      {label}
    </Link>
  );
}
