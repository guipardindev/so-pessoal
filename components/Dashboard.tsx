"use client";

import { Card } from "@/components/ui/Card";
import type { Stats } from "@/lib/stats";
import { QUADRANT_INFO, QUADRANTS, type Quadrant } from "@/lib/types";

const BAR: Record<Quadrant, string> = {
  q1: "bg-q1",
  q2: "bg-q2",
  q3: "bg-q3",
  q4: "bg-q4",
};

function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg/60 p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-3xl font-medium tabular-nums">
        {value}
        {hint && <span className="ml-1 text-sm text-muted">{hint}</span>}
      </dd>
    </div>
  );
}

export function Dashboard({ stats }: { stats: Stats }) {
  const openTotal = QUADRANTS.reduce((n, q) => n + stats.byQuadrant[q], 0);

  return (
    <Card id="painel" eyebrow="Medir" title="Painel de produtividade">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Concluídas hoje" value={stats.doneToday} />
        <StatCard label="Tarefas abertas" value={stats.open} />
        <StatCard label="Pomodoros hoje" value={stats.pomodorosToday} />
        <StatCard
          label="Dias em sequência"
          value={stats.streak}
          hint={stats.streak === 1 ? "dia" : "dias"}
        />
      </dl>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-medium">Abertas por quadrante</h3>
          <ul className="space-y-2.5">
            {QUADRANTS.map((q) => {
              const n = stats.byQuadrant[q];
              const pct = openTotal ? (n / openTotal) * 100 : 0;
              return (
                <li key={q} className="grid grid-cols-[92px_1fr_28px] items-center gap-3 text-sm">
                  <span className="truncate text-muted">
                    <span className="font-mono text-xs">{q.toUpperCase()}</span> {QUADRANT_INFO[q].action}
                  </span>
                  <div
                    role="meter"
                    aria-label={`${QUADRANT_INFO[q].title}: ${n} tarefas abertas`}
                    aria-valuemin={0}
                    aria-valuemax={openTotal}
                    aria-valuenow={n}
                    className="h-2 overflow-hidden rounded-full bg-border"
                  >
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${BAR[q]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-right font-mono text-muted">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Taxa de conclusão</h3>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-medium tabular-nums">{stats.completionRate}%</span>
            <span className="text-sm text-muted">
              {stats.done} de {stats.total} tarefas
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Taxa de conclusão"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.completionRate}
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-border"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            {stats.byQuadrant.q2 >= stats.byQuadrant.q1
              ? "Bom sinal: mais energia no que é importante do que no que é urgente."
              : "Muito incêndio em Q1 — reserve blocos em Q2 para prevenir urgências."}
          </p>
        </div>
      </div>
    </Card>
  );
}
