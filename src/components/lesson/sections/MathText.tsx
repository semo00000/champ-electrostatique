"use client";

import { useMemo } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Parses text with inline math ($...$) and block math ($$...$$)
 * and renders them using react-katex components.
 */
export function MathText({ text, className }: MathTextProps) {
  const parts = useMemo(() => parseMathText(text), [text]);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "block-math") {
          return <BlockMath key={i} math={part.content} />;
        }
        if (part.type === "inline-math") {
          return <InlineMath key={i} math={part.content} />;
        }
        // Regular text - render as HTML to support <br>, <strong>, etc.
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </span>
  );
}

interface TextPart {
  type: "text" | "inline-math" | "block-math";
  content: string;
}

function parseMathText(text: string): TextPart[] {
  if (!text) return [];

  const parts: TextPart[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Check for block math ($$...$$) first
    const blockStart = remaining.indexOf("$$");
    const inlineStart = remaining.indexOf("$");

    if (blockStart !== -1 && (blockStart <= inlineStart || inlineStart === -1 || blockStart === inlineStart)) {
      // Found $$ first - try block math
      if (blockStart > 0) {
        parts.push({ type: "text", content: remaining.slice(0, blockStart) });
      }

      const afterOpen = remaining.slice(blockStart + 2);
      const blockEnd = afterOpen.indexOf("$$");

      if (blockEnd !== -1) {
        parts.push({
          type: "block-math",
          content: afterOpen.slice(0, blockEnd).trim(),
        });
        remaining = afterOpen.slice(blockEnd + 2);
        continue;
      }

      // No closing $$, treat as text
      parts.push({ type: "text", content: remaining.slice(0, blockStart + 2) });
      remaining = afterOpen;
      continue;
    }

    if (inlineStart !== -1) {
      // Found single $ - try inline math
      if (inlineStart > 0) {
        parts.push({ type: "text", content: remaining.slice(0, inlineStart) });
      }

      const afterOpen = remaining.slice(inlineStart + 1);
      const inlineEnd = afterOpen.indexOf("$");

      if (inlineEnd !== -1 && inlineEnd > 0) {
        parts.push({
          type: "inline-math",
          content: afterOpen.slice(0, inlineEnd).trim(),
        });
        remaining = afterOpen.slice(inlineEnd + 1);
        continue;
      }

      // No closing $ or empty, treat as text
      parts.push({ type: "text", content: "$" });
      remaining = afterOpen;
      continue;
    }

    // No math found, rest is plain text
    parts.push({ type: "text", content: remaining });
    break;
  }

  return parts;
}
