export type Quadrant = "q1" | "q2" | "q3" | "q4";

export const QUADRANTS: Quadrant[] = ["q1", "q2", "q3", "q4"];

export const QUADRANT_INFO: Record<
  Quadrant,
  { title: string; subtitle: string; action: string }
> = {
  q1: { title: "Fazer agora", subtitle: "Urgente e importante", action: "Fazer" },
  q2: { title: "Agendar", subtitle: "Importante, não urgente", action: "Agendar" },
  q3: { title: "Delegar", subtitle: "Urgente, não importante", action: "Delegar" },
  q4: { title: "Eliminar", subtitle: "Nem urgente, nem importante", action: "Eliminar" },
};

export interface Task {
  id: string;
  text: string;
  quadrant: Quadrant;
  done: boolean;
  createdAt: string; // ISO
  completedAt?: string; // ISO
}

export type WeekDay = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export const WEEK_DAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: "seg", label: "Segunda", short: "Seg" },
  { key: "ter", label: "Terça", short: "Ter" },
  { key: "qua", label: "Quarta", short: "Qua" },
  { key: "qui", label: "Quinta", short: "Qui" },
  { key: "sex", label: "Sexta", short: "Sex" },
  { key: "sab", label: "Sábado", short: "Sáb" },
  { key: "dom", label: "Domingo", short: "Dom" },
];

export type TimerMode = "foco" | "pausa";

export interface TimerState {
  mode: TimerMode;
  /** timestamp (ms) em que o ciclo atual termina; null = pausado */
  endsAt: number | null;
  /** tempo restante quando pausado */
  remainingMs: number;
}

export interface AppState {
  version: 1;
  tasks: Task[];
  /** pomodoros de foco concluídos por dia (YYYY-MM-DD) */
  pomodorosByDate: Record<string, number>;
  /** dias (YYYY-MM-DD) com alguma atividade concluída — base do streak */
  activeDays: string[];
  week: Record<WeekDay, string>;
  timer: TimerState;
  brainDump: string;
}

export interface OrganizeResponse {
  tasks: { text: string; quadrant: Quadrant }[];
  source: "ia" | "heuristica";
}
