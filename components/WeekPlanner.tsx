"use client";

import { useSyncExternalStore } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { actions } from "@/lib/useAppState";
import { WEEK_DAYS, type WeekDay } from "@/lib/types";

// getDay(): 0 = domingo … 6 = sábado
const BY_JS_DAY: WeekDay[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
const noop = () => () => {};
const getToday = () => BY_JS_DAY[new Date().getDay()];
const getServerToday = () => null;

export function WeekPlanner({ week }: { week: Record<WeekDay, string> }) {
  const today = useSyncExternalStore(noop, getToday, getServerToday);
  const filled = WEEK_DAYS.filter((d) => week[d.key].trim()).length;

  return (
    <Card
      id="semana"
      eyebrow="Planejar"
      title="Semana"
      actions={
        <>
          <span className="font-mono text-xs text-muted">{filled}/7</span>
          <Button
            variant="subtle"
            onClick={() => {
              if (window.confirm("Limpar os focos de todos os dias da semana?")) actions.clearWeek();
            }}
            disabled={filled === 0}
          >
            Limpar semana
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">Um foco principal por dia.</p>
      <ul className="space-y-2">
        {WEEK_DAYS.map((d) => {
          const isToday = d.key === today;
          const inputId = `week-${d.key}`;
          return (
            <li
              key={d.key}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                isToday ? "border-accent/60 bg-accent-soft" : "border-border bg-bg/60"
              }`}
            >
              <label
                htmlFor={inputId}
                className={`w-10 shrink-0 font-mono text-xs uppercase tracking-wider ${
                  isToday ? "text-accent" : "text-muted"
                }`}
              >
                <abbr title={d.label} className="no-underline">
                  {d.short}
                </abbr>
                {isToday && <span className="sr-only"> (hoje)</span>}
              </label>
              <input
                id={inputId}
                value={week[d.key]}
                onChange={(e) => actions.setWeekFocus(d.key, e.target.value)}
                placeholder={isToday ? "Qual é o foco de hoje?" : "Foco do dia"}
                maxLength={120}
                className="min-w-0 flex-1 bg-transparent py-0.5 text-sm text-text placeholder:text-muted/60"
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
