"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { classifyAll, splitLines } from "@/lib/classify";
import { actions } from "@/lib/useAppState";
import { QUADRANT_INFO, QUADRANTS, type OrganizeResponse } from "@/lib/types";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; count: number; source: OrganizeResponse["source"]; summary: string };

export function BrainDump({ value }: { value: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const lines = splitLines(value);
  const loading = status.kind === "loading";

  async function organize() {
    if (!lines.length || loading) return;
    setStatus({ kind: "loading" });

    let result: OrganizeResponse;
    try {
      const res = await fetch("/api/organizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: lines }),
      });
      if (!res.ok) throw new Error(String(res.status));
      result = (await res.json()) as OrganizeResponse;
      if (!Array.isArray(result.tasks) || result.tasks.length === 0) throw new Error("vazio");
    } catch {
      // servidor fora do ar / offline: classifica aqui mesmo
      result = { tasks: classifyAll(lines), source: "heuristica" };
    }

    actions.addTasks(result.tasks);
    actions.setBrainDump("");

    const summary = QUADRANTS.map((q) => {
      const n = result.tasks.filter((t) => t.quadrant === q).length;
      return n ? `${n} em ${QUADRANT_INFO[q].title}` : null;
    })
      .filter(Boolean)
      .join(", ");
    setStatus({ kind: "done", count: result.tasks.length, source: result.source, summary });
  }

  return (
    <Card id="descarregar" eyebrow="Capturar" title="Descarregar a mente">
      <label htmlFor="brain-dump" className="mb-2 block text-sm text-muted">
        Escreva tudo o que está na sua cabeça — uma tarefa por linha.
      </label>
      <textarea
        id="brain-dump"
        value={value}
        onChange={(e) => actions.setBrainDump(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            organize();
          }
        }}
        rows={7}
        placeholder={"Pagar boleto da faculdade hoje\nEstudar para a prova de cálculo\nResponder e-mails do grupo\nVer série nova"}
        aria-describedby="brain-dump-hint"
        className="w-full resize-y rounded-xl border border-border bg-bg px-4 py-3 text-sm leading-relaxed text-text placeholder:text-muted/60 focus:border-accent"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p id="brain-dump-hint" className="font-mono text-xs text-muted">
          {lines.length} {lines.length === 1 ? "tarefa" : "tarefas"} · Ctrl/⌘ + Enter
        </p>
        <Button
          variant="primary"
          onClick={organize}
          disabled={!lines.length || loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span
                aria-hidden="true"
                className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Organizando…
            </>
          ) : (
            <>✦ Organizar com IA</>
          )}
        </Button>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
        {status.kind === "done" && (
          <>
            <span className="text-ok">
              {status.count} {status.count === 1 ? "tarefa organizada" : "tarefas organizadas"}
            </span>
            <span className="text-muted">
              {" "}
              ({status.summary}) ·{" "}
              {status.source === "ia" ? "classificadas pela IA" : "classificação local por palavras-chave"}
            </span>
          </>
        )}
      </p>
    </Card>
  );
}
