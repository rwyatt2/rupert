import type { EvaluationReport } from "./types";

export function toJson(report: EvaluationReport): string {
  return JSON.stringify(report, null, 2);
}

export function toMarkdown(report: EvaluationReport): string {
  const killLines = report.killTriggers
    .map((t) => `- ${t.triggered ? "TRIGGERED" : "cleared"} — **${t.name}**: ${t.reason}`)
    .join("\n");

  const flawLines = report.fatalFlaws.map((f, i) => `${i + 1}. ${f}`).join("\n");

  const dimLines = report.dimensionScores
    .map((d) => {
      const wt = Math.round(d.weight * 100);
      return `### ${d.name} (${d.score}/10, ${wt}% wt)\n\n${d.justification}\n\n- Primary risk: ${d.primaryRisk}`;
    })
    .join("\n\n");

  const redLines = report.redTeamCritiques
    .map(
      (c) =>
        `### ${c.role} — ${c.stance}\n\n**Attack:** ${c.coreAttack}\n\n**Required proof:** ${c.requiredProof}`,
    )
    .join("\n\n");

  const gateLines = report.validationGates
    .map(
      (g) =>
        `### Gate ${g.gate} (~${g.estimatedHours}h)\n\n- Objective: ${g.objective}\n- Method: ${g.method}\n- Pass: ${g.passThreshold}`,
    )
    .join("\n\n");

  const evidence = report.evidenceUsed
    ? [
        `## Evidence used`,
        `Servers: ${report.evidenceUsed.servers.join(", ") || "none"}`,
        "",
        report.evidenceUsed.notes || "_No MCP evidence._",
        "",
        report.evidenceUsed.gaps.length
          ? `Gaps: ${report.evidenceUsed.gaps.join("; ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return [
    `# ${report.ideaName}`,
    "",
    `**Verdict:** ${report.verdict}  `,
    `**Composite score:** ${report.compositeScore}/100  `,
    `**Date:** ${report.timestamp}  `,
    `**ID:** ${report.id}`,
    "",
    `## Executive verdict`,
    "",
    report.summaryVerdict,
    "",
    `## Fatal flaws & kill triggers`,
    "",
    flawLines,
    "",
    killLines,
    "",
    `## Dimension scorecard`,
    "",
    dimLines,
    "",
    `## Multi-lens red team`,
    "",
    redLines,
    "",
    `## The only way this works`,
    "",
    report.onlyWayThisWorks,
    "",
    `## Actionable next steps`,
    "",
    gateLines,
    evidence ? `\n${evidence}\n` : "",
  ].join("\n");
}

export function downloadFilename(report: EvaluationReport, ext: "md" | "json"): string {
  const safe = report.ideaName.replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "idea";
  return `${safe}-${report.id}.${ext}`;
}
