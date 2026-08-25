"use client";

interface RunStatusBarProps {
  onCancel?: () => void;
}

export function RunStatusBar({ onCancel }: RunStatusBarProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled
        className="flex-1 py-3 bg-zinc-100 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded opacity-50"
      >
        Running adversarial simulation...
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-3 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 font-mono font-bold text-xs uppercase tracking-wider rounded transition"
      >
        Stop
      </button>
    </div>
  );
}
