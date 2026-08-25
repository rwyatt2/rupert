"use client";

import type { ProviderSettings } from "@rupert/core";

interface HeaderProps {
  settings: ProviderSettings;
  onOpenSettings: () => void;
}

export function Header({ settings, onOpenSettings }: HeaderProps) {
  const modelLabel = settings.model.split("/").pop();
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-zinc-100">RUPERT</h1>
        <p className="text-xs font-mono text-zinc-500">Adversarial Idea Stress-Testing System</p>
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        className="px-3 py-1.5 text-xs font-mono uppercase bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded transition"
      >
        Provider: {settings.provider} ({modelLabel})
      </button>
    </div>
  );
}
