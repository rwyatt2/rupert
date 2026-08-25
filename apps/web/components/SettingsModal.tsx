"use client";

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
import { useEffect, useState, type ReactNode } from "react";
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
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-300" aria-hidden />
        Ready
      </span>
    );
  }
  return <span className="text-[10px] uppercase tracking-wider text-zinc-600">No key</span>;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded ${
        active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

function AccountTab() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return <p className="text-xs text-zinc-500">Loading account…</p>;
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
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-full border border-zinc-700 bg-zinc-800 bg-cover bg-center"
          style={{ backgroundImage: `url(${user.imageUrl})` }}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-100">{user.fullName || "Signed in"}</p>
          <p className="truncate text-xs text-zinc-500">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <label className="block space-y-1">
        <span className="block text-xs font-mono uppercase text-zinc-400">Display name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setDraftName(event.target.value)}
          className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
        />
      </label>

      <p className="text-[10px] text-zinc-500">
        API keys stay in this browser for your account and are never stored on Rupert&apos;s servers.
      </p>

      {message && <p className="text-[11px] text-zinc-400">{message}</p>}

      <div className="flex justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={() => void signOut({ redirectUrl: "/sign-in" })}
          className="px-4 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-zinc-200"
        >
          Sign out
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveName()}
          className="rounded bg-zinc-100 px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
        >
          Save name
        </button>
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-200">Settings</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 font-mono text-xs">
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-zinc-800 pb-3">
          <TabButton active={tab === "account"} onClick={() => setTab("account")}>
            Account
          </TabButton>
          <TabButton active={tab === "models"} onClick={() => setTab("models")}>
            Models
          </TabButton>
        </div>

        {tab === "account" ? (
          <AccountTab />
        ) : (
          <>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {AI_PROVIDERS.map((p) => {
                  const selected = localSettings.provider === p;
                  const ready = isProviderReady(p, selected ? localSettings : localProfiles[p]);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleProviderChange(p)}
                      className={`py-2 px-2 text-xs font-mono rounded border ${
                        selected
                          ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <span className="flex flex-col items-center gap-0.5">
                        <span className="capitalize">{p}</span>
                        <ReadyMark ready={ready} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                {localSettings.provider === "ollama"
                  ? "API key (optional for local, required for cloud)"
                  : "API key (this browser, for your account)"}
              </label>
              <input
                type="password"
                placeholder={localSettings.provider === "ollama" ? "Ollama Cloud key" : "sk-..."}
                value={localSettings.apiKey}
                onChange={(e) => {
                  const apiKey = e.target.value;
                  const next = { ...localSettings, apiKey };
                  syncSettings(localSettings.provider === "ollama" ? resolveOllamaSettings(next) : next);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                {localSettings.provider === "ollama"
                  ? hosted
                    ? "Local Ollama is not reachable from this hosted app. A key sends requests to ollama.com."
                    : "A key always uses Ollama Cloud. Clear the key to use local Ollama."
                  : "Stored in this browser for your account. Sent only with the current evaluation request — never written to a remote store."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Model identifier</label>
              <input
                type="text"
                value={localSettings.model}
                onChange={(e) => syncSettings({ ...localSettings, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono"
              />
              {localSettings.provider === "google" && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {GOOGLE_MODEL_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => syncSettings({ ...localSettings, model: option.id })}
                      className={`px-2 py-1 text-[10px] font-mono rounded border ${
                        localSettings.model === option.id
                          ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              {localSettings.provider === "ollama" &&
                (isOllamaCloud(localSettings.customBaseUrl) || Boolean(localSettings.apiKey.trim())) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {OLLAMA_CLOUD_MODEL_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => syncSettings({ ...localSettings, model: option.id })}
                        className={`px-2 py-1 text-[10px] font-mono rounded border ${
                          localSettings.model === option.id
                            ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {localSettings.provider === "ollama" && (
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Ollama base URL</label>
                <input
                  type="text"
                  placeholder={hosted ? OLLAMA_CLOUD_URL : OLLAMA_LOCAL_URL}
                  value={localSettings.customBaseUrl || (hosted ? OLLAMA_CLOUD_URL : OLLAMA_LOCAL_URL)}
                  onChange={(e) =>
                    syncSettings(resolveOllamaSettings({ ...localSettings, customBaseUrl: e.target.value }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
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
                        className={`px-2 py-1 text-[10px] font-mono rounded border ${
                          current === option.id
                            ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-zinc-500`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {hosted
                    ? "Use https://ollama.com. A local 127.0.0.1 URL will not work on this host."
                    : "Local is http://127.0.0.1:11434. Cloud is https://ollama.com — not the /api path from the docs."}
                </p>
              </div>
            )}

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <h4 className="text-xs font-mono uppercase text-zinc-400">MCP evidence (optional)</h4>
              {hosted ? (
                <p className="text-[10px] text-zinc-500">
                  MCP evidence needs local stdio servers in ~/.rupert/mcp.json, which are not available on this host.
                </p>
              ) : (
                <>
                  <label className="flex items-start gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={localMcp.useMcpEvidence}
                      onChange={(e) => setLocalMcp({ ...localMcp, useMcpEvidence: e.target.checked })}
                      className="mt-0.5"
                    />
                    Query servers in ~/.rupert/mcp.json before scoring. Off by default. Fail-open if a server is down.
                  </label>
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Only these server names (comma-separated, blank = all enabled)
                    </label>
                    <input
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
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-mono uppercase text-zinc-400">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold uppercase rounded"
              >
                Save configuration
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
