"use client";

import type { ChatBrief, EvaluationReport, IdeaInput, ProviderSettings } from "@rupert/core";
import { FileDropZone } from "@/components/FileDropZone";
import { Header } from "@/components/Header";
import { HistorySidebar } from "@/components/HistorySidebar";
import { IdeaChat } from "@/components/IdeaChat";
import { IdeaForm } from "@/components/IdeaForm";
import { ModeToggle } from "@/components/ModeToggle";
import { Scorecard } from "@/components/Scorecard";
import { SettingsModal } from "@/components/SettingsModal";
import {
  briefNoteFromAttachment,
  ideaFromAttachment,
  ingestDroppedFile,
  type FileAttachment,
} from "@/lib/ingestFile";
import {
  DEFAULT_MCP_UI,
  deleteEvaluationFromHistory,
  getEvaluationHistory,
  getInputMode,
  getMcpUiSettings,
  getStoredSettings,
  saveEvaluationToHistory,
  saveInputMode,
  type InputMode,
  type McpUiSettings,
} from "@/lib/storage";
import { useEffect, useRef, useState } from "react";

function Banner({
  tone,
  message,
  onDismiss,
}: {
  tone: "error" | "neutral";
  message: string;
  onDismiss: () => void;
}) {
  const styles =
    tone === "error"
      ? "bg-rose-950/40 border-rose-800 text-rose-300"
      : "bg-zinc-900 border-zinc-700 text-zinc-300";
  const dismissStyles =
    tone === "error"
      ? "text-rose-400/70 hover:text-rose-200"
      : "text-zinc-500 hover:text-zinc-200";

  return (
    <div className={`flex items-start justify-between gap-3 p-4 border rounded text-xs font-mono ${styles}`}>
      <p className="min-w-0">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={`shrink-0 text-[10px] uppercase tracking-wider ${dismissStyles}`}
      >
        Dismiss
      </button>
    </div>
  );
}

export function Dashboard() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [mcp, setMcp] = useState<McpUiSettings>(DEFAULT_MCP_UI);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<EvaluationReport | null>(null);
  const [history, setHistory] = useState<EvaluationReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stoppedMessage, setStoppedMessage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("form");
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [prefillNonce, setPrefillNonce] = useState(0);
  const [ingesting, setIngesting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
    setMcp(getMcpUiSettings());
    setHistory(getEvaluationHistory());
    setInputMode(getInputMode());
    return () => abortRef.current?.abort();
  }, []);

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handleNewIdea = () => {
    handleCancel();
    setCurrentReport(null);
    setErrorMessage(null);
    setStoppedMessage(null);
    setAttachment(null);
    setPrefillNonce((n) => n + 1);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setPrefillNonce((n) => n + 1);
  };

  const handleDroppedFile = async (file: File) => {
    setIngesting(true);
    setErrorMessage(null);
    setStoppedMessage(null);
    try {
      const next = await ingestDroppedFile(file);
      setAttachment(next);
      setPrefillNonce((n) => n + 1);
      const mode: InputMode = next.classification.kind === "idea" ? "form" : "chat";
      setInputMode(mode);
      saveInputMode(mode);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setIngesting(false);
    }
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    saveInputMode(mode);
  };

  const handleEvaluate = async (payload: { idea?: IdeaInput; brief?: ChatBrief }) => {
    if (!settings || (!settings.apiKey && settings.provider !== "ollama")) {
      setIsSettingsOpen(true);
      setErrorMessage("Set an API key before running an evaluation.");
      setStoppedMessage(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setErrorMessage(null);
    setStoppedMessage(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          settings,
          useMcpEvidence: mcp.useMcpEvidence,
          onlyServers: mcp.onlyServers,
        }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) {
        setStoppedMessage("Evaluation stopped");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setCurrentReport(data);
      saveEvaluationToHistory(data);
      setHistory(getEvaluationHistory());
    } catch (err: unknown) {
      if (controller.signal.aborted || (err instanceof Error && err.name === "AbortError")) {
        setErrorMessage(null);
        setStoppedMessage("Evaluation stopped");
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : "Evaluation failed.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsLoading(false);
      }
    }
  };

  if (!settings) return null;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 selection:bg-zinc-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewIdea={handleNewIdea}
          showNewIdea={Boolean(currentReport)}
        />

        {errorMessage && (
          <Banner
            tone="error"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {stoppedMessage && (
          <Banner
            tone="neutral"
            message={stoppedMessage}
            onDismiss={() => setStoppedMessage(null)}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {currentReport ? (
              <Scorecard report={currentReport} onReset={handleNewIdea} />
            ) : (
              <div className="space-y-3 max-w-3xl mx-auto">
                <FileDropZone
                  toolbar={<ModeToggle value={inputMode} onChange={handleModeChange} disabled={isLoading || ingesting} />}
                  attachment={attachment}
                  disabled={isLoading}
                  ingesting={ingesting}
                  onFile={(file) => void handleDroppedFile(file)}
                  onRemove={handleRemoveAttachment}
                >
                  <div className={inputMode === "form" ? undefined : "hidden"}>
                    <IdeaForm
                      onSubmit={(idea) => handleEvaluate({ idea })}
                      onCancel={handleCancel}
                      isLoading={isLoading}
                      initialIdea={ideaFromAttachment(attachment)}
                      prefillNonce={prefillNonce}
                    />
                  </div>
                  <div className={inputMode === "chat" ? undefined : "hidden"}>
                    <IdeaChat
                      onSubmit={(messages) => handleEvaluate({ brief: { messages } })}
                      onCancel={handleCancel}
                      isLoading={isLoading}
                      fileNote={briefNoteFromAttachment(attachment)}
                    />
                  </div>
                </FileDropZone>
              </div>
            )}
          </div>
          <HistorySidebar
            history={history}
            currentId={currentReport?.id}
            onNewIdea={handleNewIdea}
            onSelect={(report) => {
              handleCancel();
              setCurrentReport(report);
              setErrorMessage(null);
              setStoppedMessage(null);
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
