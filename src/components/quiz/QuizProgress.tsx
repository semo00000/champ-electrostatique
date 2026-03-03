"use client";

import type { UserAnswer } from "@/types/quiz";

interface QuizProgressProps {
  current: number;
  total: number;
  answers: UserAnswer[];
}

export function QuizProgress({ current, total, answers }: QuizProgressProps) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const answer = answers.find((a) => a.questionIndex === i);
        let dotClass = "bg-[var(--bg-hover)]"; // unanswered

        if (answer) {
          dotClass = answer.correct
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-error)]";
        } else if (i === current) {
          dotClass = "bg-[var(--color-info)] animate-pulse";
        }

        return (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${dotClass}`}
          />
        );
      })}
    </div>
  );
}
