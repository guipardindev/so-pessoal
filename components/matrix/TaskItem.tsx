"use client";

import { actions } from "@/lib/useAppState";
import { QUADRANT_INFO, QUADRANTS, type Task } from "@/lib/types";

export function TaskItem({ task }: { task: Task }) {
  const checkboxId = `task-${task.id}`;
  return (
    <li className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-2">
      <input
        id={checkboxId}
        type="checkbox"
        checked={task.done}
        onChange={() => actions.toggleTask(task.id)}
        aria-label={`${task.done ? "Reabrir" : "Concluir"} tarefa: ${task.text}`}
        className="size-4 shrink-0 cursor-pointer accent-[var(--accent)]"
      />
      <label
        htmlFor={checkboxId}
        className={`min-w-0 flex-1 cursor-pointer break-words text-sm ${
          task.done ? "text-muted line-through" : "text-text"
        }`}
      >
        {task.text}
      </label>

      <select
        value={task.quadrant}
        onChange={(e) => actions.moveTask(task.id, e.target.value as Task["quadrant"])}
        aria-label={`Mover tarefa "${task.text}" para outro quadrante`}
        className="w-16 shrink-0 cursor-pointer rounded-md sm:w-auto border border-border bg-bg px-1.5 py-1 text-xs text-muted hover:text-text"
      >
        {QUADRANTS.map((q) => (
          <option key={q} value={q}>
            {q.toUpperCase()} · {QUADRANT_INFO[q].title}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => actions.deleteTask(task.id)}
        aria-label={`Excluir tarefa: ${task.text}`}
        title="Excluir"
        className="shrink-0 rounded-md p-1 text-muted hover:bg-q1/15 hover:text-q1"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </li>
  );
}
