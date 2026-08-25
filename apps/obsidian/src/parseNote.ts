import { IDEA_TYPES, INDUSTRIES, type IdeaInput, type IdeaType, type Industry } from "@rupert/core";

function stripQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, "").trim();
}

export function parseIdeaNote(filename: string, content: string): IdeaInput {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (fmMatch?.[1]) {
    for (const line of fmMatch[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      fm[line.slice(0, idx).trim()] = stripQuotes(line.slice(idx + 1));
    }
  }

  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const industry = (INDUSTRIES as readonly string[]).includes(fm.industry || "")
    ? (fm.industry as Industry)
    : "Developer Tools";
  const ideaType = (IDEA_TYPES as readonly string[]).includes(fm.ideaType || "")
    ? (fm.ideaType as IdeaType)
    : "B2B SaaS";

  return {
    name: fm.name || heading || filename.replace(/\.md$/i, ""),
    industry,
    industryDetail: fm.industryDetail,
    ideaType,
    targetCustomer: fm.targetCustomer || fm.customer || "Unspecified",
    problemStatement: fm.problemStatement || fm.problem || "Unspecified",
    proposedSolution: fm.proposedSolution || fm.solution || "Unspecified",
    monetizationModel: fm.monetizationModel || fm.pricing || "Unspecified",
    existingAlternatives: fm.existingAlternatives || fm.alternatives || "Unspecified",
    priorEvidence: fm.priorEvidence,
  };
}
