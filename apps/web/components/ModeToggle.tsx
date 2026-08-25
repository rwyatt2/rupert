"use client";

import type { InputMode } from "@/lib/storage";

interface ModeToggleProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
  disabled?: boolean;
}

const tabClass =
  "px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed";

export function ModeToggle({ value, onChange, disabled }: ModeToggleProps) {
  return (
    <div className="inline-flex border border-zinc-800 rounded overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("form")}
        className={`${tabClass} ${
          value === "form" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
        }`}
      >
        Form
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("chat")}
        className={`${tabClass} ${
          value === "chat" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
        }`}
      >
        Chat
      </button>
    </div>
  );
}
