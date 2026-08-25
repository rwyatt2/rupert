import type { KillTrigger } from "@rupert/core";

interface KillTriggersProps {
  fatalFlaws: string[];
  killTriggers: KillTrigger[];
}

export function KillTriggers({ fatalFlaws, killTriggers }: KillTriggersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h3 className="text-xs font-mono uppercase tracking-wider text-rose-500 mb-3">Top fatal flaws</h3>
        <ul className="space-y-2">
          {fatalFlaws.map((flaw, idx) => (
            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
              <span className="text-rose-500 font-mono font-bold">[{idx + 1}]</span>
              <span>{flaw}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
          Instant kill trigger status
        </h3>
        <div className="space-y-2">
          {killTriggers.map((trigger) => (
            <div key={trigger.name} className="flex items-start justify-between gap-2 text-xs">
              <span className="text-zinc-300">{trigger.name}</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                  trigger.triggered
                    ? "bg-rose-950 text-rose-400 border border-rose-800"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {trigger.triggered ? "TRIGGERED" : "CLEARED"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
