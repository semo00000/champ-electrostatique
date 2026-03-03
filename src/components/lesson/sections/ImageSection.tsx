"use client";

import { useI18n } from "@/lib/i18n/context";
import type { ImageSection as ImageSectionType } from "@/types/lesson";

interface Props {
  section: ImageSectionType;
}

export function ImageSection({ section }: Props) {
  const { localize } = useI18n();
  const alt = section.alt ? localize(section.alt) : "";

  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.src}
        alt={alt}
        loading="lazy"
        className="rounded-xl max-w-full mx-auto border border-[var(--border-glass)]"
      />
      {alt && (
        <figcaption className="text-xs text-center text-[var(--text-muted)] mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}
