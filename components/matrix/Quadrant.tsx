"use client";

import { useState, type FormEvent } from "react";
import { actions } from "@/lib/useAppState";
import { QUADRANT_INFO, type Quadrant as Q, type Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

const COLOR: Record<Q, string> = {
  q1: "border-t-q1 text-q1",
  q2: "border-t-q2 text-q2",
  q3: "border-t-q3 text-q3",
  q4: "border-t-q4 text-q4",
};

export function Quadrant({ quadrant, tasks }: { quadrant: Q; tasks: Task[] }) {
  const [draft, setDraft] = useState("");
  const info = QUADRANT_INFO[quadrant];
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const headingId = `quad-${quadrant}-title`;
  const inputId = `quad-${quadrant}-input`;

  function submit(e: FormEvent) {
    e.preventDefault();
    actions.addTask(draft, quadrant);
    setDraft("");
  }

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={`flex min-h-56 flex-col rounded-xl border border-border border-t-4 bg-bg/60 p-4 ${COLOR[quadrant]}`}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h3 id={headingId} className="font-display text-base font-semibold">
            <span className="font-mono text-xs opacity-80">{quadrant.toUpperCase()}</span>{" "}
            {info.title}
          </h3>
          <p className="text-xs text-muted">{info.subtitle}</p>
        </div>
        <span
          className="font-mono text-sm text-muted"
          aria-label={`${open.length} tarefas abertas`}
        >
          {open.length}
        </span>
      </div>

      <ul className="-mx-2 flex-1 space-y-0.5">
        {open.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
        {done.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
        {tasks.length === 0 && (
          <li className="px-2 py-3 text-sm text-muted/70">Nada por aqui.</li>
        )}
      </ul>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Nova tarefa em {info.title}
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="+ Adicionar tarefa"
          maxLength={200}
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-muted/70 focus:border-accent"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label={`Adicionar tarefa em ${info.title}`}
          className="rounded-lg bg-surface-2 px-3 text-sm text-text hover:bg-accent-soft disabled:opacity-40"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
