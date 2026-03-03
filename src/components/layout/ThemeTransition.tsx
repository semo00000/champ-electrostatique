"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

/**
 * Renders a brief full-page overlay that flashes when the theme changes,
 * creating the perception of a smooth dark↔light transition.
 */
export function ThemeTransition() {
  const { resolvedTheme } = useTheme();
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
    const t = setTimeout(() => setActive(false), 450);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  return (
    <div
      key={count}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{
        opacity: active ? 1 : 0,
        background:
          resolvedTheme === "dark"
            ? "rgba(8, 8, 10, 0.55)"
            : "rgba(244, 245, 248, 0.6)",
        transition: active ? "none" : "opacity 450ms cubic-bezier(0.16,1,0.3,1)",
      }}
    />
  );
}
