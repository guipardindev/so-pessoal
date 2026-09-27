"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { actions } from "@/lib/useAppState";
import { QUADRANTS, type Task } from "@/lib/types";
import { Quadrant } from "./Quadrant";

export function EisenhowerMatrix({ tasks }: { tasks: Task[] }) {
  const hasDone = tasks.some((t) => t.done);
  return (
    <Card
      id="matriz"
      eyebrow="Priorizar"
      title="Matriz de Eisenhower"
      actions={
        <Button variant="subtle" onClick={actions.clearDone} disabled={!hasDone}>
          Limpar concluídas
        </Button>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        {QUADRANTS.map((q) => (
          <Quadrant key={q} quadrant={q} tasks={tasks.filter((t) => t.quadrant === q)} />
        ))}
      </div>
    </Card>
  );
}
