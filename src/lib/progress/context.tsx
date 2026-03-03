"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { TopicProgress, GamificationData } from "@/types/progress";
import {
  calculateLessonXP,
  calculateQuizXP,
  checkStreak,
  calculateLevel,
} from "./xp";
import { useAuth } from "@/lib/auth/context";
import {
  fetchCloudProgress,
  fetchCloudGamification,
  pushProgressEntry,
  pushGamification,
  mergeProgress,
  mergeGamification,
} from "./sync";

const PROGRESS_KEY = "bac_progress";
const GAMIFICATION_KEY = "bac_gamification";

interface ProgressContextType {
  getTopicProgress: (topicKey: string) => TopicProgress;
  markLessonRead: (topicKey: string) => void;
  saveQuizScore: (topicKey: string, score: number, total: number) => void;
  gamification: GamificationData;
  allProgress: Record<string, TopicProgress>;
  levelUpEvent: number | null;
  clearLevelUp: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

function loadProgress(): Record<string, TopicProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(data: Record<string, TopicProgress>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function loadGamification(): GamificationData {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: null,
    activityMap: {},
  };
}

function saveGamification(data: GamificationData) {
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, TopicProgress>>({});
  const [gamification, setGamification] = useState<GamificationData>({
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: null,
    activityMap: {},
  });
  const [levelUpEvent, setLevelUpEvent] = useState<number | null>(null);

  const clearLevelUp = useCallback(() => setLevelUpEvent(null), []);

  // Refs for debounced cloud push
  const progressPushRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gamificationPushRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
    setGamification(loadGamification());
  }, []);

  // Cloud sync when user logs in/out
  useEffect(() => {
    if (!user) return;
    syncWithCloud(user.$id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.$id]);

  async function syncWithCloud(userId: string) {
    try {
      const [cloudProgress, cloudGamification] = await Promise.all([
        fetchCloudProgress(userId),
        fetchCloudGamification(userId),
      ]);

      const localProgress = loadProgress();
      const localGamification = loadGamification();

      const mergedProg = mergeProgress(localProgress, cloudProgress);
      const mergedGam = mergeGamification(localGamification, cloudGamification);

      // Update local storage + state with merged data
      saveProgress(mergedProg);
      saveGamification(mergedGam);
      setProgress(mergedProg);
      setGamification(mergedGam);

      // Push merged data back to cloud (local may have had newer data)
      pushMergedToCloud(userId, mergedProg, cloudProgress, mergedGam);
    } catch (err) {
      console.warn("Cloud sync failed, using local data:", err);
    }
  }

  async function pushMergedToCloud(
    userId: string,
    merged: Record<string, TopicProgress>,
    cloud: Record<string, TopicProgress>,
    gamData: GamificationData
  ) {
    try {
      // Push any entries that differ from cloud
      for (const [key, entry] of Object.entries(merged)) {
        const cloudEntry = cloud[key];
        if (!cloudEntry || JSON.stringify(entry) !== JSON.stringify(cloudEntry)) {
          await pushProgressEntry(userId, key, entry);
        }
      }
      await pushGamification(userId, gamData);
    } catch (err) {
      console.warn("Background cloud push failed:", err);
    }
  }

  // Debounced cloud push helper
  function debouncedProgressPush(topicKey: string, entry: TopicProgress) {
    if (!user) return;
    if (progressPushRef.current) clearTimeout(progressPushRef.current);
    progressPushRef.current = setTimeout(() => {
      pushProgressEntry(user.$id, topicKey, entry).catch(console.warn);
    }, 2000);
  }

  function debouncedGamificationPush(data: GamificationData) {
    if (!user) return;
    if (gamificationPushRef.current) clearTimeout(gamificationPushRef.current);
    gamificationPushRef.current = setTimeout(() => {
      pushGamification(user.$id, data).catch(console.warn);
    }, 2000);
  }

  const updateGamification = useCallback(
    (xpGain: number) => {
      setGamification((prev) => {
        const today = new Date().toISOString().split("T")[0];
        const streakResult = checkStreak(prev.lastActiveDate, today);

        let newStreakDays = prev.streakDays;
        if (streakResult.isNewDay) {
          if (streakResult.streakDays > 0) {
            newStreakDays += streakResult.streakDays;
          } else {
            newStreakDays = 1; // Reset
          }
        }

        const newXp = prev.xp + xpGain;
        const newLevel = calculateLevel(newXp);
        const activityMap = { ...prev.activityMap };
        activityMap[today] = (activityMap[today] || 0) + xpGain;

        if (newLevel > prev.level) {
          setLevelUpEvent(newLevel);
        }

        const updated: GamificationData = {
          xp: newXp,
          level: newLevel,
          streakDays: newStreakDays,
          lastActiveDate: today,
          activityMap,
        };

        saveGamification(updated);
        debouncedGamificationPush(updated);
        return updated;
      });
    },
    []
  );

  const getTopicProgress = useCallback(
    (topicKey: string): TopicProgress => {
      return (
        progress[topicKey] || {
          lessonRead: false,
          quizScore: null,
          quizTotal: null,
        }
      );
    },
    [progress]
  );

  const markLessonRead = useCallback(
    (topicKey: string) => {
      setProgress((prev) => {
        const existing = prev[topicKey];
        if (existing?.lessonRead) return prev; // Already read

        const entry: TopicProgress = {
          lessonRead: true,
          quizScore: existing?.quizScore ?? null,
          quizTotal: existing?.quizTotal ?? null,
          lastVisit: Date.now(),
          lastQuiz: existing?.lastQuiz,
        };

        const updated: Record<string, TopicProgress> = {
          ...prev,
          [topicKey]: entry,
        };

        saveProgress(updated);
        debouncedProgressPush(topicKey, entry);
        return updated;
      });

      updateGamification(calculateLessonXP());
    },
    [updateGamification]
  );

  const saveQuizScore = useCallback(
    (topicKey: string, score: number, total: number) => {
      setProgress((prev) => {
        const existing = prev[topicKey];
        const prevScore = existing?.quizScore ?? 0;
        const xpGain = calculateQuizXP(score, prevScore);

        const entry: TopicProgress = {
          lessonRead: existing?.lessonRead ?? false,
          quizScore: Math.max(score, existing?.quizScore ?? 0),
          quizTotal: total,
          lastVisit: existing?.lastVisit,
          lastQuiz: Date.now(),
        };

        const updated: Record<string, TopicProgress> = {
          ...prev,
          [topicKey]: entry,
        };

        saveProgress(updated);
        debouncedProgressPush(topicKey, entry);

        if (xpGain > 0) {
          updateGamification(xpGain);
        }

        return updated;
      });
    },
    [updateGamification]
  );

  return (
    <ProgressContext.Provider
      value={{ getTopicProgress, markLessonRead, saveQuizScore, gamification, allProgress: progress, levelUpEvent, clearLevelUp }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
