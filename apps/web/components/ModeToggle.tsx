"use client";

import { cn } from "@/lib/utils";
import type { InputMode } from "@/lib/storage";

interface ModeToggleProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
  disabled?: boolean;
}

export function ModeToggle({ value, onChange, disabled }: ModeToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border" role="tablist">
      {(["form", "chat"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={value === mode}
          disabled={disabled}
          onClick={() => onChange(mode)}
          className={cn(
            "caption-mono px-4 py-2 hover-interact disabled:cursor-not-allowed disabled:opacity-40",
            value === mode
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          {mode === "form" ? "Form" : "Chat"}
        </button>
      ))}
    </div>
  );
}
