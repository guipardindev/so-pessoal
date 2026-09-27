"use client";

import { useSyncExternalStore } from "react";
import { dayKey } from "./date";
import {
  BREAK_MS,
  DEFAULT_STATE,
  FOCUS_MS,
  loadState,
  saveState,
  STORAGE_KEY,
} from "./storage";
import type { AppState, Quadrant, Task, TimerState, WeekDay } from "./types";

/*
 * Store mínima fora do React: um único estado, persistido no localStorage a
 * cada mudança. useSyncExternalStore usa DEFAULT_STATE no servidor e na
 * hidratação, e depois troca pelo estado salvo — sem mismatch de hydration.
 */

let state: AppState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): AppState {
  if (state === null) state = loadState();
  return state;
}

function getServerSnapshot(): AppState {
  return DEFAULT_STATE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // sincroniza entre abas
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = loadState();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(fn: (s: AppState) => AppState) {
  state = fn(getSnapshot());
  saveState(state);
  listeners.forEach((l) => l());
}

function markActive(s: AppState, day = dayKey()): string[] {
  return s.activeDays.includes(day) ? s.activeDays : [...s.activeDays, day];
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const actions = {
  addTask(text: string, quadrant: Quadrant) {
    const clean = text.trim();
    if (!clean) return;
    update((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        { id: newId(), text: clean, quadrant, done: false, createdAt: new Date().toISOString() },
      ],
    }));
  },

  addTasks(items: { text: string; quadrant: Quadrant }[]) {
    const now = new Date().toISOString();
    update((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        ...items
          .filter((i) => i.text.trim())
          .map<Task>((i) => ({
            id: newId(),
            text: i.text.trim(),
            quadrant: i.quadrant,
            done: false,
            createdAt: now,
          })),
      ],
    }));
  },

  toggleTask(id: string) {
    update((s) => {
      const target = s.tasks.find((t) => t.id === id);
      if (!target) return s;
      const done = !target.done;
      return {
        ...s,
        activeDays: done ? markActive(s) : s.activeDays,
        tasks: s.tasks.map((t) =>
          t.id === id
            ? { ...t, done, completedAt: done ? new Date().toISOString() : undefined }
            : t,
        ),
      };
    });
  },

  moveTask(id: string, quadrant: Quadrant) {
    update((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, quadrant } : t)),
    }));
  },

  deleteTask(id: string) {
    update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  clearDone() {
    update((s) => ({ ...s, tasks: s.tasks.filter((t) => !t.done) }));
  },

  setBrainDump(text: string) {
    update((s) => ({ ...s, brainDump: text }));
  },

  setWeekFocus(day: WeekDay, focus: string) {
    update((s) => ({ ...s, week: { ...s.week, [day]: focus } }));
  },

  clearWeek() {
    update((s) => ({ ...s, week: { ...DEFAULT_STATE.week } }));
  },

  setTimer(timer: TimerState) {
    update((s) => ({ ...s, timer }));
  },

  /**
   * Avança o timer se o ciclo atual terminou. Foco concluído conta um
   * pomodoro e inicia a pausa; pausa concluída deixa o próximo foco pronto.
   * Retorna o modo que acabou de terminar (ou null).
   */
  tickTimer(now = Date.now()): TimerState["mode"] | null {
    const { timer } = getSnapshot();
    if (timer.endsAt === null || timer.endsAt > now) return null;

    if (timer.mode === "foco") {
      const today = dayKey(timer.endsAt);
      update((s) => ({
        ...s,
        timer: { mode: "pausa", endsAt: now + BREAK_MS, remainingMs: BREAK_MS },
        activeDays: markActive(s, today),
        pomodorosByDate: {
          ...s.pomodorosByDate,
          [today]: (s.pomodorosByDate[today] ?? 0) + 1,
        },
      }));
    } else {
      update((s) => ({
        ...s,
        timer: { mode: "foco", endsAt: null, remainingMs: FOCUS_MS },
      }));
    }
    return timer.mode;
  },
};

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
