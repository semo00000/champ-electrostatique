"use client";

import { useI18n } from "@/lib/i18n/context";
import { useEffect, useRef, useState } from "react";

/**
 * Renders a brief full-page overlay when the display language changes,
 * masking the text reflow and creating a clean transition effect.
 */
export function LangTransition() {
  const { locale } = useI18n();
  const isFirst = useRef(true);
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setActive(true);
    setCount((c) => c + 1);
    const t = setTimeout(() => setActive(false), 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return (
    <div
      key={count}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9997]"
      style={{
        opacity: active ? 1 : 0,
        background: "var(--bg-primary)",
        transition: active ? "none" : "opacity 500ms cubic-bezier(0.16,1,0.3,1)",
      }}
    />
  );
}
