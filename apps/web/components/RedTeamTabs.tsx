"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { stanceBadgeClass } from "@/lib/score-colors";
import { cn } from "@/lib/utils";
import type { RedTeamCritique } from "@rupert/core";
import { useState } from "react";

export function RedTeamTabs({ critiques }: { critiques: RedTeamCritique[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const activeCritique = critiques[activeTab];

  return (
    <Card>
      <h3 className="caption-mono mb-4 border-b border-border pb-4 text-muted-foreground">
        Adversarial red team stakeholder panel
      </h3>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {critiques.map((c, idx) => (
          <button
            key={c.role}
            type="button"
            role="tab"
            aria-selected={activeTab === idx}
            onClick={() => setActiveTab(idx)}
            className={cn(
              "caption-mono rounded-md border px-4 py-2 hover-interact",
              activeTab === idx
                ? "border-border bg-secondary text-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {c.role}
          </button>
        ))}
      </div>
      {activeCritique && (
        <div className="space-y-4 rounded-md border border-border bg-background p-6" role="tabpanel">
          <div className="flex items-center justify-between gap-4">
            <h4 className="h4">{activeCritique.role}</h4>
            <Badge className={cn("border", stanceBadgeClass(activeCritique.stance))}>
              {activeCritique.stance}
            </Badge>
          </div>
          <div>
            <span className="caption-mono mb-2 block text-muted-foreground">Core attack</span>
            <p className="description text-foreground/90">{activeCritique.coreAttack}</p>
          </div>
          <div>
            <span className="caption-mono mb-2 block text-muted-foreground">Required proof</span>
            <p className="description rounded-md border border-border bg-card p-4 font-mono text-muted-foreground">
              {activeCritique.requiredProof}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
