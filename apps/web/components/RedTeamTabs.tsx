"use client";

import type { RedTeamCritique } from "@rupert/core";
import { useState } from "react";

export function RedTeamTabs({ critiques }: { critiques: RedTeamCritique[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const activeCritique = critiques[activeTab];

  const stanceBadge = (stance: RedTeamCritique["stance"]) => {
    switch (stance) {
      case "Veto":
        return "bg-rose-950 text-rose-400 border-rose-800";
      case "High Skepticism":
        return "bg-amber-950 text-amber-400 border-amber-800";
      case "Cautious":
        return "bg-yellow-950 text-yellow-500 border-yellow-800";
      case "Supportive":
        return "bg-emerald-950 text-emerald-400 border-emerald-800";
    }
  };

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
      <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-800">
        Adversarial red team stakeholder panel
      </h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {critiques.map((c, idx) => (
          <button
            key={c.role}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-2 text-xs font-mono rounded border transition ${
              activeTab === idx
                ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {c.role}
          </button>
        ))}
      </div>
      {activeCritique && (
        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-base font-semibold text-zinc-200">{activeCritique.role}</h4>
            <span className={`px-2 py-0.5 text-xs font-mono border rounded ${stanceBadge(activeCritique.stance)}`}>
              {activeCritique.stance}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase font-mono text-zinc-500 mb-1">Core attack</span>
            <p className="text-sm text-zinc-300 leading-relaxed">{activeCritique.coreAttack}</p>
          </div>
          <div>
            <span className="block text-xs uppercase font-mono text-zinc-500 mb-1">Required proof</span>
            <p className="text-xs text-zinc-400 font-mono bg-zinc-900 p-3 rounded border border-zinc-800">
              {activeCritique.requiredProof}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
