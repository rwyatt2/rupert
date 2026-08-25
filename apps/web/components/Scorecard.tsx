"use client";

import { downloadFilename, toJson, toMarkdown, type EvaluationReport } from "@rupert/core";
import { downloadText } from "@/lib/storage";
import { KillTriggers } from "./KillTriggers";
import { NextSteps } from "./NextSteps";
import { RedTeamTabs } from "./RedTeamTabs";

interface ScorecardProps {
  report: EvaluationReport;
  onReset: () => void;
}

function verdictStyle(verdict: EvaluationReport["verdict"]) {
  switch (verdict) {
    case "GO":
      return "bg-emerald-950 border-emerald-500 text-emerald-400";
    case "CONDITIONAL_PIVOT":
      return "bg-amber-950 border-amber-500 text-amber-400";
    case "HARD_NO_GO":
      return "bg-rose-950 border-rose-600 text-rose-400";
  }
}

function scoreColor(score: number) {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  return "text-rose-400";
}

export function Scorecard({ report, onReset }: ScorecardProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-zinc-100">{report.ideaName}</h2>
            <span
              className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wider border ${verdictStyle(report.verdict)}`}
            >
              {report.verdict.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">{report.summaryVerdict}</p>
        </div>
        <div className="flex items-center gap-4 self-end md:self-auto flex-wrap">
          <div className="text-right">
            <span className="block text-xs uppercase tracking-widest text-zinc-500 font-mono">
              Composite score
            </span>
            <span className={`text-4xl font-extrabold font-mono ${scoreColor(report.compositeScore / 10)}`}>
              {report.compositeScore}
              <span className="text-lg text-zinc-600">/100</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => downloadText(downloadFilename(report, "md"), toMarkdown(report), "text/markdown")}
            className="px-3 py-2 text-xs font-mono uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded"
          >
            Export MD
          </button>
          <button
            type="button"
            onClick={() => downloadText(downloadFilename(report, "json"), toJson(report), "application/json")}
            className="px-3 py-2 text-xs font-mono uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded"
          >
            New idea
          </button>
        </div>
      </div>

      <KillTriggers fatalFlaws={report.fatalFlaws} killTriggers={report.killTriggers} />

      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-6 pb-2 border-b border-zinc-800">
          7-dimension stress test matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.dimensionScores.map((dim) => (
            <div key={dim.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-sm font-semibold text-zinc-200">{dim.name}</span>
                  <span className="ml-2 text-xs font-mono text-zinc-500">
                    ({Math.round(dim.weight * 100)}% wt)
                  </span>
                </div>
                <span className={`text-lg font-mono font-bold ${scoreColor(dim.score)}`}>{dim.score}/10</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full ${dim.score >= 8 ? "bg-emerald-500" : dim.score >= 6 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${dim.score * 10}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mb-2">{dim.justification}</p>
              <div className="text-xs text-rose-400/90 font-mono bg-rose-950/20 p-2 border border-rose-950 rounded">
                Risk: {dim.primaryRisk}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RedTeamTabs critiques={report.redTeamCritiques} />

      <div className="p-6 bg-zinc-900 border border-amber-900/50 rounded-lg">
        <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-2">
          The only way this works
        </h3>
        <p className="text-sm text-zinc-300 leading-relaxed">{report.onlyWayThisWorks}</p>
      </div>

      <NextSteps gates={report.validationGates} />

      {report.evidenceUsed && (
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-2">Evidence pass</h3>
          <p className="text-xs font-mono text-zinc-500 mb-2">
            Servers: {report.evidenceUsed.servers.join(", ") || "none"}
          </p>
          {report.evidenceUsed.gaps.length > 0 && (
            <p className="text-xs text-amber-400 mb-2">Gaps: {report.evidenceUsed.gaps.join("; ")}</p>
          )}
          {report.evidenceUsed.notes && (
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono bg-zinc-950 p-3 rounded border border-zinc-800 max-h-64 overflow-auto">
              {report.evidenceUsed.notes}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
