import type { ProviderSettings } from "./types";

export const DEFAULT_SETTINGS: ProviderSettings = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-sonnet-4-5",
};

export const DEFAULT_MODELS: Record<ProviderSettings["provider"], string> = {
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-4.1",
  google: "gemini-3.5-flash",
  openrouter: "anthropic/claude-sonnet-4.5",
  ollama: "llama3.2",
};

export const GOOGLE_MODEL_OPTIONS = [
  { id: "gemini-3.5-flash", label: "3.5 Flash" },
  { id: "gemini-3.6-flash", label: "3.6 Flash" },
  { id: "gemini-3.7-flash", label: "3.7 Flash" },
  { id: "gemini-3.1-pro-preview", label: "3.1 Pro" },
] as const;

export const OLLAMA_BASE_OPTIONS = [
  { id: "http://127.0.0.1:11434", label: "Local" },
  { id: "https://ollama.com", label: "Cloud" },
] as const;
