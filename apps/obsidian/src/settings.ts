import { DEFAULT_MODELS, DEFAULT_SETTINGS, type ProviderSettings } from "@rupert/core";

export interface RupertPluginSettings {
  provider: ProviderSettings["provider"];
  apiKey: string;
  model: string;
  customBaseUrl: string;
  useMcpEvidence: boolean;
}

export const DEFAULT_PLUGIN_SETTINGS: RupertPluginSettings = {
  provider: DEFAULT_SETTINGS.provider,
  apiKey: "",
  model: DEFAULT_MODELS.anthropic,
  customBaseUrl: "",
  useMcpEvidence: false,
};

export function toProviderSettings(settings: RupertPluginSettings): ProviderSettings {
  return {
    provider: settings.provider,
    apiKey: settings.apiKey,
    model: settings.model,
    customBaseUrl: settings.customBaseUrl || undefined,
  };
}
