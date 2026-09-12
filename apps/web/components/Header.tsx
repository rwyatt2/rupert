"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 13a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H10a1.7 1.7 0 0 0 1-1.5V5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V10c.3.6.9 1 1.5 1.1H19a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

export function Header({ settings, onOpenSettings, onOpenAccount, onNewIdea, showNewIdea }: HeaderProps) {
  const modelLabel = settings.model.split("/").pop();
  const ready = isProviderReady(settings.provider, profileFromSettings(settings));

  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div>
        <h1 className="h3 font-mono tracking-tight">RUPERT</h1>
        <p className="caption-mono mt-1 text-muted-foreground">Adversarial Idea Stress-Testing System</p>
      </div>
      <div className="flex items-center gap-2">
        {showNewIdea && (
          <Button type="button" size="sm" onClick={onNewIdea}>
            New idea
          </Button>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={onOpenSettings}>
          <span className="inline-flex items-center gap-2">
            <span>
              Provider: {settings.provider} ({modelLabel})
            </span>
            {ready ? (
              <Badge variant="default" className="gap-1 border-0 bg-transparent p-0 font-normal normal-case tracking-normal">
                <span className="inline-block size-2 rounded-full bg-foreground/70" aria-hidden />
                Ready
              </Badge>
            ) : (
              <span className="text-muted-foreground">No key</span>
            )}
          </span>
        </Button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
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
