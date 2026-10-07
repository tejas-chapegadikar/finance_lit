import { z } from "zod";

// Lesson scenarios, key terms and daily challenges are stored as JSON
// columns. Read them through these parsers so a malformed row renders as
// empty instead of crashing the page.

export type ChoiceOption = { text: string; isCorrect: boolean };
export type KeyTerm = { term: string; definition: string };

const storedOptions = z.array(z.object({ text: z.string(), isCorrect: z.boolean() }));
const storedKeyTerms = z.array(z.object({ term: z.string(), definition: z.string() }));

export function readChoiceOptions(value: unknown): ChoiceOption[] {
  const parsed = storedOptions.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function readKeyTerms(value: unknown): KeyTerm[] {
  const parsed = storedKeyTerms.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export type LearnSection = { title: string | null; body: string };

/** Splits the Learn markdown into cards — one per "## " heading. */
export function splitLearnSections(markdown: string): LearnSection[] {
  const sections: LearnSection[] = [];
  let current: LearnSection = { title: null, body: "" };
  for (const line of markdown.split(/\r?\n/)) {
    const heading = /^##\s+(.+)$/.exec(line);
    if (heading) {
      if (current.title || current.body.trim()) sections.push(current);
      current = { title: heading[1].trim(), body: "" };
    } else {
      current.body += `${line}\n`;
    }
  }
  if (current.title || current.body.trim()) sections.push(current);
  return sections.map((section) => ({ ...section, body: section.body.trim() }));
}
