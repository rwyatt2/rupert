import { DEFAULT_SETTINGS, type EvaluationReport, type ProviderSettings } from "@rupert/core";

const SETTINGS_KEY = "viability_engine_settings";
const HISTORY_KEY = "viability_engine_history";
const MCP_KEY = "viability_engine_mcp";
const INPUT_MODE_KEY = "viability_engine_input_mode";

export type InputMode = "form" | "chat";

export interface McpUiSettings {
  useMcpEvidence: boolean;
  onlyServers: string[];
}

export const DEFAULT_MCP_UI: McpUiSettings = {
  useMcpEvidence: false,
  onlyServers: [],
};

export function getStoredSettings(): ProviderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: ProviderSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getMcpUiSettings(): McpUiSettings {
  if (typeof window === "undefined") return DEFAULT_MCP_UI;
  const raw = localStorage.getItem(MCP_KEY);
  return raw ? { ...DEFAULT_MCP_UI, ...JSON.parse(raw) } : DEFAULT_MCP_UI;
}

export function saveMcpUiSettings(settings: McpUiSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MCP_KEY, JSON.stringify(settings));
}

export function getInputMode(): InputMode {
  if (typeof window === "undefined") return "form";
  const raw = localStorage.getItem(INPUT_MODE_KEY);
  return raw === "chat" ? "chat" : "form";
}

export function saveInputMode(mode: InputMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INPUT_MODE_KEY, mode);
}

export function getEvaluationHistory(): EvaluationReport[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveEvaluationToHistory(report: EvaluationReport): void {
  if (typeof window === "undefined") return;
  const history = getEvaluationHistory();
  const updated = [report, ...history.filter((h) => h.id !== report.id)];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 50)));
}

export function deleteEvaluationFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  const history = getEvaluationHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function downloadText(filename: string, body: string, type: string): void {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
