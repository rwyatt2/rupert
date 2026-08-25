"use client";

import type { EvaluationReport, IdeaInput, ProviderSettings } from "@rupert/core";
import { Header } from "@/components/Header";
import { HistorySidebar } from "@/components/HistorySidebar";
import { IdeaForm } from "@/components/IdeaForm";
import { Scorecard } from "@/components/Scorecard";
import { SettingsModal } from "@/components/SettingsModal";
import {
  DEFAULT_MCP_UI,
  deleteEvaluationFromHistory,
  getEvaluationHistory,
  getMcpUiSettings,
  getStoredSettings,
  saveEvaluationToHistory,
  type McpUiSettings,
} from "@/lib/storage";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [mcp, setMcp] = useState<McpUiSettings>(DEFAULT_MCP_UI);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<EvaluationReport | null>(null);
  const [history, setHistory] = useState<EvaluationReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
    setMcp(getMcpUiSettings());
    setHistory(getEvaluationHistory());
  }, []);

  const handleEvaluate = async (idea: IdeaInput) => {
    if (!settings || (!settings.apiKey && settings.provider !== "ollama")) {
      setIsSettingsOpen(true);
      setErrorMessage("Set an API key before running an evaluation.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          settings,
          useMcpEvidence: mcp.useMcpEvidence,
          onlyServers: mcp.onlyServers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setCurrentReport(data);
      saveEvaluationToHistory(data);
      setHistory(getEvaluationHistory());
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Evaluation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings) return null;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 selection:bg-zinc-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />

        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-800 rounded text-xs text-rose-300 font-mono">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {currentReport ? (
              <Scorecard report={currentReport} onReset={() => setCurrentReport(null)} />
            ) : (
              <IdeaForm onSubmit={handleEvaluate} isLoading={isLoading} />
            )}
          </div>
          <HistorySidebar
            history={history}
            currentId={currentReport?.id}
            onSelect={(report) => {
              setCurrentReport(report);
              setErrorMessage(null);
            }}
            onDelete={(id) => {
              deleteEvaluationFromHistory(id);
              setHistory(getEvaluationHistory());
              if (currentReport?.id === id) setCurrentReport(null);
            }}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        mcp={mcp}
        onSave={(updated, nextMcp) => {
          setSettings(updated);
          setMcp(nextMcp);
        }}
      />
    </main>
  );
}
