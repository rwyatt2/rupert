"use client";

import {
  resolveOllamaSettings,
  type ChatBrief,
  type EvaluationReport,
  type IdeaInput,
  type ProviderSettings,
} from "@rupert/core";
import { FileDropZone } from "@/components/FileDropZone";
import { Header } from "@/components/Header";
import { HistorySidebar } from "@/components/HistorySidebar";
import { IdeaChat } from "@/components/IdeaChat";
import { IdeaForm } from "@/components/IdeaForm";
import { ModeToggle } from "@/components/ModeToggle";
import { Scorecard } from "@/components/Scorecard";
import { SettingsModal, type SettingsTab } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  isProviderReady,
  migrateLegacyStorage,
  profileFromSettings,
  saveEvaluationToHistory,
  saveInputMode,
  saveStoredSettings,
  type InputMode,
  type McpUiSettings,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
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
  return (
    <Card
      className={cn(
        "flex items-start justify-between gap-4 p-4",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      <p className="description min-w-0">{message}</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 normal-case tracking-normal"
      >
        Dismiss
      </Button>
    </Card>
  );
}

export function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [mcp, setMcp] = useState<McpUiSettings>(DEFAULT_MCP_UI);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("models");
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
    if (!isLoaded || !userId) return;
    migrateLegacyStorage(userId);
    let next = getStoredSettings(userId);
    if (next.provider === "ollama") {
      const resolved = resolveOllamaSettings(next);
      if (resolved.customBaseUrl !== next.customBaseUrl || resolved.model !== next.model) {
        saveStoredSettings(userId, resolved);
        next = resolved;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage load
    setSettings(next);
    setMcp(getMcpUiSettings(userId));
    setHistory(getEvaluationHistory(userId));
    setInputMode(getInputMode(userId));
    setCurrentReport(null);
    return () => abortRef.current?.abort();
  }, [isLoaded, userId]);

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

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
      if (userId) saveInputMode(userId, mode);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setIngesting(false);
    }
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    if (userId) saveInputMode(userId, mode);
  };

  const handleEvaluate = async (payload: { idea?: IdeaInput; brief?: ChatBrief }) => {
    if (!userId || !settings || !isProviderReady(settings.provider, profileFromSettings(settings))) {
      openSettings("models");
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

    const requestSettings =
      settings.provider === "ollama" ? resolveOllamaSettings(settings) : settings;
    if (
      requestSettings.customBaseUrl !== settings.customBaseUrl ||
      requestSettings.model !== settings.model
    ) {
      setSettings(requestSettings);
      saveStoredSettings(userId, requestSettings);
    }

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          settings: requestSettings,
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
      saveEvaluationToHistory(userId, data);
      setHistory(getEvaluationHistory(userId));
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

  if (!isLoaded || !userId || !settings) return null;

  return (
    <main className="min-h-screen bg-background p-6 selection:bg-secondary md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <Header
          settings={settings}
          onOpenSettings={() => openSettings("models")}
          onOpenAccount={() => openSettings("account")}
          onNewIdea={handleNewIdea}
          showNewIdea={Boolean(currentReport)}
        />

        {errorMessage && (
          <Banner tone="error" message={errorMessage} onDismiss={() => setErrorMessage(null)} />
        )}

        {stoppedMessage && (
          <Banner tone="neutral" message={stoppedMessage} onDismiss={() => setStoppedMessage(null)} />
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            {currentReport ? (
              <Scorecard report={currentReport} onReset={handleNewIdea} />
            ) : (
              <div className="mx-auto max-w-3xl space-y-4">
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
              deleteEvaluationFromHistory(userId, id);
              setHistory(getEvaluationHistory(userId));
              if (currentReport?.id === id) setCurrentReport(null);
            }}
          />
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsTab}
          userId={userId}
          settings={settings}
          mcp={mcp}
          onSave={(updated, nextMcp) => {
            setSettings(updated);
            setMcp(nextMcp);
          }}
        />
      )}
    </main>
  );
}
