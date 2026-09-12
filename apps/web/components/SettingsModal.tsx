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
        Ready
      </span>
    );
  }
  return <span className="caption-mono text-muted-foreground">No key</span>;
}

function AccountTab() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return <p className="description text-muted-foreground">Loading account…</p>;
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
      setMessage("Name saved.");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Could not save name.");
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
          <p className="h5 truncate">{user.fullName || "Signed in"}</p>
          <p className="description truncate text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <label className="block space-y-2">
        <Label htmlFor="display-name">Display name</Label>
        <Input id="display-name" type="text" value={name} onChange={(event) => setDraftName(event.target.value)} />
      </label>

      <p className="h6 text-muted-foreground">
        API keys stay in this browser for your account and are never stored on Rupert&apos;s servers.
      </p>

      {message && <p className="description text-muted-foreground">{message}</p>}

      <div className="flex justify-between gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => void signOut({ redirectUrl: "/" })}>
          Sign out
        </Button>
        <Button type="button" disabled={saving} onClick={() => void saveName()}>
          Save name
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
      <DialogContent className="gap-6 sm:max-w-md" showCloseButton>
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="caption-mono text-left font-medium uppercase tracking-wider">
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as SettingsTab)}
          className="gap-6"
        >
          <TabsList variant="line" className="caption-mono h-auto w-full justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="account" className="px-4 py-2">
              Account
            </TabsTrigger>
            <TabsTrigger value="models" className="px-4 py-2">
              Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-0">
            <AccountTab />
          </TabsContent>

          <TabsContent value="models" className="mt-0 space-y-6">
            <div>
              <Label className="mb-4 block">Provider</Label>
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
                {localSettings.provider === "ollama"
                  ? "API key (optional for local, required for cloud)"
                  : "API key (this browser, for your account)"}
              </Label>
              <Input
                type="password"
                placeholder={localSettings.provider === "ollama" ? "Ollama Cloud key" : "sk-..."}
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
                    ? "Local Ollama is not reachable from this hosted app. A key sends requests to ollama.com."
                    : "A key always uses Ollama Cloud. Clear the key to use local Ollama."
                  : "Stored in this browser for your account. Sent only with the current evaluation request — never written to a remote store."}
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Model identifier</Label>
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
                <Label className="mb-2 block">Ollama base URL</Label>
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
                              ? "Local Ollama is not reachable on this host."
                              : "Clear the API key to use local Ollama."
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
                  {hosted
                    ? "Use https://ollama.com. A local 127.0.0.1 URL will not work on this host."
                    : "Local is http://127.0.0.1:11434. Cloud is https://ollama.com — not the /api path from the docs."}
                </p>
              </div>
            )}

            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="caption-mono text-muted-foreground">MCP evidence (optional)</h4>
              {hosted ? (
                <p className="h6 text-muted-foreground">
                  MCP evidence needs local stdio servers in ~/.rupert/mcp.json, which are not available on this host.
                </p>
              ) : (
                <>
                  <label className="description flex items-start gap-2 text-foreground/90">
                    <input
                      type="checkbox"
                      checked={localMcp.useMcpEvidence}
                      onChange={(e) => setLocalMcp({ ...localMcp, useMcpEvidence: e.target.checked })}
                      className="mt-1"
                    />
                    Query servers in ~/.rupert/mcp.json before scoring. Off by default. Fail-open if a server is down.
                  </label>
                  <div>
                    <Label className="mb-2 block">
                      Only these server names (comma-separated, blank = all enabled)
                    </Label>
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
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save configuration
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
