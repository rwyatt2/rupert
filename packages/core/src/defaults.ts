import type { ProviderSettings } from "./types";

export const DEFAULT_SETTINGS: ProviderSettings = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-sonnet-4-5",
};

export const DEFAULT_MODELS: Record<ProviderSettings["provider"], string> = {
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-4.1",
  google: "gemini-2.5-pro",
  openrouter: "anthropic/claude-sonnet-4.5",
  ollama: "llama3.2",
};
