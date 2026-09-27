"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BREAK_MS, FOCUS_MS } from "@/lib/storage";
import { actions } from "@/lib/useAppState";
import type { TimerMode, TimerState } from "@/lib/types";

/* Relógio compartilhado: um único intervalo, snapshot estável entre ticks. */
let clock = typeof window === "undefined" ? 0 : Date.now();
function subscribeClock(listener: () => void) {
  const id = window.setInterval(() => {
    clock = Date.now();
    listener();
  }, 250);
  return () => window.clearInterval(id);
}
const getClock = () => clock;
const getServerClock = () => 0;

const DURATION: Record<TimerMode, number> = { foco: FOCUS_MS, pausa: BREAK_MS };
const CYCLES_PER_SET = 4;

function format(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // áudio indisponível: segue silencioso
  }
}

export function Pomodoro({ timer, cyclesToday }: { timer: TimerState; cyclesToday: number }) {
  const now = useSyncExternalStore(subscribeClock, getClock, getServerClock);
  const running = timer.endsAt !== null;
  const remaining = running ? Math.max(0, timer.endsAt! - now) : timer.remainingMs;
  const total = DURATION[timer.mode];
  const progress = 1 - remaining / total;

  useEffect(() => {
    if (running && now > 0 && actions.tickTimer(now)) beep();
  }, [now, running]);

  useEffect(() => {
    if (!running) return;
    const prev = document.title;
    document.title = `${format(remaining)} · ${timer.mode === "foco" ? "Foco" : "Pausa"}`;
    return () => {
      document.title = prev;
    };
  }, [running, remaining, timer.mode]);

  function start() {
    actions.setTimer({ ...timer, endsAt: Date.now() + timer.remainingMs });
  }
  function pause() {
    actions.setTimer({ ...timer, endsAt: null, remainingMs: remaining });
  }
  function reset() {
    actions.setTimer({ mode: timer.mode, endsAt: null, remainingMs: total });
  }
  function switchMode(mode: TimerMode) {
    actions.setTimer({ mode, endsAt: null, remainingMs: DURATION[mode] });
  }

  const R = 88;
  const C = 2 * Math.PI * R;
  const inSet = cyclesToday % CYCLES_PER_SET;

  return (
    <Card id="pomodoro" eyebrow="Focar" title="Pomodoro">
      <div role="group" aria-label="Modo do timer" className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-bg p-1">
        {(["foco", "pausa"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={timer.mode === m}
            onClick={() => switchMode(m)}
            className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
              timer.mode === m ? "bg-accent text-white" : "text-muted hover:text-text"
            }`}
          >
            {m === "foco" ? "Foco · 25" : "Pausa · 5"}
          </button>
        ))}
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={timer.mode === "foco" ? "var(--accent)" : "var(--ok)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            role="timer"
            aria-label={`Tempo restante de ${timer.mode}`}
            className="font-mono text-5xl font-medium tabular-nums"
          >
            {format(remaining)}
          </span>
          <span className="mt-1 text-xs uppercase tracking-[0.2em] text-muted" aria-live="polite">
            {timer.mode === "foco" ? "Foco" : "Pausa"}
            {running ? "" : " · pausado"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {running ? (
          <Button variant="primary" onClick={pause} className="min-w-28">
            Pausar
          </Button>
        ) : (
          <Button variant="primary" onClick={start} className="min-w-28">
            {timer.remainingMs < total ? "Retomar" : "Iniciar"}
          </Button>
        )}
        <Button onClick={reset} aria-label="Reiniciar ciclo atual">
          Reiniciar
        </Button>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted">Ciclos hoje</span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: CYCLES_PER_SET }, (_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full ${
                  i < inSet || (inSet === 0 && cyclesToday > 0) ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-lg" aria-label={`${cyclesToday} pomodoros concluídos hoje`}>
            {cyclesToday}
          </span>
        </div>
      </div>
    </Card>
  );
}
