"use client";

import type { ProviderSettings } from "@rupert/core";
import { isProviderReady, profileFromSettings } from "@/lib/storage";

interface HeaderProps {
  settings: ProviderSettings;
  onOpenSettings: () => void;
  onNewIdea?: () => void;
  showNewIdea?: boolean;
}

export function Header({ settings, onOpenSettings, onNewIdea, showNewIdea }: HeaderProps) {
  const modelLabel = settings.model.split("/").pop();
  const ready = isProviderReady(settings.provider, profileFromSettings(settings));
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-zinc-100">RUPERT</h1>
        <p className="text-xs font-mono text-zinc-500">Adversarial Idea Stress-Testing System</p>
      </div>
      <div className="flex items-center gap-2">
        {showNewIdea && (
          <button
            type="button"
            onClick={onNewIdea}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded transition"
          >
            New idea
          </button>
        )}
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-3 py-1.5 text-xs font-mono uppercase bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded transition"
        >
          <span className="inline-flex items-center gap-2">
            <span>
              Provider: {settings.provider} ({modelLabel})
            </span>
            {ready ? (
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-300" aria-hidden />
                Ready
              </span>
            ) : (
              <span className="text-zinc-500">No key</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
