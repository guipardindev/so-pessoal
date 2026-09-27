import type { Quadrant } from "./types";

/*
 * Fallback heurístico: classifica por palavras-chave quando a IA não responde.
 * Roda tanto no servidor (route handler) quanto no cliente (se o fetch falhar).
 */

const URGENT = [
  "urgente", "hoje", "agora", "imediat", "prazo", "amanha", "atrasad", "vence",
  "vencimento", "deadline", "ate as", "ultimo dia", "emergencia", "critico",
  "asap", "pagar", "boleto", "prova", "entrega", "entregar",
];

const IMPORTANT = [
  "estudar", "estudo", "projeto", "planejar", "planejamento", "saude", "medico",
  "consulta", "academia", "treino", "exercicio", "correr", "ler ", "leitura",
  "curso", "aula", "tcc", "trabalho", "meta", "objetivo", "carreira", "familia",
  "revisar", "aprender", "portfolio", "cliente", "relatorio", "apresentacao",
  "prova", "entrega", "pagar", "boleto", "orcamento", "investir",
];

const DELEGATE = [
  "responder", "email", "e-mail", "ligar", "ligacao", "reuniao", "mensagem",
  "whatsapp", "encaminhar", "agendar", "marcar", "pedir", "solicitar", "comprar",
  "buscar", "levar", "formulario", "cadastro", "imprimir",
];

const ELIMINATE = [
  "netflix", "serie", "instagram", "tiktok", "youtube", "reels", "rede social",
  "redes sociais", "scroll", "jogar", "videogame", "game", "fofoca", "shopping",
  "maratonar", "talvez", "algum dia", "quem sabe",
];

export function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")} `;
}

function hits(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

export function classifyTask(raw: string): Quadrant {
  const text = normalize(raw);
  if (hits(text, ELIMINATE)) return "q4";

  const urgent = hits(text, URGENT) || /!{1,}/.test(raw);
  const important = hits(text, IMPORTANT);

  if (urgent && important) return "q1";
  if (important) return "q2";
  if (urgent || hits(text, DELEGATE)) return "q3";
  // Na dúvida, agendar: força uma decisão consciente depois, sem gerar falsa urgência.
  return "q2";
}

export function classifyAll(lines: string[]) {
  return lines.map((text) => ({ text, quadrant: classifyTask(text) }));
}

/** Transforma o texto do "descarregar a mente" em linhas limpas. */
export function splitLines(text: string, max = 50): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)]|\[ ?\])\s*/, "").trim())
    .filter(Boolean)
    .map((l) => l.slice(0, 200))
    .slice(0, max);
}
