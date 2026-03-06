/**
 * Faction / Lycée vs. Lycée logic.
 * School score aggregation, leaderboard ranking, contribution tracking.
 */

import type { SchoolEntry, SchoolScore, FactionLeaderboardEntry } from "@/types/faction";
import schoolsData from "@/../public/data/schools.json";

const SCHOOLS_MAP = new Map<string, SchoolEntry>(
  (schoolsData.schools as SchoolEntry[]).map((s) => [s.id, s])
);

export function getSchool(schoolId: string): SchoolEntry | null {
  return SCHOOLS_MAP.get(schoolId) ?? null;
}

export function getAllSchools(): SchoolEntry[] {
  return schoolsData.schools as SchoolEntry[];
}

export function getSchoolsByCity(cityId: string): SchoolEntry[] {
  return (schoolsData.schools as SchoolEntry[]).filter((s) => s.cityId === cityId);
}

export function getCities(): string[] {
  return [...new Set((schoolsData.schools as SchoolEntry[]).map((s) => s.city))].sort();
}

export function getSchoolsByCityGrouped(): Record<string, SchoolEntry[]> {
  const grouped: Record<string, SchoolEntry[]> = {};
  for (const school of schoolsData.schools as SchoolEntry[]) {
    if (!grouped[school.city]) grouped[school.city] = [];
    grouped[school.city].push(school);
  }
  return grouped;
}

/**
 * Build a leaderboard from raw school score data.
 * Input: list of { schoolId, totalXP, weeklyXP, memberCount }
 */
export function buildLeaderboard(
  rawScores: { schoolId: string; totalXP: number; weeklyXP: number; memberCount: number }[]
): FactionLeaderboardEntry[] {
  const sorted = [...rawScores].sort((a, b) => b.totalXP - a.totalXP);
  const weeklySorted = [...rawScores].sort((a, b) => b.weeklyXP - a.weeklyXP);
  const weeklyRankMap = new Map(weeklySorted.map((s, i) => [s.schoolId, i + 1]));

  return sorted.map((s, i) => {
    const school = SCHOOLS_MAP.get(s.schoolId) ?? {
      id: s.schoolId,
      name: s.schoolId,
      nameAr: "",
      city: "Unknown",
      cityId: "unknown",
      region: "",
      type: "lycee" as const,
      gender: "mixed" as const,
    };

    // Determine trend: compare global rank to weekly rank
    const globalRank = i + 1;
    const weeklyRank = weeklyRankMap.get(s.schoolId) ?? globalRank;
    const trend: SchoolScore["trend"] =
      weeklyRank < globalRank ? "up" : weeklyRank > globalRank ? "down" : "stable";

    return {
      schoolId: s.schoolId,
      school,
      totalXP: s.totalXP,
      memberCount: s.memberCount,
      weeklyXP: s.weeklyXP,
      rank: globalRank,
      weeklyRank,
      trend,
      topContributors: [],
    };
  });
}
