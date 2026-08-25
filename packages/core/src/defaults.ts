import type { ProviderSettings } from "./types";

export const DEFAULT_SETTINGS: ProviderSettings = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-sonnet-4-5",
};

export const OLLAMA_LOCAL_URL = "http://127.0.0.1:11434";
export const OLLAMA_CLOUD_URL = "https://ollama.com";
export const DEFAULT_OLLAMA_CLOUD_MODEL = "gpt-oss:20b";

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
  { id: OLLAMA_LOCAL_URL, label: "Local" },
  { id: OLLAMA_CLOUD_URL, label: "Cloud" },
] as const;

export const OLLAMA_CLOUD_MODEL_OPTIONS = [
  { id: "gpt-oss:20b", label: "gpt-oss 20B" },
  { id: "gpt-oss:120b", label: "gpt-oss 120B" },
  { id: "gemma4:31b", label: "Gemma 4 31B" },
  { id: "nemotron-3-nano:30b", label: "Nemotron Nano 30B" },
] as const;
