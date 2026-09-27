"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

function formatToday() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function Header() {
  // data só no cliente: evita divergência de fuso entre servidor e navegador
  const today = useSyncExternalStore(noop, formatToday, () => "");

  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Sistema operacional pessoal
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          SO Pessoal
        </h1>
      </div>
      <p className="text-sm capitalize text-muted" suppressHydrationWarning>
        {today}
      </p>
    </header>
  );
}
