"use client";

import { useI18n } from "@/lib/i18n/context";
import type { HeadingSection as HeadingSectionType } from "@/types/lesson";

interface Props {
  section: HeadingSectionType;
  id?: string;
}

export function HeadingSection({ section, id }: Props) {
  const { localize } = useI18n();
  const Tag = `h${section.level}` as "h2" | "h3" | "h4";

  const sizeClasses: Record<number, string> = {
    2: "text-xl md:text-2xl font-bold mt-10 mb-4",
    3: "text-lg md:text-xl font-semibold mt-8 mb-3",
    4: "text-base md:text-lg font-semibold mt-6 mb-2",
  };

  return (
    <Tag
      id={id}
      className={`text-[var(--text-primary)] ${sizeClasses[section.level] || sizeClasses[2]}`}
    >
      {localize(section.text)}
    </Tag>
  );
}
