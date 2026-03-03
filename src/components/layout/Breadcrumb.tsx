"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const { dir } = useI18n();

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4 flex-wrap"
    >
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={dir === "rtl" ? "rotate-180" : ""}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          {i === items.length - 1 ? (
            <span className="text-[var(--text-secondary)] font-medium">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
