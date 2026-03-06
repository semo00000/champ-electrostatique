"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BacCoinsDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

export function BacCoinsDisplay({
  amount,
  size = "md",
  showLabel = false,
  animated = false,
}: BacCoinsDisplayProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };
  const iconSize = { sm: "text-sm", md: "text-base", lg: "text-xl" };

  return (
    <motion.div
      initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      className={`inline-flex items-center rounded-full font-semibold border ${sizeClasses[size]}`}
      style={{
        background: "rgba(251, 191, 36, 0.12)",
        borderColor: "rgba(251, 191, 36, 0.3)",
        color: "#fbbf24",
      }}
    >
      <span className={iconSize[size]}>🪙</span>
      <span>{amount.toLocaleString()}</span>
      {showLabel && <span className="text-yellow-400/60 font-normal">BacCoins</span>}
    </motion.div>
  );
}
