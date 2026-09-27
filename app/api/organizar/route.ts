import { classifyAll, classifyTask, splitLines } from "@/lib/classify";
import { QUADRANTS, type OrganizeResponse, type Quadrant } from "@/lib/types";

/*
 * Classifica tarefas na Matriz de Eisenhower usando a Groq.
 * Roda SOMENTE no servidor: a chave vem de process.env.GROQ_API_KEY (sem
 * prefixo NEXT_PUBLIC_, portanto nunca é embutida no bundle do navegador).
 * Qualquer falha (sem chave, timeout, HTTP != 200, JSON inválido) cai no
 * classificador heurístico — o botão nunca quebra.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const TIMEOUT_MS = 12_000;

const SYSTEM_PROMPT = `Você é um assistente de produtividade que classifica tarefas na Matriz de Eisenhower.

Quadrantes:
- "q1": urgente E importante (fazer agora) — prazos imediatos, crises, compromissos de hoje com consequência real.
- "q2": importante, NÃO urgente (agendar) — estudo, saúde, projetos, planejamento, relacionamentos, crescimento.
- "q3": urgente, NÃO importante (delegar) — interrupções, e-mails e mensagens rotineiras, burocracia, tarefas que outra pessoa pode fazer.
- "q4": nem urgente nem importante (eliminar) — distrações, redes sociais, entretenimento passivo, "talvez algum dia".

Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, exatamente neste formato:
{"tasks":[{"i":0,"quadrant":"q1"},{"i":1,"quadrant":"q2"}]}

Regras do JSON:
- "i" é o índice numérico da tarefa na lista recebida (começando em 0).
- "quadrant" deve ser exatamente um de: "q1", "q2", "q3", "q4".
- Inclua exatamente um item para cada tarefa recebida.`;

function heuristic(lines: string[]): OrganizeResponse {
  return { tasks: classifyAll(lines), source: "heuristica" };
}

async function classifyWithGroq(lines: string[], apiKey: string): Promise<OrganizeResponse> {
  const userPrompt =
    "Classifique as tarefas abaixo e responda em JSON no formato especificado.\n\n" +
    lines.map((l, i) => `${i}. ${l}`).join("\n");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Groq respondeu ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = await res.json();
  const content: unknown = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Resposta da Groq sem conteúdo");

  const parsed = JSON.parse(content) as { tasks?: { i?: unknown; quadrant?: unknown }[] };
  if (!Array.isArray(parsed.tasks)) throw new Error("JSON sem o array 'tasks'");

  const byIndex = new Map<number, Quadrant>();
  for (const item of parsed.tasks) {
    const i = Number(item?.i);
    const q = String(item?.quadrant ?? "").toLowerCase() as Quadrant;
    if (Number.isInteger(i) && i >= 0 && i < lines.length && QUADRANTS.includes(q)) {
      byIndex.set(i, q);
    }
  }
  if (byIndex.size === 0) throw new Error("Nenhuma classificação válida no JSON");

  // Itens que a IA pulou ou classificou errado recebem a heurística.
  return {
    tasks: lines.map((text, i) => ({ text, quadrant: byIndex.get(i) ?? classifyTask(text) })),
    source: "ia",
  };
}

export async function POST(request: Request) {
  let lines: string[] = [];
  try {
    const body = (await request.json()) as { text?: unknown; tasks?: unknown };
    if (typeof body.text === "string") {
      lines = splitLines(body.text);
    } else if (Array.isArray(body.tasks)) {
      lines = splitLines(body.tasks.filter((t) => typeof t === "string").join("\n"));
    }
  } catch {
    return Response.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  if (lines.length === 0) {
    return Response.json({ tasks: [], source: "heuristica" } satisfies OrganizeResponse);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("[organizar] GROQ_API_KEY ausente — usando heurística local");
    return Response.json(heuristic(lines));
  }

  try {
    return Response.json(await classifyWithGroq(lines, apiKey));
  } catch (err) {
    console.error("[organizar] falha na IA, usando heurística:", (err as Error).message);
    return Response.json(heuristic(lines));
  }
}
