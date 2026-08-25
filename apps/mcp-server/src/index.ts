#!/usr/bin/env npx tsx
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  DIMENSION_WEIGHTS,
  evaluateIdea,
  getReport,
  IDEA_TYPES,
  INDUSTRIES,
  KILL_TRIGGER_NAMES,
  listReports,
  loadSettings,
  toJson,
  toMarkdown,
} from "@rupert/core/node";
import { makeEvidenceGatherer } from "@rupert/mcp-client";
import { z } from "zod";

const server = new McpServer({
  name: "rupert",
  version: "1.0.0",
});

const IdeaArgs = {
  name: z.string().describe("Idea or product name"),
  industry: z.enum(INDUSTRIES),
  industryDetail: z.string().optional(),
  ideaType: z.enum(IDEA_TYPES),
  targetCustomer: z.string(),
  problemStatement: z.string(),
  proposedSolution: z.string(),
  monetizationModel: z.string(),
  existingAlternatives: z.string(),
  priorEvidence: z
    .string()
    .optional()
    .describe("Unverified notes already gathered from other MCPs or research"),
  useMcpEvidence: z
    .boolean()
    .optional()
    .default(false)
    .describe("If true, Rupert will query servers in ~/.rupert/mcp.json before scoring"),
};

server.registerTool(
  "evaluate_idea",
  {
    description:
      "Run an adversarial viability stress test. Pass priorEvidence if you already researched with other MCPs.",
    inputSchema: IdeaArgs,
  },
  async (args) => {
    const settings = await loadSettings();
    const report = await evaluateIdea({
      idea: {
        name: args.name,
        industry: args.industry,
        industryDetail: args.industryDetail,
        ideaType: args.ideaType,
        targetCustomer: args.targetCustomer,
        problemStatement: args.problemStatement,
        proposedSolution: args.proposedSolution,
        monetizationModel: args.monetizationModel,
        existingAlternatives: args.existingAlternatives,
        priorEvidence: args.priorEvidence,
      },
      settings,
      gatherEvidence: makeEvidenceGatherer(Boolean(args.useMcpEvidence)),
    });
    return {
      content: [{ type: "text" as const, text: JSON.stringify(report, null, 2) }],
    };
  },
);

server.registerTool("list_evaluations", { description: "List recent Rupert evaluations" }, async () => {
  const reports = await listReports();
  const summary = reports.map((r) => ({
    id: r.id,
    ideaName: r.ideaName,
    verdict: r.verdict,
    compositeScore: r.compositeScore,
    timestamp: r.timestamp,
  }));
  return { content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }] };
});

server.registerTool(
  "get_evaluation",
  {
    description: "Get a full evaluation report by id",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const report = await getReport(id);
    if (!report) {
      return { content: [{ type: "text" as const, text: `Not found: ${id}` }], isError: true };
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(report, null, 2) }] };
  },
);

server.registerTool(
  "export_evaluation",
  {
    description: "Export an evaluation as markdown or JSON",
    inputSchema: {
      id: z.string(),
      format: z.enum(["markdown", "json"]).default("markdown"),
    },
  },
  async ({ id, format }) => {
    const report = await getReport(id);
    if (!report) {
      return { content: [{ type: "text" as const, text: `Not found: ${id}` }], isError: true };
    }
    const text = format === "json" ? toJson(report) : toMarkdown(report);
    return { content: [{ type: "text" as const, text }] };
  },
);

server.registerTool(
  "get_rubric",
  { description: "Return scoring weights, kill triggers, and industry list" },
  async () => {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            weights: DIMENSION_WEIGHTS,
            killTriggers: KILL_TRIGGER_NAMES,
            industries: INDUSTRIES,
            ideaTypes: IDEA_TYPES,
            verdicts: {
              GO: "80-100",
              CONDITIONAL_PIVOT: "60-79",
              HARD_NO_GO: "below 60 or any kill trigger",
            },
          },
          null,
          2,
        ),
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
