'use client';

import { create } from 'zustand';

export type QuizMode = 'exploration' | 'practice' | 'exam';

export interface QuizAnswer {
  questionId:        string;
  selectedOptionId:  string | null;
  selectedOptionIds?: string[];
  isCorrect:         boolean;
  timeSpent:         number; // seconds
}

interface QuizState {
  // Config
  mode:           QuizMode;
  moduleId:       string | null;
  totalQuestions: number;

  // Progress
  currentIndex:   number;
  answers:        Record<string, QuizAnswer>; // keyed by questionId
  bookmarked:     Set<string>;                // questionIds

  // Timer (exam mode)
  timerSeconds:   number;
  timerActive:    boolean;

  // Status
  isCompleted:    boolean;
  attemptId:      string | null;

  // Actions
  initQuiz: (config: { mode: QuizMode; moduleId: string; totalQuestions: number; durationSeconds?: number }) => void;
  answerQuestion: (questionId: string, optionId: string, isCorrect: boolean, selectedOptionIds?: string[]) => void;
  goToNext: () => void;
  goToPrev: () => void;
  goTo: (index: number) => void;
  toggleBookmark: (questionId: string) => void;
  tickTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  completeQuiz: (attemptId: string) => void;
  resetQuiz: () => void;
}

const initialState = {
  mode:           'practice' as QuizMode,
  moduleId:       null,
  totalQuestions: 0,
  currentIndex:   0,
  answers:        {},
  bookmarked:     new Set<string>(),
  timerSeconds:   0,
  timerActive:    false,
  isCompleted:    false,
  attemptId:      null,
};

export const useQuizStore = create<QuizState>((set, get) => ({
  ...initialState,

  initQuiz({ mode, moduleId, totalQuestions, durationSeconds }) {
    set({
      mode,
      moduleId,
      totalQuestions,
      currentIndex:  0,
      answers:       {},
      bookmarked:    new Set(),
      timerSeconds:  durationSeconds ?? 0,
      timerActive:   mode === 'exam',
      isCompleted:   false,
      attemptId:     null,
    });
  },

  answerQuestion(questionId, optionId, isCorrect, selectedOptionIds) {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          questionId,
          selectedOptionId: optionId,
          selectedOptionIds: selectedOptionIds ?? [optionId],
          isCorrect,
          timeSpent: 0,
        },
      },
    }));
  },

  goToNext() {
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.totalQuestions - 1),
    }));
  },

  goToPrev() {
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    }));
  },

  goTo(index) {
    set({ currentIndex: index });
  },

  toggleBookmark(questionId) {
    set((state) => {
      const next = new Set(state.bookmarked);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return { bookmarked: next };
    });
  },

  tickTimer() {
    const { timerSeconds, timerActive } = get();
    if (!timerActive) return;
    if (timerSeconds <= 1) {
      // Auto-submit
      set({ timerSeconds: 0, timerActive: false, isCompleted: true });
    } else {
      set({ timerSeconds: timerSeconds - 1 });
    }
  },

  pauseTimer() { set({ timerActive: false }); },
  resumeTimer() { set({ timerActive: true }); },

  completeQuiz(attemptId) {
    set({ isCompleted: true, timerActive: false, attemptId });
  },

  resetQuiz() {
    set(initialState);
  },
}));

// Derived selectors
export const selectScore = (state: QuizState) => {
  const answered = Object.values(state.answers);
  if (answered.length === 0) return 0;
  const correct = answered.filter((a) => a.isCorrect).length;
  return Math.round((correct / state.totalQuestions) * 100);
};

export const selectAnsweredCount = (state: QuizState) =>
  Object.keys(state.answers).length;

export const selectCorrectCount = (state: QuizState) =>
  Object.values(state.answers).filter((a) => a.isCorrect).length;
