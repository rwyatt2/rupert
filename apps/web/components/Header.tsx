"use client";

import { UserButton } from "@clerk/nextjs";
import type { ProviderSettings } from "@rupert/core";
import { isProviderReady, profileFromSettings } from "@/lib/storage";

interface HeaderProps {
  settings: ProviderSettings;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  onNewIdea?: () => void;
  showNewIdea?: boolean;
}

function GearIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 13a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H10a1.7 1.7 0 0 0 1-1.5V5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V10c.3.6.9 1 1.5 1.1H19a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

export function Header({ settings, onOpenSettings, onOpenAccount, onNewIdea, showNewIdea }: HeaderProps) {
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
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Action label="Settings" labelIcon={<GearIcon />} onClick={onOpenAccount} />
            <UserButton.Action label="manageAccount" />
            <UserButton.Action label="signOut" />
          </UserButton.MenuItems>
        </UserButton>
      </div>
    </div>
  );
}
