"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadFilename, toJson, toMarkdown, type EvaluationReport } from "@rupert/core";
import { downloadText } from "@/lib/storage";
import { copy } from "@/lib/copy";
import { formatVerdict } from "@/lib/format-verdict";
import { scoreBarClass, scoreTextClass, verdictBadgeClass } from "@/lib/score-colors";
import { cn } from "@/lib/utils";
import { KillTriggers } from "./KillTriggers";
import { NextSteps } from "./NextSteps";
import { RedTeamTabs } from "./RedTeamTabs";

interface ScorecardProps {
  report: EvaluationReport;
  onReset: () => void;
}

export function Scorecard({ report, onReset }: ScorecardProps) {
  return (
    <div className="animate-fadeIn space-y-8" data-testid="scorecard">
      <Card className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="h2">{report.ideaName}</h2>
            <Badge className={cn("border", verdictBadgeClass(report.verdict))}>
              {formatVerdict(report.verdict)}
            </Badge>
          </div>
          <p className="description mt-4 max-w-2xl text-muted-foreground">{report.summaryVerdict}</p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center md:w-auto md:justify-end">
          <div className="text-left sm:text-right">
            <span className="caption-mono block text-muted-foreground">{copy.scorecard.composite}</span>
            <span className={cn("font-mono text-4xl font-extrabold", scoreTextClass(report.compositeScore / 10))}>
              {report.compositeScore}
              <span className="text-lg text-muted-foreground">/100</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadText(downloadFilename(report, "md"), toMarkdown(report), "text/markdown")}
            >
              {copy.scorecard.exportMd}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadText(downloadFilename(report, "json"), toJson(report), "application/json")}
            >
              {copy.scorecard.exportJson}
            </Button>
            <Button type="button" size="sm" onClick={onReset}>
              {copy.dashboard.newIdea}
            </Button>
          </div>
        </div>
      </Card>

      <KillTriggers fatalFlaws={report.fatalFlaws} killTriggers={report.killTriggers} />

      <Card>
        <h3 className="caption-mono mb-6 border-b border-border pb-4 text-muted-foreground">
          {copy.scorecard.matrix}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {report.dimensionScores.map((dim) => (
            <div key={dim.id} className="rounded-md border border-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="h5 text-foreground">{dim.name}</span>
                  <span className="caption-mono ml-2 text-muted-foreground">
                    ({copy.scorecard.weight(Math.round(dim.weight * 100))})
                  </span>
                </div>
                <span className={cn("font-mono text-lg font-bold", scoreTextClass(dim.score))}>
                  {dim.score}/10
                </span>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full", scoreBarClass(dim.score))}
                  style={{ width: `${dim.score * 10}%` }}
                  role="progressbar"
                  aria-valuenow={dim.score}
                  aria-valuemin={0}
                  aria-valuemax={10}
                />
              </div>
              <p className="description mb-4 text-muted-foreground">{dim.justification}</p>
              <div className="description rounded-md border border-destructive/20 bg-destructive/5 p-2 font-mono text-destructive">
                {copy.scorecard.risk(dim.primaryRisk)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <RedTeamTabs critiques={report.redTeamCritiques} />

      <Card className="border-warning/40">
        <h3 className="caption-mono mb-2 text-warning">{copy.scorecard.onlyWay}</h3>
        <p className="description text-foreground/90">{report.onlyWayThisWorks}</p>
      </Card>

      <NextSteps gates={report.validationGates} />

      {report.evidenceUsed && (
        <Card>
          <h3 className="caption-mono mb-2 text-muted-foreground">{copy.scorecard.evidence}</h3>
          <p className="caption-mono mb-2 text-muted-foreground">
            {copy.scorecard.evidenceServers(report.evidenceUsed.servers.join(", "))}
          </p>
          {report.evidenceUsed.gaps.length > 0 && (
            <p className="description mb-2 text-warning">
              {copy.scorecard.evidenceGaps(report.evidenceUsed.gaps.join("; "))}
            </p>
          )}
          {report.evidenceUsed.notes && (
            <pre className="description max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 font-mono text-muted-foreground">
              {report.evidenceUsed.notes}
            </pre>
          )}
        </Card>
      )}

      <Button type="button" size="lg" onClick={onReset}>
        {copy.dashboard.newIdea}
      </Button>
    </div>
  );
}
