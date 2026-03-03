"use client";

import { useState, useEffect, useRef } from "react";
import type { LessonData, HeadingSection } from "@/types/lesson";
import { useI18n } from "@/lib/i18n/context";

interface TableOfContentsProps {
  lesson: LessonData;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ lesson }: TableOfContentsProps) {
  const { localize } = useI18n();
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from lesson sections
  const headings: TocItem[] = [];
  let idx = 0;
  for (const section of lesson.sections) {
    if (section.type === "heading") {
      headings.push({
        id: `heading-${idx}`,
        text: localize((section as HeadingSection).text),
        level: (section as HeadingSection).level,
      });
      idx++;
    }
  }

  // IntersectionObserver to track active heading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="hidden lg:block sticky top-[calc(var(--spacing-header)+24px)]">
      <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)]">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Sommaire
        </h4>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                onClick={() => handleClick(h.id)}
                className={`block w-full text-left text-xs py-1 transition-colors ${
                  h.level === 3 ? "ps-3" : h.level === 4 ? "ps-6" : ""
                } ${
                  activeId === h.id
                    ? "text-[var(--text-accent)] font-medium"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
