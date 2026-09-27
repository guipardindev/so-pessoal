import type { AppState } from "./types";

export const STORAGE_KEY = "so-pessoal:v1";

export const FOCUS_MS = 25 * 60 * 1000;
export const BREAK_MS = 5 * 60 * 1000;

export const DEFAULT_STATE: AppState = {
  version: 1,
  tasks: [],
  pomodorosByDate: {},
  activeDays: [],
  week: { seg: "", ter: "", qua: "", qui: "", sex: "", sab: "", dom: "" },
  timer: { mode: "foco", endsAt: null, remainingMs: FOCUS_MS },
  brainDump: "",
};

export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== 1) return DEFAULT_STATE;
    // mescla com o padrão para tolerar campos novos/ausentes
    return {
      ...DEFAULT_STATE,
      ...parsed,
      week: { ...DEFAULT_STATE.week, ...parsed.week },
      timer: { ...DEFAULT_STATE.timer, ...parsed.timer },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // armazenamento cheio ou bloqueado (aba anônima): segue só em memória
  }
}
