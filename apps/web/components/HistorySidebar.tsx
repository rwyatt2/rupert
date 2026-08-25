"use client";

import type { EvaluationReport } from "@rupert/core";

interface HistorySidebarProps {
  history: EvaluationReport[];
  currentId?: string;
  onSelect: (report: EvaluationReport) => void;
  onDelete: (id: string) => void;
}

export function HistorySidebar({ history, currentId, onSelect, onDelete }: HistorySidebarProps) {
  const latest = history[0];
  const previous = history[1];

  return (
    <aside className="w-full lg:w-72 shrink-0 p-4 bg-zinc-900 border border-zinc-800 rounded-lg h-fit">
      <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">Local history</h3>
      {latest && previous && (
        <div className="mb-4 p-3 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono text-zinc-400">
          Last two: {latest.ideaName} {latest.compositeScore} vs {previous.ideaName} {previous.compositeScore}
        </div>
      )}
      {history.length === 0 && <p className="text-xs text-zinc-500">No evaluations stored in this browser.</p>}
      <ul className="space-y-2 max-h-[28rem] overflow-auto">
        {history.map((report) => (
          <li
            key={report.id}
            className={`p-3 rounded border ${
              currentId === report.id ? "border-zinc-500 bg-zinc-800" : "border-zinc-800 bg-zinc-950"
            }`}
          >
            <button type="button" onClick={() => onSelect(report)} className="text-left w-full">
              <div className="text-sm text-zinc-200 truncate">{report.ideaName}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1">
                {report.compositeScore}/100 · {report.verdict.replaceAll("_", " ")}
              </div>
            </button>
            <button
              type="button"
              onClick={() => onDelete(report.id)}
              className="mt-2 text-[10px] font-mono uppercase text-rose-400"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
