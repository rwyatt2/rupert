import { randomUUID } from "node:crypto";
import { saveReport } from "./history";
import { buildSystemPrompt, buildUserPrompt } from "./prompts/redTeamEngine";
import { extractJson, getAdapter } from "./providers/index";
import { reconcileReport } from "./reconcile";
import {
  EvaluationReportSchema,
  IdeaInputSchema,
  ProviderSettingsSchema,
  type EvidenceUsed,
  type EvaluationReport,
  type IdeaInput,
  type ProviderSettings,
} from "./types";

export interface EvaluateOptions {
  idea: IdeaInput;
  settings: ProviderSettings;
  persist?: boolean;
  gatherEvidence?: (idea: IdeaInput) => Promise<EvidenceUsed>;
}

function requireKey(settings: ProviderSettings): void {
  if (settings.provider !== "ollama" && !settings.apiKey.trim()) {
    throw new Error("Missing API key for selected provider.");
  }
}

async function completeJson(
  settings: ProviderSettings,
  system: string,
  user: string,
): Promise<unknown> {
  const adapter = getAdapter(settings.provider);
  const raw = await adapter.complete(settings, { system, user, jsonMode: true });
  return extractJson(raw);
}

export async function evaluateIdea(options: EvaluateOptions): Promise<EvaluationReport> {
  const idea = IdeaInputSchema.parse(options.idea);
  const settings = ProviderSettingsSchema.parse(options.settings);
  requireKey(settings);

  let evidenceUsed: EvidenceUsed | undefined;
  if (options.gatherEvidence) {
    try {
      evidenceUsed = await options.gatherEvidence(idea);
    } catch (error) {
      evidenceUsed = {
        servers: [],
        notes: "",
        gaps: [
          `Evidence pass failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }

  const system = buildSystemPrompt();
  const user = buildUserPrompt(idea, {
    prior: idea.priorEvidence,
    mcp: evidenceUsed?.notes,
  });

  let parsed: unknown;
  try {
    parsed = await completeJson(settings, system, user);
  } catch (error) {
    throw new Error(
      `Provider call failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let report: EvaluationReport;
  try {
    const withIds = hydrateMeta(parsed, idea.name);
    report = EvaluationReportSchema.parse(withIds);
  } catch (firstError) {
    try {
      parsed = await completeJson(
        settings,
        system,
        `Your previous JSON failed schema validation:\n${firstError instanceof Error ? firstError.message : String(firstError)}\n\nReturn ONLY corrected JSON matching the required EvaluationReport schema. No markdown.`,
      );
      const withIds = hydrateMeta(parsed, idea.name);
      report = EvaluationReportSchema.parse(withIds);
    } catch (repairError) {
      throw new Error(
        `Model output failed validation after repair: ${repairError instanceof Error ? repairError.message : String(repairError)}`,
      );
    }
  }

  const reconciled = reconcileReport(report, idea.name);
  if (evidenceUsed) {
    reconciled.evidenceUsed = evidenceUsed;
  }

  if (options.persist !== false) {
    await saveReport(reconciled);
  }

  return reconciled;
}

function hydrateMeta(parsed: unknown, ideaName: string): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const obj = parsed as Record<string, unknown>;
  return {
    ...obj,
    id: typeof obj.id === "string" && obj.id ? obj.id : `eval_${randomUUID()}`,
    timestamp: typeof obj.timestamp === "string" && obj.timestamp ? obj.timestamp : new Date().toISOString(),
    ideaName,
  };
}
