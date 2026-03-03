"use client";

import { useI18n } from "@/lib/i18n/context";
import { MathText } from "./MathText";
import type { ListSection as ListSectionType } from "@/types/lesson";

interface Props {
  section: ListSectionType;
}

export function ListSection({ section }: Props) {
  const { localizeArray } = useI18n();
  const items = localizeArray(section.items);
  const Tag = section.ordered ? "ol" : "ul";

  return (
    <Tag className={`my-4 ps-5 space-y-1 ${section.ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((item, i) => (
        <li key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">
          <MathText text={item} />
        </li>
      ))}
    </Tag>
  );
}
