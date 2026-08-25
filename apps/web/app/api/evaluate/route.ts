import { evaluateIdea, EvaluateRequestSchema } from "@rupert/core/node";
import { makeEvidenceGatherer } from "@rupert/mcp-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EvaluateRequestSchema.parse(body);
    const report = await evaluateIdea({
      idea: parsed.idea,
      settings: parsed.settings,
      persist: parsed.persist ?? true,
      gatherEvidence: makeEvidenceGatherer(Boolean(parsed.useMcpEvidence), parsed.onlyServers),
    });
    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process evaluation";
    const status = message.includes("Missing API key") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
