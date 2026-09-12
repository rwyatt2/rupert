"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  AI_PROVIDERS,
  GOOGLE_MODEL_OPTIONS,
  OLLAMA_BASE_OPTIONS,
  OLLAMA_CLOUD_MODEL_OPTIONS,
  OLLAMA_CLOUD_URL,
  OLLAMA_LOCAL_URL,
  isOllamaCloud,
  resolveOllamaSettings,
  type AIProvider,
  type ProviderSettings,
} from "@rupert/core";
import { useEffect, useState } from "react";
import {
  emptyProviderProfiles,
  getProviderProfiles,
  isProviderReady,
  profileFromSettings,
  saveMcpUiSettings,
  saveStoredSettings,
  settingsFromProfile,
  type McpUiSettings,
  type ProviderProfiles,
} from "@/lib/storage";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export type SettingsTab = "account" | "models";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  userId: string;
  settings: ProviderSettings;
  mcp: McpUiSettings;
  onSave: (settings: ProviderSettings, mcp: McpUiSettings) => void;
}

const hosted = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);

function ReadyMark({ ready }: { ready: boolean }) {
  if (ready) {
    return (
      <span className="caption-mono inline-flex items-center gap-2 text-muted-foreground">
        <span className="inline-block size-2 rounded-full bg-foreground/70" aria-hidden />
        {copy.settings.ready}
      </span>
    );
  }
  return <span className="caption-mono text-muted-foreground">{copy.settings.noKey}</span>;
}

function AccountTab() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return <p className="description text-muted-foreground">{copy.settings.loadingAccount}</p>;
  }

  const name = draftName ?? user.fullName ?? user.firstName ?? "";

  const saveName = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const trimmed = name.trim();
      const [firstName, ...rest] = trimmed.split(/\s+/);
      await user.update({
        firstName: firstName || undefined,
        lastName: rest.join(" ") || "",
      });
      setDraftName(trimmed);
      setMessage(copy.settings.nameSaved);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : copy.settings.nameSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className="size-12 shrink-0 rounded-full border border-border bg-secondary bg-cover bg-center"
          style={{ backgroundImage: `url(${user.imageUrl})` }}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="h5 truncate">{user.fullName || copy.settings.signedIn}</p>
          <p className="description truncate text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <label className="block space-y-2">
        <Label htmlFor="display-name">{copy.settings.displayName}</Label>
        <Input id="display-name" type="text" value={name} onChange={(event) => setDraftName(event.target.value)} />
      </label>

      <p className="h6 text-muted-foreground">
        {copy.settings.keysNote}
      </p>

      {message && <p className="description text-muted-foreground">{message}</p>}

      <div className="flex justify-between gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => void signOut({ redirectUrl: "/" })}>
          {copy.settings.signOut}
        </Button>
        <Button type="button" disabled={saving} onClick={() => void saveName()}>
          {copy.settings.saveName}
        </Button>
      </div>
    </div>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  initialTab = "models",
  userId,
  settings,
  mcp,
  onSave,
}: SettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [localSettings, setLocalSettings] = useState(settings);
  const [localProfiles, setLocalProfiles] = useState<ProviderProfiles>(() => ({
    ...emptyProviderProfiles(),
    [settings.provider]: profileFromSettings(settings),
  }));
  const [localMcp, setLocalMcp] = useState(mcp);

  useEffect(() => {
    // Reset drafts from storage when the modal opens or the signed-in user changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- draft reset
    setLocalSettings(settings.provider === "ollama" ? resolveOllamaSettings(settings) : settings);
    setLocalMcp(mcp);
    if (!isOpen) return;
    setTab(initialTab);
    setLocalProfiles({
      ...getProviderProfiles(userId),
      [settings.provider]: profileFromSettings(settings),
    });
  }, [settings, mcp, isOpen, initialTab, userId]);

  const syncSettings = (next: ProviderSettings) => {
    setLocalSettings(next);
    setLocalProfiles((prev) => ({
      ...prev,
      [next.provider]: profileFromSettings(next),
    }));
  };

  const handleProviderChange = (provider: AIProvider) => {
    if (provider === localSettings.provider) return;
    const stashed: ProviderProfiles = {
      ...localProfiles,
      [localSettings.provider]: profileFromSettings(localSettings),
    };
    setLocalProfiles(stashed);
    const next = settingsFromProfile(provider, stashed[provider]);
    setLocalSettings(provider === "ollama" ? resolveOllamaSettings(next) : next);
  };

  const handleSave = () => {
    const toSave =
      localSettings.provider === "ollama" ? resolveOllamaSettings(localSettings) : localSettings;
    const profilesToSave: ProviderProfiles = {
      ...localProfiles,
      [toSave.provider]: profileFromSettings(toSave),
    };
    saveStoredSettings(userId, toSave, profilesToSave);
    saveMcpUiSettings(userId, localMcp);
    onSave(toSave, localMcp);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto sm:max-w-md" showCloseButton data-testid="settings-modal">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="caption-mono text-left font-medium uppercase tracking-wider">
            {copy.settings.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as SettingsTab)}
          className="gap-6"
        >
          <TabsList variant="line" className="caption-mono h-auto w-full justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="account" className="px-4 py-2">
              {copy.settings.account}
            </TabsTrigger>
            <TabsTrigger value="models" className="px-4 py-2">
              {copy.settings.models}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-0">
            <AccountTab />
          </TabsContent>

          <TabsContent value="models" className="mt-0 space-y-6">
            <div>
              <Label className="mb-4 block">{copy.settings.provider}</Label>
              <div className="grid grid-cols-2 gap-2">
                {AI_PROVIDERS.map((p) => {
                  const selected = localSettings.provider === p;
                  const ready = isProviderReady(p, selected ? localSettings : localProfiles[p]);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleProviderChange(p)}
                      className={cn(
                        "caption-mono rounded-md border px-2 py-2 hover-interact",
                        selected
                          ? "border-border bg-secondary text-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="flex flex-col items-center gap-2">
                        <span className="capitalize">{p}</span>
                        <ReadyMark ready={ready} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                {localSettings.provider === "ollama" ? copy.settings.apiKeyOllama : copy.settings.apiKey}
              </Label>
              <Input
                type="password"
                placeholder={localSettings.provider === "ollama" ? copy.settings.apiKeyOllamaCloud : "sk-..."}
                value={localSettings.apiKey}
                onChange={(e) => {
                  const apiKey = e.target.value;
                  const next = { ...localSettings, apiKey };
                  syncSettings(localSettings.provider === "ollama" ? resolveOllamaSettings(next) : next);
                }}
                className="font-mono"
              />
              <p className="h6 mt-2 text-muted-foreground">
                {localSettings.provider === "ollama"
                  ? hosted
                    ? copy.settings.ollamaHostedKey
                    : copy.settings.ollamaLocalKey
                  : copy.settings.ollamaKeyStored}
              </p>
            </div>

            <div>
              <Label className="mb-2 block">{copy.settings.model}</Label>
              <Input
                type="text"
                value={localSettings.model}
                onChange={(e) => syncSettings({ ...localSettings, model: e.target.value })}
                className="font-mono"
              />
              {localSettings.provider === "google" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {GOOGLE_MODEL_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => syncSettings({ ...localSettings, model: option.id })}
                      className={cn(
                        "caption-mono rounded-md border px-2 py-1 hover-interact",
                        localSettings.model === option.id
                          ? "border-border bg-secondary text-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              {localSettings.provider === "ollama" &&
                (isOllamaCloud(localSettings.customBaseUrl) || Boolean(localSettings.apiKey.trim())) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {OLLAMA_CLOUD_MODEL_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => syncSettings({ ...localSettings, model: option.id })}
                        className={cn(
                          "caption-mono rounded-md border px-2 py-1 hover-interact",
                          localSettings.model === option.id
                            ? "border-border bg-secondary text-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {localSettings.provider === "ollama" && (
              <div>
                <Label className="mb-2 block">{copy.settings.ollamaUrl}</Label>
                <Input
                  type="text"
                  placeholder={hosted ? OLLAMA_CLOUD_URL : OLLAMA_LOCAL_URL}
                  value={localSettings.customBaseUrl || (hosted ? OLLAMA_CLOUD_URL : OLLAMA_LOCAL_URL)}
                  onChange={(e) =>
                    syncSettings(resolveOllamaSettings({ ...localSettings, customBaseUrl: e.target.value }))
                  }
                  className="font-mono"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {OLLAMA_BASE_OPTIONS.map((option) => {
                    const current = localSettings.customBaseUrl || (hosted ? OLLAMA_CLOUD_URL : OLLAMA_LOCAL_URL);
                    const localLocked = option.id === OLLAMA_LOCAL_URL && (hosted || Boolean(localSettings.apiKey.trim()));
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={localLocked}
                        title={
                          localLocked
                            ? hosted
                              ? copy.settings.ollamaLocalLockedHosted
                              : copy.settings.ollamaLocalLockedKey
                            : undefined
                        }
                        onClick={() =>
                          syncSettings(resolveOllamaSettings({ ...localSettings, customBaseUrl: option.id }))
                        }
                        className={cn(
                          "caption-mono rounded-md border px-2 py-1 hover-interact disabled:cursor-not-allowed disabled:opacity-40",
                          current === option.id
                            ? "border-border bg-secondary text-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="h6 mt-2 text-muted-foreground">
                  {hosted ? copy.settings.ollamaHostedUrl : copy.settings.ollamaLocalUrl}
                </p>
              </div>
            )}

            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="caption-mono text-muted-foreground">{copy.settings.mcpTitle}</h4>
              {hosted ? (
                <p className="h6 text-muted-foreground">{copy.settings.mcpHosted}</p>
              ) : (
                <>
                  <label className="description flex items-start gap-2 text-foreground/90">
                    <input
                      type="checkbox"
                      checked={localMcp.useMcpEvidence}
                      onChange={(e) => setLocalMcp({ ...localMcp, useMcpEvidence: e.target.checked })}
                      className="mt-1"
                    />
                    {copy.settings.mcpToggle}
                  </label>
                  <div>
                    <Label className="mb-2 block">{copy.settings.mcpFilter}</Label>
                    <Input
                      type="text"
                      value={localMcp.onlyServers.join(", ")}
                      onChange={(e) =>
                        setLocalMcp({
                          ...localMcp,
                          onlyServers: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="border-t border-border bg-transparent p-0 pt-4 sm:justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                {copy.settings.cancel}
              </Button>
              <Button type="button" onClick={handleSave}>
                {copy.settings.save}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
