"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { MathText } from "@/components/lesson/sections/MathText";
import { BlockMath } from "react-katex";
import type { QuizQuestion, UserAnswer } from "@/types/quiz";
import "katex/dist/katex.min.css";

interface ReviewScreenProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
  score: number;
  backHref: string;
  onRetry: () => void;
}

export function ReviewScreen({
  questions,
  userAnswers,
  score,
  backHref,
  onRetry,
}: ReviewScreenProps) {
  const { t, localize } = useI18n();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {t("quiz.review")} — {score}/{questions.length}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-[var(--color-info)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("quiz.retry")}
          </button>
          <Link
            href={backHref}
            className="px-4 py-2 rounded-lg border border-[var(--border-glass)] text-[var(--text-primary)] text-sm hover:bg-[var(--bg-hover)] transition-colors"
          >
            {t("quiz.back")}
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const answer = userAnswers[i];
          const isCorrect = answer?.correct ?? false;

          return (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden ${
                isCorrect
                  ? "border-[var(--color-success)]/30"
                  : "border-[var(--color-error)]/30"
              }`}
            >
              {/* Question header */}
              <div className={`flex items-start gap-3 p-4 ${isCorrect ? "bg-[var(--color-success)]/5" : "bg-[var(--color-error)]/5"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-error)] text-white"}`}>
                  {isCorrect ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">{t("quiz.question")} {i + 1}</span>
                  <p className="text-sm text-[var(--text-primary)] mt-0.5">
                    <MathText text={localize(q.question)} />
                  </p>
                </div>
              </div>

              {/* Answer details */}
              <div className="p-4 bg-[var(--bg-elevated)]">
                {q.type === "mcq" && (
                  <div className="space-y-1">
                    {q.choices.map((choice, ci) => (
                      <div
                        key={ci}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded ${
                          ci === q.correct
                            ? "text-[var(--color-success)] font-medium"
                            : ci === answer?.userValue && ci !== q.correct
                              ? "text-[var(--color-error)] line-through"
                              : "text-[var(--text-muted)]"
                        }`}
                      >
                        <span>{String.fromCharCode(65 + ci)}.</span>
                        <MathText text={localize(choice)} />
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "numeric" && (
                  <div className="text-xs space-y-1">
                    <p className="text-[var(--text-muted)]">
                      Your answer: <span className={isCorrect ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}>{String(answer?.userValue)}</span>
                    </p>
                    <p className="text-[var(--color-success)]">
                      Correct: {q.answer} {q.unit && `(${q.unit})`} (tolerance: {q.tolerance})
                    </p>
                  </div>
                )}

                {q.type === "fill-in" && (
                  <div className="text-xs space-y-1">
                    <p className="text-[var(--text-muted)]">
                      Your answer: <span className={isCorrect ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}>{String(answer?.userValue)}</span>
                    </p>
                    <p className="text-[var(--color-success)]">
                      Accepted: {Array.isArray(q.answer) ? q.answer.join(", ") : q.answer}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-glass)] text-xs text-[var(--text-secondary)]">
                    {typeof q.explanation === "object" && "latex" in q.explanation ? (
                      <BlockMath math={q.explanation.latex} />
                    ) : (
                      <MathText text={localize(q.explanation as { fr: string; ar: string })} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
