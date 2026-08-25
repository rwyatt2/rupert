"use client";

import { AI_PROVIDERS, DEFAULT_MODELS, type AIProvider, type ProviderSettings } from "@rupert/core";
import { useEffect, useState } from "react";
import { saveMcpUiSettings, saveStoredSettings, type McpUiSettings } from "@/lib/storage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProviderSettings;
  mcp: McpUiSettings;
  onSave: (settings: ProviderSettings, mcp: McpUiSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, mcp, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [localMcp, setLocalMcp] = useState(mcp);

  useEffect(() => {
    setLocalSettings(settings);
    setLocalMcp(mcp);
  }, [settings, mcp, isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    setLocalSettings({
      ...localSettings,
      provider,
      model: DEFAULT_MODELS[provider],
    });
  };

  const handleSave = () => {
    saveStoredSettings(localSettings);
    saveMcpUiSettings(localMcp);
    onSave(localSettings, localMcp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-200">
            Provider and MCP configuration
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 font-mono text-xs">
            ✕
          </button>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {AI_PROVIDERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleProviderChange(p)}
                className={`py-2 text-xs font-mono capitalize rounded border ${
                  localSettings.provider === p
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {localSettings.provider !== "ollama" && (
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              API key (stored in this browser only)
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Sent only to the local Next.js route for the current request. Never written to a remote store.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Model identifier</label>
          <input
            type="text"
            value={localSettings.model}
            onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono"
          />
        </div>

        {localSettings.provider === "ollama" && (
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Ollama base URL</label>
            <input
              type="text"
              placeholder="http://127.0.0.1:11434"
              value={localSettings.customBaseUrl || "http://127.0.0.1:11434"}
              onChange={(e) => setLocalSettings({ ...localSettings, customBaseUrl: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono"
            />
          </div>
        )}

        <div className="border-t border-zinc-800 pt-4 space-y-3">
          <h4 className="text-xs font-mono uppercase text-zinc-400">MCP evidence (optional)</h4>
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
      </div>
    </div>
  );
}
