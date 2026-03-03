"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { MathText } from "@/components/lesson/sections/MathText";
import { BlockMath } from "react-katex";
import type { QuizQuestion, QuizAction, UserAnswer } from "@/types/quiz";
import "katex/dist/katex.min.css";

interface QuestionCardProps {
  question: QuizQuestion;
  answered: boolean;
  userAnswer?: UserAnswer;
  onAnswer: (action: QuizAction) => void;
}

export function QuestionCard({ question, answered, userAnswer, onAnswer }: QuestionCardProps) {
  const { t, localize } = useI18n();
  const [numericValue, setNumericValue] = useState("");
  const [fillValue, setFillValue] = useState("");
  const [showHint, setShowHint] = useState(false);

  const questionText = localize(question.question);
  const isCorrect = userAnswer?.correct;

  return (
    <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-card)] overflow-hidden transition-all">
      {/* Question header */}
      <div className="p-6">
        <h3 className="text-base md:text-lg font-medium text-[var(--text-primary)] leading-relaxed">
          <MathText text={questionText} />
        </h3>

        {question.hint && !answered && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-accent)] hover:text-[var(--text-accent-bright)] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {showHint ? t("lesson.hideSolution") : t("quiz.hint")}
          </button>
        )}

        {showHint && question.hint && (
          <div className="mt-3 p-3 rounded-xl bg-[var(--color-info-bg)] border border-[var(--color-info-border)] text-xs text-[var(--text-secondary)] leading-relaxed">
            <MathText text={localize(question.hint)} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-6 pb-6">
        {question.type === "mcq" && (
          <MCQChoices
            choices={question.choices}
            correct={question.correct}
            answered={answered}
            selectedIndex={typeof userAnswer?.userValue === "number" ? userAnswer.userValue : undefined}
            onSelect={(idx) => onAnswer({ type: "ANSWER_MCQ", choiceIndex: idx })}
          />
        )}

        {question.type === "numeric" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={numericValue}
                onChange={(e) => setNumericValue(e.target.value)}
                disabled={answered}
                placeholder="Votre réponse..."
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--color-info-bg)] disabled:opacity-50 transition-all"
              />
              {question.unit && (
                <span className="text-sm font-medium text-[var(--text-muted)] px-2">{question.unit}</span>
              )}
            </div>
            {!answered && (
              <button
                onClick={() => {
                  const val = parseFloat(numericValue);
                  if (!isNaN(val)) onAnswer({ type: "ANSWER_NUMERIC", value: val });
                }}
                disabled={!numericValue}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                style={{ background: "var(--gradient-brand)" }}
              >
                {t("quiz.check")}
              </button>
            )}
          </div>
        )}

        {question.type === "fill-in" && (
          <div className="space-y-3">
            <input
              type="text"
              value={fillValue}
              onChange={(e) => setFillValue(e.target.value)}
              disabled={answered}
              placeholder="Votre réponse..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--color-info-bg)] disabled:opacity-50 transition-all"
            />
            {!answered && (
              <button
                onClick={() => {
                  if (fillValue.trim()) onAnswer({ type: "ANSWER_FILL", value: fillValue.trim() });
                }}
                disabled={!fillValue.trim()}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                style={{ background: "var(--gradient-brand)" }}
              >
                {t("quiz.check")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feedback */}
      {answered && (
        <div
          className="px-6 py-4 border-t"
          style={{
            background: isCorrect ? "var(--color-success-bg)" : "var(--color-error-bg)",
            borderColor: isCorrect ? "var(--color-success-border)" : "var(--color-error-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <div className="w-5 h-5 rounded-full bg-[var(--color-success)] flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-sm font-bold text-[var(--color-success)]">{t("quiz.excellent")}</span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-[var(--color-error)] flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
                <span className="text-sm font-bold text-[var(--color-error)]">{t("quiz.poor")}</span>
              </>
            )}
          </div>
          {question.explanation && (
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
              {typeof question.explanation === "object" && "latex" in question.explanation ? (
                <BlockMath math={(question.explanation as { latex: string }).latex} />
              ) : (
                <MathText text={localize(question.explanation as { fr: string; ar: string })} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MCQChoicesProps {
  choices: { fr: string; ar: string }[];
  correct: number;
  answered: boolean;
  selectedIndex?: number;
  onSelect: (idx: number) => void;
}

function MCQChoices({ choices, correct, answered, selectedIndex, onSelect }: MCQChoicesProps) {
  const { localize } = useI18n();

  return (
    <div className="space-y-2.5">
      {choices.map((choice, idx) => {
        const isCorrectChoice = idx === correct;
        const isSelected = idx === selectedIndex;
        const isWrong = answered && isSelected && !isCorrectChoice;
        const isRight = answered && isCorrectChoice;

        let borderStyle = "border-[var(--border-glass)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-hover)]";
        let bgStyle = "";
        let labelStyle = "bg-[var(--bg-hover)] text-[var(--text-muted)]";

        if (answered) {
          if (isRight) {
            borderStyle = "border-[var(--color-success-border)]";
            bgStyle = "bg-[var(--color-success-bg)]";
            labelStyle = "bg-[var(--color-success)] text-white";
          } else if (isWrong) {
            borderStyle = "border-[var(--color-error-border)]";
            bgStyle = "bg-[var(--color-error-bg)]";
            labelStyle = "bg-[var(--color-error)] text-white";
          }
        } else if (isSelected) {
          borderStyle = "border-[var(--border-accent)]";
          bgStyle = "bg-[var(--color-info-bg)]";
          labelStyle = "bg-[var(--color-info)] text-white";
        }

        return (
          <button
            key={idx}
            onClick={() => !answered && onSelect(idx)}
            disabled={answered}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all active:scale-[0.99] ${borderStyle} ${bgStyle} ${answered ? "cursor-default" : "cursor-pointer"}`}
          >
            <div className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${labelStyle}`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-[var(--text-primary)] flex-1 leading-relaxed">
                <MathText text={localize(choice)} />
              </span>
              {isRight && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" className="shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {isWrong && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5" className="shrink-0 mt-0.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
