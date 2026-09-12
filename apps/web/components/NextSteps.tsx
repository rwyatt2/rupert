import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import type { ValidationGate } from "@rupert/core";

export function NextSteps({ gates }: { gates: ValidationGate[] }) {
  return (
    <Card>
      <h3 className="caption-mono mb-6 border-b border-border pb-4 text-muted-foreground">
        {copy.scorecard.gates}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {gates.map((gate) => (
          <div
            key={gate.gate}
            className="flex flex-col justify-between rounded-md border border-border bg-background p-4"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="caption-mono text-muted-foreground">{copy.scorecard.gate(gate.gate)}</span>
                <span className="caption-mono text-muted-foreground">~{gate.estimatedHours} hrs</span>
              </div>
              <h4 className="h5 mb-2 text-foreground">{gate.objective}</h4>
              <p className="description mb-4 text-muted-foreground">{gate.method}</p>
            </div>
            <div className="description rounded-md border border-border bg-card p-2 font-mono text-success">
              {copy.scorecard.pass(gate.passThreshold)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
