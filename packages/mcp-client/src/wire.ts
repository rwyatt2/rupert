import type { EvidenceUsed, IdeaInput } from "@rupert/core";
import { gatherMcpEvidence } from "./gather";

export function makeEvidenceGatherer(
  enabled: boolean,
  onlyServers?: string[],
): ((idea: IdeaInput) => Promise<EvidenceUsed>) | undefined {
  if (!enabled) return undefined;
  return (idea) => gatherMcpEvidence(idea, { onlyServers });
}
