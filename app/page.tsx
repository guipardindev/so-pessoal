"use client";

import { BrainDump } from "@/components/BrainDump";
import { Header } from "@/components/Header";
import { EisenhowerMatrix } from "@/components/matrix/EisenhowerMatrix";
import { useAppState } from "@/lib/useAppState";

export default function Home() {
  const state = useAppState();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:py-10">
      <Header />
      <BrainDump value={state.brainDump} />
      <EisenhowerMatrix tasks={state.tasks} />
    </main>
  );
}
