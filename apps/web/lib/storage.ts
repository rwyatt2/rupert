import {
  AI_PROVIDERS,
  DEFAULT_MODELS,
  DEFAULT_SETTINGS,
  OLLAMA_CLOUD_URL,
  OLLAMA_LOCAL_URL,
  isOllamaCloud,
  type AIProvider,
  type EvaluationReport,
  type ProviderSettings,
} from "@rupert/core";

const hosted = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);

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

function scopedKey(base: string, userId: string): string {
  return `${base}:${userId}`;
}

function readItem(base: string, userId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(scopedKey(base, userId));
}

function writeItem(base: string, userId: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(scopedKey(base, userId), value);
}

export function migrateLegacyStorage(userId: string): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(scopedKey(SETTINGS_KEY, userId))) return;
  const legacySettings = localStorage.getItem(SETTINGS_KEY);
  if (!legacySettings) return;

  localStorage.setItem(scopedKey(SETTINGS_KEY, userId), legacySettings);
  const history = localStorage.getItem(HISTORY_KEY);
  if (history) localStorage.setItem(scopedKey(HISTORY_KEY, userId), history);
  const mcp = localStorage.getItem(MCP_KEY);
  if (mcp) localStorage.setItem(scopedKey(MCP_KEY, userId), mcp);
  const mode = localStorage.getItem(INPUT_MODE_KEY);
  if (mode) localStorage.setItem(scopedKey(INPUT_MODE_KEY, userId), mode);

  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(MCP_KEY);
  localStorage.removeItem(INPUT_MODE_KEY);
}

export function emptyProviderProfiles(): ProviderProfiles {
  return Object.fromEntries(
    AI_PROVIDERS.map((provider) => [
      provider,
      {
        apiKey: "",
        model: DEFAULT_MODELS[provider],
        ...(provider === "ollama"
          ? { customBaseUrl: hosted ? OLLAMA_CLOUD_URL : OLLAMA_LOCAL_URL }
          : {}),
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
  if (provider !== "ollama") return false;
  if (hosted || isOllamaCloud(profile.customBaseUrl)) return false;
  return true;
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

function parseStored(userId: string): { settings: ProviderSettings; profiles: ProviderProfiles } {
  if (typeof window === "undefined") {
    return { settings: DEFAULT_SETTINGS, profiles: hydrateProfiles(undefined) };
  }
  const raw = readItem(SETTINGS_KEY, userId);
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

export function getStoredSettings(userId: string): ProviderSettings {
  return parseStored(userId).settings;
}

export function getProviderProfiles(userId: string): ProviderProfiles {
  return parseStored(userId).profiles;
}

export function saveStoredSettings(
  userId: string,
  settings: ProviderSettings,
  profiles?: ProviderProfiles,
): void {
  if (typeof window === "undefined") return;
  const nextProfiles = hydrateProfiles(profiles ?? parseStored(userId).profiles);
  nextProfiles[settings.provider] = profileFromSettings(settings);
  writeItem(
    SETTINGS_KEY,
    userId,
    JSON.stringify({
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      customBaseUrl: settings.customBaseUrl,
      profiles: nextProfiles,
    }),
  );
}

export function getMcpUiSettings(userId: string): McpUiSettings {
  const raw = readItem(MCP_KEY, userId);
  return raw ? { ...DEFAULT_MCP_UI, ...JSON.parse(raw) } : DEFAULT_MCP_UI;
}

export function saveMcpUiSettings(userId: string, settings: McpUiSettings): void {
  writeItem(MCP_KEY, userId, JSON.stringify(settings));
}

export function getInputMode(userId: string): InputMode {
  const raw = readItem(INPUT_MODE_KEY, userId);
  return raw === "chat" ? "chat" : "form";
}

export function saveInputMode(userId: string, mode: InputMode): void {
  writeItem(INPUT_MODE_KEY, userId, mode);
}

export function getEvaluationHistory(userId: string): EvaluationReport[] {
  const raw = readItem(HISTORY_KEY, userId);
  return raw ? JSON.parse(raw) : [];
}

export function saveEvaluationToHistory(userId: string, report: EvaluationReport): void {
  const history = getEvaluationHistory(userId);
  const updated = [report, ...history.filter((h) => h.id !== report.id)];
  writeItem(HISTORY_KEY, userId, JSON.stringify(updated.slice(0, 50)));
}

export function deleteEvaluationFromHistory(userId: string, id: string): void {
  const history = getEvaluationHistory(userId).filter((h) => h.id !== id);
  writeItem(HISTORY_KEY, userId, JSON.stringify(history));
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
