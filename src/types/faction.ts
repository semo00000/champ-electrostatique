// ─── Faction / Lycée vs. Lycée types ─────────────────────────────────────────

export interface SchoolEntry {
  id: string;          // slug: "lycee-moulay-youssef-rabat"
  name: string;
  nameAr: string;
  city: string;
  cityId: string;
  region: string;
  type: "lycee" | "lycee_technique" | "lycee_prive";
  gender: "mixed" | "boys" | "girls";
}

export interface SchoolScore {
  schoolId: string;
  school: SchoolEntry;
  totalXP: number;
  memberCount: number;
  weeklyXP: number;
  rank: number;
  weeklyRank: number;
  trend: "up" | "down" | "stable";
}

export interface FactionMembership {
  userId: string;
  schoolId: string;
  joinedAt: string;
  xpContributed: number;
  weeklyXPContributed: number;
}

export interface FactionLeaderboardEntry extends SchoolScore {
  topContributors: {
    userId: string;
    name: string;
    xp: number;
  }[];
}

export interface FactionLeaderboardResponse {
  global: FactionLeaderboardEntry[];
  weekly: FactionLeaderboardEntry[];
  byCity: Record<string, FactionLeaderboardEntry[]>;
  lastUpdated: string;
  totalSchools: number;
  totalStudents: number;
}

export interface SchoolsData {
  schools: SchoolEntry[];
  scrapedAt: string;
  totalCount: number;
  cityCounts: Record<string, number>;
}
