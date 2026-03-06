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
  calculateLessonBacCoins,
  calculateQuizBacCoins,
  calculateRank,
  canBuyStreakFreeze,
  spendStreakFreeze,
  checkStreakWithFreeze,
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
  buyStreakFreeze: () => boolean;   // returns false if insufficient coins
  earnBacCoins: (amount: number) => void;
  addEarnedReward: (rewardId: string) => void;
  joinSchool: (schoolId: string) => void;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      const lastActiveDate: string | null = parsed.lastActiveDate ?? null;
      const today = new Date().toISOString().split("T")[0];

      // Validate streak: if lastActiveDate is stale (>2 days ago without a valid freeze)
      // reset streakDays to 0 so it doesn't show phantom streaks
      let streakDays: number = parsed.streakDays ?? 0;
      if (streakDays > 0 && lastActiveDate && lastActiveDate !== today) {
        const last = new Date(lastActiveDate);
        const now = new Date(today);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        const freezeCount: number = parsed.streakFreezeCount ?? 0;
        const freezeUsedAt: string | null = parsed.streakFreezeUsedAt ?? null;
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const freezeUsedRecently = freezeUsedAt && new Date(freezeUsedAt) >= weekAgo;
        // Reset if missed more than 1 day (or 2 days without an unused freeze)
        if (diffDays > 2 || (diffDays === 2 && (freezeCount === 0 || freezeUsedRecently))) {
          streakDays = 0;
        }
      }

      return {
        xp: parsed.xp ?? 0,
        level: parsed.level ?? 1,
        streakDays,
        lastActiveDate,
        activityMap: parsed.activityMap ?? {},
        bacCoins: parsed.bacCoins ?? 0,
        streakFreezeCount: parsed.streakFreezeCount ?? 0,
        streakFreezeUsedAt: parsed.streakFreezeUsedAt ?? null,
        rank: parsed.rank ?? "jid3_mouchtarak",
        schoolId: parsed.schoolId ?? null,
        earnedRewards: parsed.earnedRewards ?? [],
      };
    }
  } catch {}
  return {
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: null,
    activityMap: {},
    bacCoins: 0,
    streakFreezeCount: 0,
    streakFreezeUsedAt: null,
    rank: "jid3_mouchtarak",
    schoolId: null,
    earnedRewards: [],
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
    bacCoins: 0,
    streakFreezeCount: 0,
    streakFreezeUsedAt: null,
    rank: "jid3_mouchtarak",
    schoolId: null,
    earnedRewards: [],
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
    (xpGain: number, coinGain: number = 0) => {
      setGamification((prev) => {
        const today = new Date().toISOString().split("T")[0];
        const streakResult = checkStreakWithFreeze(
          prev.lastActiveDate,
          today,
          prev.streakFreezeCount,
          prev.streakFreezeUsedAt
        );

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
        const newRank = calculateRank(newXp);
        const activityMap = { ...prev.activityMap };
        activityMap[today] = (activityMap[today] || 0) + xpGain;

        if (newLevel > prev.level) {
          setLevelUpEvent(newLevel);
        }

        const updated: GamificationData = {
          ...prev,
          xp: newXp,
          level: newLevel,
          rank: newRank,
          streakDays: newStreakDays,
          lastActiveDate: today,
          activityMap,
          bacCoins: prev.bacCoins + coinGain,
          streakFreezeCount: streakResult.newFreezeCount,
          streakFreezeUsedAt: streakResult.newFreezeUsedAt,
        };

        saveGamification(updated);
        debouncedGamificationPush(updated);

        // Contribute XP to faction if user has a school
        if (xpGain > 0 && prev.schoolId && user) {
          fetch("/api/faction/contribute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.$id, xp: xpGain }),
          }).catch(() => {/* silent — best-effort */});
        }

        return updated;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
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

      updateGamification(calculateLessonXP(), calculateLessonBacCoins());
    },
    [updateGamification]
  );

  const saveQuizScore = useCallback(
    (topicKey: string, score: number, total: number) => {
      setProgress((prev) => {
        const existing = prev[topicKey];
        const prevScore = existing?.quizScore ?? 0;
        const xpGain = calculateQuizXP(score, prevScore);
        const coinGain = calculateQuizBacCoins(score, prevScore);

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

        if (xpGain > 0 || coinGain > 0) {
          updateGamification(xpGain, coinGain);
        }

        return updated;
      });
    },
    [updateGamification]
  );

  const buyStreakFreeze = useCallback((): boolean => {
    let success = false;
    setGamification((prev) => {
      if (!canBuyStreakFreeze(prev.bacCoins)) return prev;
      success = true;
      const updated: GamificationData = {
        ...prev,
        bacCoins: spendStreakFreeze(prev.bacCoins),
        streakFreezeCount: prev.streakFreezeCount + 1,
      };
      saveGamification(updated);
      debouncedGamificationPush(updated);
      return updated;
    });
    return success;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const earnBacCoins = useCallback((amount: number) => {
    setGamification((prev) => {
      const updated: GamificationData = { ...prev, bacCoins: prev.bacCoins + amount };
      saveGamification(updated);
      debouncedGamificationPush(updated);
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addEarnedReward = useCallback((rewardId: string) => {
    setGamification((prev) => {
      if (prev.earnedRewards.includes(rewardId)) return prev;
      const updated: GamificationData = {
        ...prev,
        earnedRewards: [...prev.earnedRewards, rewardId],
      };
      saveGamification(updated);
      debouncedGamificationPush(updated);
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinSchool = useCallback((schoolId: string) => {
    setGamification((prev) => {
      if (prev.schoolId === schoolId) return prev;
      const updated: GamificationData = { ...prev, schoolId };
      saveGamification(updated);
      debouncedGamificationPush(updated);
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProgressContext.Provider
      value={{ getTopicProgress, markLessonRead, saveQuizScore, gamification, allProgress: progress, levelUpEvent, clearLevelUp, buyStreakFreeze, earnBacCoins, addEarnedReward, joinSchool }}
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
