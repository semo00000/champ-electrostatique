"use client";

import { useReducer, useCallback } from "react";
import type { QuizQuestion, QuizState, QuizAction, UserAnswer } from "@/types/quiz";
import { useI18n } from "@/lib/i18n/context";
import { QuestionCard } from "./QuestionCard";
import { QuizProgress } from "./QuizProgress";
import { ResultScreen } from "./ResultScreen";
import { ReviewScreen } from "./ReviewScreen";

interface QuizEngineProps {
  questions: QuizQuestion[];
  topicTitle: string;
  backHref: string;
}

function initState(questions: QuizQuestion[]): QuizState {
  return {
    questions,
    currentIndex: 0,
    score: 0,
    answered: false,
    userAnswers: [],
    times: [],
    questionStartTime: Date.now(),
    phase: "question",
  };
}

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "ANSWER_MCQ": {
      if (state.answered) return state;
      const q = state.questions[state.currentIndex];
      if (q.type !== "mcq") return state;
      const isCorrect = action.choiceIndex === q.correct;
      const timeMs = Date.now() - state.questionStartTime;
      const answer: UserAnswer = {
        questionIndex: state.currentIndex,
        correct: isCorrect,
        userValue: action.choiceIndex,
        timeMs,
      };
      return {
        ...state,
        answered: true,
        score: isCorrect ? state.score + 1 : state.score,
        userAnswers: [...state.userAnswers, answer],
        times: [...state.times, timeMs],
        phase: "feedback",
      };
    }

    case "ANSWER_NUMERIC": {
      if (state.answered) return state;
      const q = state.questions[state.currentIndex];
      if (q.type !== "numeric") return state;
      const isCorrect = Math.abs(action.value - q.answer) <= q.tolerance;
      const timeMs = Date.now() - state.questionStartTime;
      const answer: UserAnswer = {
        questionIndex: state.currentIndex,
        correct: isCorrect,
        userValue: action.value,
        timeMs,
      };
      return {
        ...state,
        answered: true,
        score: isCorrect ? state.score + 1 : state.score,
        userAnswers: [...state.userAnswers, answer],
        times: [...state.times, timeMs],
        phase: "feedback",
      };
    }

    case "ANSWER_FILL": {
      if (state.answered) return state;
      const q = state.questions[state.currentIndex];
      if (q.type !== "fill-in") return state;
      const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
      const isCorrect = accepted.some(
        (a) => a.toLowerCase().trim() === action.value.toLowerCase().trim()
      );
      const timeMs = Date.now() - state.questionStartTime;
      const answer: UserAnswer = {
        questionIndex: state.currentIndex,
        correct: isCorrect,
        userValue: action.value,
        timeMs,
      };
      return {
        ...state,
        answered: true,
        score: isCorrect ? state.score + 1 : state.score,
        userAnswers: [...state.userAnswers, answer],
        times: [...state.times, timeMs],
        phase: "feedback",
      };
    }

    case "NEXT_QUESTION": {
      const nextIdx = state.currentIndex + 1;
      if (nextIdx >= state.questions.length) {
        return { ...state, phase: "results" };
      }
      return {
        ...state,
        currentIndex: nextIdx,
        answered: false,
        questionStartTime: Date.now(),
        phase: "question",
      };
    }

    case "SHOW_RESULTS":
      return { ...state, phase: "results" };

    case "SHOW_REVIEW":
      return { ...state, phase: "review" };

    case "RETRY":
      return initState(state.questions);

    default:
      return state;
  }
}

export function QuizEngine({ questions, topicTitle, backHref }: QuizEngineProps) {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(quizReducer, questions, initState);

  const handleNext = useCallback(() => {
    if (state.currentIndex >= state.questions.length - 1) {
      dispatch({ type: "SHOW_RESULTS" });
    } else {
      dispatch({ type: "NEXT_QUESTION" });
    }
  }, [state.currentIndex, state.questions.length]);

  if (state.phase === "results") {
    return (
      <ResultScreen
        score={state.score}
        total={state.questions.length}
        topicTitle={topicTitle}
        backHref={backHref}
        onRetry={() => dispatch({ type: "RETRY" })}
        onReview={() => dispatch({ type: "SHOW_REVIEW" })}
      />
    );
  }

  if (state.phase === "review") {
    return (
      <ReviewScreen
        questions={state.questions}
        userAnswers={state.userAnswers}
        score={state.score}
        backHref={backHref}
        onRetry={() => dispatch({ type: "RETRY" })}
      />
    );
  }

  const currentQuestion = state.questions[state.currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <QuizProgress
        current={state.currentIndex}
        total={state.questions.length}
        answers={state.userAnswers}
      />

      {/* Question number */}
      <div className="text-xs text-[var(--text-muted)] mb-4">
        {t("quiz.question")} {state.currentIndex + 1} {t("quiz.of")} {state.questions.length}
      </div>

      {/* Question card */}
      <QuestionCard
        question={currentQuestion}
        answered={state.answered}
        userAnswer={state.userAnswers[state.currentIndex]}
        onAnswer={(action) => dispatch(action)}
      />

      {/* Next button (only visible after answering) */}
      {state.answered && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-info)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {state.currentIndex >= state.questions.length - 1
              ? t("quiz.score")
              : t("quiz.next")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
