"use client";

import { BrainDump } from "@/components/BrainDump";
import { Dashboard } from "@/components/Dashboard";
import { Header } from "@/components/Header";
import { EisenhowerMatrix } from "@/components/matrix/EisenhowerMatrix";
import { Pomodoro } from "@/components/Pomodoro";
import { WeekPlanner } from "@/components/WeekPlanner";
import { computeStats } from "@/lib/stats";
import { useAppState } from "@/lib/useAppState";

export default function Home() {
  const state = useAppState();
  const stats = computeStats(state);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:py-10">
      <Header />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <BrainDump value={state.brainDump} />
        <Pomodoro timer={state.timer} cyclesToday={stats.pomodorosToday} />
      </div>
      <EisenhowerMatrix tasks={state.tasks} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <WeekPlanner week={state.week} />
        <Dashboard stats={stats} />
      </div>
      <footer className="pb-4 text-center text-xs text-muted">
        SO Pessoal · Produtividade e Gestão do Tempo · UniFECAF · dados salvos só neste navegador
      </footer>
    </main>
  );
}
