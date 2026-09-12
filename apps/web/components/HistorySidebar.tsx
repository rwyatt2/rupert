"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { formatVerdict } from "@/lib/format-verdict";
import { cn } from "@/lib/utils";
import type { EvaluationReport } from "@rupert/core";

interface HistorySidebarProps {
  history: EvaluationReport[];
  currentId?: string;
  onNewIdea: () => void;
  onSelect: (report: EvaluationReport) => void;
  onDelete: (id: string) => void;
}

export function HistorySidebar({ history, currentId, onNewIdea, onSelect, onDelete }: HistorySidebarProps) {
  const latest = history[0];
  const previous = history[1];
  const onEmptyForm = !currentId;

  return (
    <aside className="h-fit w-full shrink-0 lg:w-72" data-testid="history-sidebar">
      <Card className="p-4">
        <Button type="button" size="lg" disabled={onEmptyForm} onClick={onNewIdea} className="mb-4 w-full sm:w-auto">
          {copy.dashboard.newIdea}
        </Button>
        <h3 className="caption-mono mb-4 text-muted-foreground">{copy.dashboard.historyTitle}</h3>
        {latest && previous && (
          <div className="caption-mono mb-4 rounded-md border border-border bg-background p-4 text-muted-foreground">
            {copy.dashboard.historyCompare(
              latest.ideaName,
              latest.compositeScore,
              previous.ideaName,
              previous.compositeScore,
            )}
          </div>
        )}
        {history.length === 0 && (
          <p className="description text-muted-foreground">{copy.dashboard.historyEmpty}</p>
        )}
        <ul className="max-h-112 space-y-2 overflow-auto">
          {history.map((report) => (
            <li
              key={report.id}
              className={cn(
                "rounded-md border p-4",
                currentId === report.id ? "border-border bg-secondary" : "border-border bg-background",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(report)}
                className="focus-ring w-full rounded-md text-left"
              >
                <div className="h5 truncate text-foreground">{report.ideaName}</div>
                <div className="caption-mono mt-2 text-muted-foreground">
                  {report.compositeScore}/100 · {formatVerdict(report.verdict)}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onDelete(report.id)}
                className="caption-mono mt-2 text-destructive hover-interact hover:text-destructive/80"
              >
                {copy.dashboard.historyDelete}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
