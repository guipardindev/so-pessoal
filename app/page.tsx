"use client";

import { BrainDump } from "@/components/BrainDump";
import { Header } from "@/components/Header";
import { EisenhowerMatrix } from "@/components/matrix/EisenhowerMatrix";
import { Pomodoro } from "@/components/Pomodoro";
import { dayKey } from "@/lib/date";
import { useAppState } from "@/lib/useAppState";

export default function Home() {
  const state = useAppState();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:py-10">
      <Header />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <BrainDump value={state.brainDump} />
        <Pomodoro timer={state.timer} cyclesToday={state.pomodorosByDate[dayKey()] ?? 0} />
      </div>
      <EisenhowerMatrix tasks={state.tasks} />
    </main>
  );
}
