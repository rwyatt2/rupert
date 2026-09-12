"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copy } from "@/lib/copy";
import { stanceBadgeClass } from "@/lib/score-colors";
import { cn } from "@/lib/utils";
import type { RedTeamCritique } from "@rupert/core";

export function RedTeamTabs({ critiques }: { critiques: RedTeamCritique[] }) {
  const defaultTab = critiques[0]?.role ?? "";

  return (
    <Card>
      <h3 className="caption-mono mb-4 border-b border-border pb-4 text-muted-foreground">
        {copy.scorecard.redTeam}
      </h3>
      <Tabs defaultValue={defaultTab} className="gap-6">
        <TabsList variant="line" className="caption-mono h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {critiques.map((c) => (
            <TabsTrigger key={c.role} value={c.role} className="px-4 py-2">
              {c.role}
            </TabsTrigger>
          ))}
        </TabsList>
        {critiques.map((critique) => (
          <TabsContent key={critique.role} value={critique.role} className="mt-0">
            <div className="space-y-4 rounded-md border border-border bg-background p-6">
              <div className="flex items-center justify-between gap-4">
                <h4 className="h4">{critique.role}</h4>
                <Badge className={cn("border", stanceBadgeClass(critique.stance))}>
                  {critique.stance}
                </Badge>
              </div>
              <div>
                <span className="caption-mono mb-2 block text-muted-foreground">{copy.scorecard.coreAttack}</span>
                <p className="description text-foreground/90">{critique.coreAttack}</p>
              </div>
              <div>
                <span className="caption-mono mb-2 block text-muted-foreground">{copy.scorecard.requiredProof}</span>
                <p className="description rounded-md border border-border bg-card p-4 font-mono text-muted-foreground">
                  {critique.requiredProof}
                </p>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
