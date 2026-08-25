#!/usr/bin/env npx tsx
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import {
  DEFAULT_MODELS,
  DEFAULT_SETTINGS,
  downloadFilename,
  evaluateIdea,
  getReport,
  IDEA_TYPES,
  INDUSTRIES,
  listReports,
  loadSettings,
  saveSettings,
  toJson,
  toMarkdown,
  type IdeaInput,
  type Industry,
  type IdeaType,
  type ProviderSettings,
} from "@rupert/core/node";
import { makeEvidenceGatherer } from "@rupert/mcp-client";

function arg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function has(flag: string): boolean {
  return process.argv.includes(flag);
}

function usage(): never {
  console.log(`Rupert Viability Engine

Usage:
  rupert evaluate --file idea.json [--mcp|--no-mcp]
  rupert evaluate --interactive [--mcp]
  rupert evaluate --name ... --industry ... --type ... --customer ... --problem ... --solution ... --pricing ... --alternatives ...
  rupert history
  rupert show <id>
  rupert export <id> --md|--json [--out path]
  rupert config [--provider x --model y --key sk-...]
`);
  process.exit(1);
}

async function promptIdea(): Promise<IdeaInput> {
  const rl = createInterface({ input, output });
  const ask = async (q: string) => (await rl.question(q)).trim();
  const name = await ask("Idea name: ");
  console.log(`Industries: ${INDUSTRIES.join(" | ")}`);
  const industry = (await ask("Industry: ")) as Industry;
  console.log(`Types: ${IDEA_TYPES.join(" | ")}`);
  const ideaType = (await ask("Idea type: ")) as IdeaType;
  const idea: IdeaInput = {
    name,
    industry,
    ideaType,
    targetCustomer: await ask("Target customer: "),
    problemStatement: await ask("Problem: "),
    proposedSolution: await ask("Solution: "),
    monetizationModel: await ask("Monetization: "),
    existingAlternatives: await ask("Alternatives: "),
  };
  const prior = await ask("Prior evidence (optional): ");
  if (prior) idea.priorEvidence = prior;
  rl.close();
  return idea;
}

async function cmdEvaluate(): Promise<void> {
  const settings = await loadSettings();
  const useMcp = has("--mcp") && !has("--no-mcp");
  let idea: IdeaInput;

  const file = arg("--file");
  if (file) {
    idea = JSON.parse(await readFile(file, "utf8")) as IdeaInput;
  } else if (has("--interactive")) {
    idea = await promptIdea();
  } else {
    const name = arg("--name");
    const industry = arg("--industry") as Industry | undefined;
    const ideaType = (arg("--type") || arg("--ideaType")) as IdeaType | undefined;
    if (!name || !industry || !ideaType) usage();
    idea = {
      name,
      industry,
      ideaType,
      targetCustomer: arg("--customer") || "",
      problemStatement: arg("--problem") || "",
      proposedSolution: arg("--solution") || "",
      monetizationModel: arg("--pricing") || arg("--monetization") || "",
      existingAlternatives: arg("--alternatives") || "",
      priorEvidence: arg("--prior"),
    };
  }

  const report = await evaluateIdea({
    idea,
    settings,
    gatherEvidence: makeEvidenceGatherer(useMcp),
  });

  console.log(`\n${report.verdict}  ${report.compositeScore}/100`);
  console.log(report.summaryVerdict);
  console.log("\nFatal flaws:");
  for (const flaw of report.fatalFlaws) console.log(`- ${flaw}`);
  console.log(`\nSaved ${report.id}`);
}

async function cmdHistory(): Promise<void> {
  const reports = await listReports();
  if (!reports.length) {
    console.log("No evaluations yet.");
    return;
  }
  for (const r of reports) {
    console.log(`${r.id}  ${r.compositeScore}  ${r.verdict.padEnd(18)}  ${r.ideaName}`);
  }
}

async function cmdShow(id: string): Promise<void> {
  const report = await getReport(id);
  if (!report) {
    console.error(`Not found: ${id}`);
    process.exit(1);
  }
  console.log(toMarkdown(report));
}

async function cmdExport(id: string): Promise<void> {
  const report = await getReport(id);
  if (!report) {
    console.error(`Not found: ${id}`);
    process.exit(1);
  }
  const md = has("--md") || !has("--json");
  const body = md ? toMarkdown(report) : toJson(report);
  const out = arg("--out") || downloadFilename(report, md ? "md" : "json");
  await writeFile(out, body, "utf8");
  console.log(out);
}

async function cmdConfig(): Promise<void> {
  const current = await loadSettings();
  const next: ProviderSettings = {
    ...current,
    provider: (arg("--provider") as ProviderSettings["provider"]) || current.provider,
    model: arg("--model") || current.model,
    apiKey: arg("--key") || current.apiKey,
    customBaseUrl: arg("--base-url") || current.customBaseUrl,
  };
  if (arg("--provider") && !arg("--model")) {
    next.model = DEFAULT_MODELS[next.provider] || DEFAULT_SETTINGS.model;
  }
  await saveSettings(next);
  console.log(`Saved ${next.provider} / ${next.model} (key ${next.apiKey ? "set" : "empty"})`);
}

async function main(): Promise<void> {
  const cmd = process.argv[2];
  if (!cmd || cmd === "help" || cmd === "--help") usage();
  if (cmd === "evaluate") return cmdEvaluate();
  if (cmd === "history") return cmdHistory();
  if (cmd === "show" && process.argv[3]) return cmdShow(process.argv[3]);
  if (cmd === "export" && process.argv[3]) return cmdExport(process.argv[3]);
  if (cmd === "config") return cmdConfig();
  usage();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
