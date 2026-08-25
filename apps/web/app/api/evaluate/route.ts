import { evaluateIdea, EvaluateRequestSchema, isAbortError } from "@rupert/core/node";
import { makeEvidenceGatherer } from "@rupert/mcp-client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EvaluateRequestSchema.parse(body);
    const hosted = Boolean(process.env.VERCEL);
    const report = await evaluateIdea({
      idea: parsed.idea,
      brief: parsed.brief,
      settings: parsed.settings,
      persist: hosted ? false : parsed.persist,
      gatherEvidence: hosted
        ? undefined
        : makeEvidenceGatherer(Boolean(parsed.useMcpEvidence), parsed.onlyServers),
      signal: req.signal,
    });
    return NextResponse.json(report);
  } catch (error: unknown) {
    if (req.signal.aborted || isAbortError(error)) {
      return new NextResponse(null, { status: 499 });
    }
    const message = error instanceof Error ? error.message : "Failed to process evaluation";
    const status = message.includes("Missing API key") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
