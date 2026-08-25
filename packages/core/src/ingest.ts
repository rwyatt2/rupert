import { IDEA_TYPES, INDUSTRIES, IdeaInputSchema, type IdeaInput, type IdeaType, type Industry } from "./types";

export type ClassifiedIdeaSource =
  | { kind: "idea"; idea: IdeaInput }
  | { kind: "brief"; text: string };

const IDEA_FRONTMATTER_KEYS = new Set([
  "name",
  "industry",
  "industryDetail",
  "ideaType",
  "targetCustomer",
  "customer",
  "problemStatement",
  "problem",
  "proposedSolution",
  "solution",
  "monetizationModel",
  "pricing",
  "existingAlternatives",
  "alternatives",
  "priorEvidence",
]);

function stripQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, "").trim();
}

function splitFrontmatter(content: string): { fm: Record<string, string>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm: Record<string, string> = {};
  if (!match?.[1]) {
    return { fm, body: content };
  }
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (!key) continue;
    fm[key] = stripQuotes(line.slice(idx + 1));
  }
  return { fm, body: content.slice(match[0].length) };
}

function hasIdeaFrontmatter(fm: Record<string, string>): boolean {
  return Object.keys(fm).some((key) => IDEA_FRONTMATTER_KEYS.has(key));
}

export function parseIdeaMarkdown(filename: string, content: string): IdeaInput {
  const { fm, body } = splitFrontmatter(content);
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const rest = body.replace(/^#\s+.+$/m, "").trim();
  const priorEvidence = [fm.priorEvidence, rest].filter(Boolean).join("\n\n") || undefined;
  const industry = (INDUSTRIES as readonly string[]).includes(fm.industry || "")
    ? (fm.industry as Industry)
    : "Developer Tools";
  const ideaType = (IDEA_TYPES as readonly string[]).includes(fm.ideaType || "")
    ? (fm.ideaType as IdeaType)
    : "B2B SaaS";
  const stem = filename.replace(/\.[^.]+$/, "");

  return {
    name: fm.name || heading || stem || "Untitled idea",
    industry,
    industryDetail: fm.industryDetail || undefined,
    ideaType,
    targetCustomer: fm.targetCustomer || fm.customer || "Unspecified",
    problemStatement: fm.problemStatement || fm.problem || "Unspecified",
    proposedSolution: fm.proposedSolution || fm.solution || "Unspecified",
    monetizationModel: fm.monetizationModel || fm.pricing || "Unspecified",
    existingAlternatives: fm.existingAlternatives || fm.alternatives || "Unspecified",
    priorEvidence,
  };
}

export function classifyIdeaSource(input: { filename: string; text: string }): ClassifiedIdeaSource {
  const text = input.text.trim();
  const filename = input.filename.trim() || "untitled";
  if (!text) {
    return { kind: "brief", text };
  }

  const looksJson = /\.json$/i.test(filename) || text.startsWith("{") || text.startsWith("[");
  if (looksJson) {
    try {
      const parsed: unknown = JSON.parse(text);
      const result = IdeaInputSchema.safeParse(parsed);
      if (result.success) return { kind: "idea", idea: result.data };
    } catch {
      // Invalid JSON still lands in chat as the raw text.
    }
    return { kind: "brief", text };
  }

  const { fm } = splitFrontmatter(text);
  if (hasIdeaFrontmatter(fm)) {
    return { kind: "idea", idea: parseIdeaMarkdown(filename, text) };
  }

  return { kind: "brief", text };
}
