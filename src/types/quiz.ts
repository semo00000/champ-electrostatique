import type { BilingualText } from "./curriculum";

export interface MCQQuestion {
  type: "mcq";
  question: BilingualText;
  choices: BilingualText[];
  correct: number; // 0-based index
  explanation?: BilingualText | { latex: string };
  hint?: BilingualText;
}

export interface NumericQuestion {
  type: "numeric";
  question: BilingualText;
  answer: number;
  tolerance: number;
  unit?: string;
  explanation?: BilingualText | { latex: string };
  hint?: BilingualText;
}

export interface FillInQuestion {
  type: "fill-in";
  question: BilingualText;
  answer: string | string[];
  explanation?: BilingualText | { latex: string };
  hint?: BilingualText;
}

export type QuizQuestion = MCQQuestion | NumericQuestion | FillInQuestion;

export interface QuizData {
  questions: QuizQuestion[];
}

// Quiz state machine types
export type QuizPhase = "question" | "feedback" | "results" | "review";

export interface UserAnswer {
  questionIndex: number;
  correct: boolean;
  userValue: string | number;
  timeMs: number;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answered: boolean;
  userAnswers: UserAnswer[];
  times: number[];
  questionStartTime: number;
  phase: QuizPhase;
}

export type QuizAction =
  | { type: "ANSWER_MCQ"; choiceIndex: number }
  | { type: "ANSWER_NUMERIC"; value: number }
  | { type: "ANSWER_FILL"; value: string }
  | { type: "NEXT_QUESTION" }
  | { type: "SHOW_RESULTS" }
  | { type: "SHOW_REVIEW" }
  | { type: "RETRY" };
