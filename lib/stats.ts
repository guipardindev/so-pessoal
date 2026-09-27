import { addDays, dayKey } from "./date";
import { QUADRANTS, type AppState, type Quadrant } from "./types";

export interface Stats {
  doneToday: number;
  open: number;
  pomodorosToday: number;
  streak: number;
  byQuadrant: Record<Quadrant, number>;
  completionRate: number; // 0–100
  total: number;
  done: number;
}

/**
 * Dias seguidos com atividade (tarefa concluída ou pomodoro). Se hoje ainda
 * não teve atividade, a sequência de ontem continua valendo até o fim do dia.
 */
export function computeStreak(activeDays: string[], now = new Date()): number {
  const days = new Set(activeDays);
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeStats(state: AppState, now = new Date()): Stats {
  const today = dayKey(now);
  const byQuadrant = Object.fromEntries(QUADRANTS.map((q) => [q, 0])) as Record<Quadrant, number>;
  let done = 0;
  let doneToday = 0;

  for (const t of state.tasks) {
    if (t.done) {
      done++;
      if (t.completedAt && dayKey(t.completedAt) === today) doneToday++;
    } else {
      byQuadrant[t.quadrant]++;
    }
  }

  const total = state.tasks.length;
  return {
    doneToday,
    open: total - done,
    pomodorosToday: state.pomodorosByDate[today] ?? 0,
    streak: computeStreak(state.activeDays, now),
    byQuadrant,
    completionRate: total ? Math.round((done / total) * 100) : 0,
    total,
    done,
  };
}
