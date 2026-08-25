import type { EvidenceSubject, EvidenceUsed } from "@rupert/core";
import { gatherMcpEvidence } from "./gather";

export function makeEvidenceGatherer(
  enabled: boolean,
  onlyServers?: string[],
): ((subject: EvidenceSubject, signal?: AbortSignal) => Promise<EvidenceUsed>) | undefined {
  if (!enabled) return undefined;
  return (subject, signal) => gatherMcpEvidence(subject, { onlyServers, signal });
}
