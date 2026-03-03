"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

const NAV_ITEMS = [
  {
    key: "nav.home",
    href: "/",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22" fill="none"/>
      </svg>
    ),
  },
  {
    key: "nav.1bac",
    href: "/1bac",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    key: "nav.2bac",
    href: "/2bac",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    key: "nav.profile",
    href: "/auth/login",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-xl backdrop-saturate-150 pb-[env(safe-area-inset-bottom)]">
      <div className="relative flex items-stretch h-14">
        {/* Animated pill indicator */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-1 h-[calc(100%-8px)] rounded-xl transition-all duration-300 ease-out"
            style={{
              left: `calc(${activeIndex * 25}% + 4px)`,
              width: "calc(25% - 8px)",
              background: "var(--color-info-bg)",
              border: "1px solid var(--color-info-border)",
            }}
          />
        )}

        {NAV_ITEMS.map((item, idx) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-[var(--text-accent)]" : "text-[var(--text-muted)]"
              }`}
            >
              {item.icon(isActive)}
              <span className={`transition-opacity ${isActive ? "opacity-100" : "opacity-70"}`}>
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
