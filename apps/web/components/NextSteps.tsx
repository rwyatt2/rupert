import type { ValidationGate } from "@rupert/core";

export function NextSteps({ gates }: { gates: ValidationGate[] }) {
  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
      <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-800">
        Pre-code validation gates
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gates.map((gate) => (
          <div key={gate.gate} className="p-4 bg-zinc-950 border border-zinc-800 rounded flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono font-bold text-zinc-400">GATE {gate.gate}</span>
                <span className="text-[10px] font-mono text-zinc-500">~{gate.estimatedHours} hrs</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-200 mb-2">{gate.objective}</h4>
              <p className="text-xs text-zinc-400 mb-4">{gate.method}</p>
            </div>
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-emerald-400/90">
              Pass: {gate.passThreshold}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
