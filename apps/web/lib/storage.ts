import {
  AI_PROVIDERS,
  DEFAULT_MODELS,
  DEFAULT_SETTINGS,
  isOllamaCloud,
  type AIProvider,
  type EvaluationReport,
  type ProviderSettings,
} from "@rupert/core";

const SETTINGS_KEY = "viability_engine_settings";
const HISTORY_KEY = "viability_engine_history";
const MCP_KEY = "viability_engine_mcp";
const INPUT_MODE_KEY = "viability_engine_input_mode";

export type InputMode = "form" | "chat";

export interface ProviderProfile {
  apiKey: string;
  model: string;
  customBaseUrl?: string;
}

export type ProviderProfiles = Record<AIProvider, ProviderProfile>;

interface StoredSettingsBlob {
  provider?: AIProvider;
  apiKey?: string;
  model?: string;
  customBaseUrl?: string;
  profiles?: Partial<Record<AIProvider, Partial<ProviderProfile>>>;
}

export interface McpUiSettings {
  useMcpEvidence: boolean;
  onlyServers: string[];
}

export const DEFAULT_MCP_UI: McpUiSettings = {
  useMcpEvidence: false,
  onlyServers: [],
};

export function emptyProviderProfiles(): ProviderProfiles {
  return Object.fromEntries(
    AI_PROVIDERS.map((provider) => [
      provider,
      {
        apiKey: "",
        model: DEFAULT_MODELS[provider],
        ...(provider === "ollama" ? { customBaseUrl: "http://127.0.0.1:11434" } : {}),
      } satisfies ProviderProfile,
    ]),
  ) as ProviderProfiles;
}

export function profileFromSettings(settings: ProviderSettings): ProviderProfile {
  return {
    apiKey: settings.apiKey,
    model: settings.model,
    customBaseUrl: settings.customBaseUrl,
  };
}

export function settingsFromProfile(provider: AIProvider, profile: ProviderProfile): ProviderSettings {
  return {
    provider,
    apiKey: profile.apiKey,
    model: profile.model || DEFAULT_MODELS[provider],
    customBaseUrl: profile.customBaseUrl,
  };
}

export function isProviderReady(
  provider: AIProvider,
  profile: Pick<ProviderProfile, "apiKey" | "customBaseUrl">,
): boolean {
  if (profile.apiKey.trim()) return true;
  return provider === "ollama" && !isOllamaCloud(profile.customBaseUrl);
}

function hydrateProfiles(
  stored: Partial<Record<AIProvider, Partial<ProviderProfile>>> | undefined,
): ProviderProfiles {
  const profiles = emptyProviderProfiles();
  if (!stored) return profiles;
  for (const provider of AI_PROVIDERS) {
    const incoming = stored[provider];
    if (!incoming) continue;
    profiles[provider] = {
      apiKey: incoming.apiKey ?? profiles[provider].apiKey,
      model: incoming.model || profiles[provider].model,
      customBaseUrl: incoming.customBaseUrl ?? profiles[provider].customBaseUrl,
    };
  }
  return profiles;
}

function parseStored(): { settings: ProviderSettings; profiles: ProviderProfiles } {
  if (typeof window === "undefined") {
    return { settings: DEFAULT_SETTINGS, profiles: hydrateProfiles(undefined) };
  }
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return { settings: DEFAULT_SETTINGS, profiles: hydrateProfiles(undefined) };
  }
  const blob = JSON.parse(raw) as StoredSettingsBlob;
  const settings: ProviderSettings = {
    ...DEFAULT_SETTINGS,
    provider: blob.provider ?? DEFAULT_SETTINGS.provider,
    apiKey: blob.apiKey ?? DEFAULT_SETTINGS.apiKey,
    model: blob.model ?? DEFAULT_SETTINGS.model,
    customBaseUrl: blob.customBaseUrl,
  };
  const profiles = hydrateProfiles(blob.profiles);
  profiles[settings.provider] = profileFromSettings(settings);
  return { settings, profiles };
}

export function getStoredSettings(): ProviderSettings {
  return parseStored().settings;
}

export function getProviderProfiles(): ProviderProfiles {
  return parseStored().profiles;
}

export function saveStoredSettings(settings: ProviderSettings, profiles?: ProviderProfiles): void {
  if (typeof window === "undefined") return;
  const nextProfiles = hydrateProfiles(profiles ?? parseStored().profiles);
  nextProfiles[settings.provider] = profileFromSettings(settings);
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      customBaseUrl: settings.customBaseUrl,
      profiles: nextProfiles,
    }),
  );
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
