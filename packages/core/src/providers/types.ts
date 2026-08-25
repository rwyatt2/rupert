import type { ProviderSettings } from "../types";

export interface CompletionRequest {
  system: string;
  user: string;
  jsonMode?: boolean;
  signal?: AbortSignal;
}

export interface ProviderAdapter {
  complete(settings: ProviderSettings, request: CompletionRequest): Promise<string>;
}
