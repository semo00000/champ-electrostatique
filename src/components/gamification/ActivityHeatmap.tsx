"use client";

import { useProgress } from "@/lib/progress/context";

export function ActivityHeatmap() {
  const { gamification } = useProgress();

  // Get last 7 days
  const days: { date: string; xp: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      xp: gamification.activityMap[dateStr] || 0,
    });
  }

  const maxXP = Math.max(...days.map((d) => d.xp), 1);

  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="flex items-end gap-1">
      {days.map((day, i) => {
        const intensity = day.xp / maxXP;
        const height = Math.max(4, intensity * 24);

        return (
          <div key={day.date} className="flex flex-col items-center gap-0.5">
            <div
              className="w-3 rounded-sm transition-all"
              style={{
                height: `${height}px`,
                backgroundColor:
                  day.xp > 0
                    ? `color-mix(in srgb, var(--color-info) ${Math.round(intensity * 100)}%, var(--bg-hover))`
                    : "var(--bg-hover)",
              }}
              title={`${day.date}: ${day.xp} XP`}
            />
            <span className="text-[8px] text-[var(--text-muted)]">
              {dayLabels[(new Date(day.date).getDay() + 6) % 7]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
