"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
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
  const modelLabel = settings.model.split("/").pop() ?? settings.model;
  const ready = isProviderReady(settings.provider, profileFromSettings(settings));

  return (
    <header
      data-testid="app-header"
      className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h1 className="h3 font-mono tracking-tight">{copy.brand.name.toUpperCase()}</h1>
        <p className="caption-mono mt-1 text-muted-foreground">{copy.brand.subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {showNewIdea && (
          <Button type="button" size="sm" onClick={onNewIdea}>
            {copy.dashboard.newIdea}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenSettings}
          aria-label="Open model settings"
          className="max-w-full"
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="truncate">
              <span className="sm:hidden capitalize">{settings.provider}</span>
              <span className="hidden sm:inline">
                {copy.dashboard.providerLabel(settings.provider, modelLabel)}
              </span>
            </span>
            {ready ? (
              <Badge
                variant="default"
                className="gap-1 border-0 bg-transparent p-0 font-normal normal-case tracking-normal"
              >
                <span className="inline-block size-2 shrink-0 rounded-full bg-foreground/70" aria-hidden />
                {copy.dashboard.providerReady}
              </Badge>
            ) : (
              <span className="shrink-0 text-muted-foreground">{copy.dashboard.providerNoKey}</span>
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
    </header>
  );
}
