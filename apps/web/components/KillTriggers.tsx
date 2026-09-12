import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { KillTrigger } from "@rupert/core";

interface KillTriggersProps {
  fatalFlaws: string[];
  killTriggers: KillTrigger[];
}

export function KillTriggers({ fatalFlaws, killTriggers }: KillTriggersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="caption-mono mb-4 text-destructive">Top fatal flaws</h3>
        <ul className="space-y-2">
          {fatalFlaws.map((flaw, idx) => (
            <li key={idx} className="description flex items-start gap-2 text-foreground/90">
              <span className="font-mono font-bold text-destructive">[{idx + 1}]</span>
              <span>{flaw}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-6">
        <h3 className="caption-mono mb-4 text-muted-foreground">Instant kill trigger status</h3>
        <div className="space-y-2">
          {killTriggers.map((trigger) => (
            <div key={trigger.name} className="flex items-start justify-between gap-4">
              <span className="description text-foreground/90">{trigger.name}</span>
              <Badge variant={trigger.triggered ? "destructive" : "muted"}>
                {trigger.triggered ? "Triggered" : "Cleared"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
