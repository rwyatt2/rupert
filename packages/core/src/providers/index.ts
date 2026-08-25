import type { AIProvider } from "../types";
import { anthropicAdapter } from "./anthropic";
import { googleAdapter } from "./google";
import { ollamaAdapter } from "./ollama";
import { openaiAdapter, openrouterAdapter } from "./openaiCompat";
import type { ProviderAdapter } from "./types";

const adapters: Record<AIProvider, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
  google: googleAdapter,
  openrouter: openrouterAdapter,
  ollama: ollamaAdapter,
};

export function getAdapter(provider: AIProvider): ProviderAdapter {
  return adapters[provider];
}

export { extractJson } from "./extractJson";
