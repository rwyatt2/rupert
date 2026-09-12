"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RunStatusBar } from "@/components/RunStatusBar";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface IdeaChatProps {
  onSubmit: (messages: string[]) => void;
  onCancel?: () => void;
  isLoading: boolean;
  fileNote?: string | null;
}

const textareaClass = cn(
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
);

export function IdeaChat({ onSubmit, onCancel, isLoading, fileNote }: IdeaChatProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, fileNote]);

  const addNote = () => {
    const text = draft.trim();
    if (!text || isLoading) return;
    setMessages((prev) => [...prev, text]);
    setDraft("");
  };

  const run = () => {
    if (isLoading) return;
    const pending = draft.trim();
    const userNotes = pending ? [...messages, pending] : messages;
    const next = fileNote ? [fileNote, ...userNotes] : userNotes;
    if (next.length === 0) return;
    if (pending) {
      setMessages(userNotes);
      setDraft("");
    }
    onSubmit(next);
  };

  return (
    <Card className="flex min-h-112 flex-col space-y-4">
      <CardHeader>
        <CardTitle>Describe the idea</CardTitle>
        <CardDescription>
          Dump what you know. Missing details stay unproven and will score accordingly.
        </CardDescription>
      </CardHeader>

      <div
        ref={threadRef}
        className="min-h-48 max-h-96 flex-1 space-y-4 overflow-y-auto rounded-md border border-border bg-background p-4"
      >
        {messages.length === 0 && !fileNote ? (
          <p className="caption-mono py-8 text-center text-muted-foreground">
            No notes yet. Add what you know, or drop a file, then run the stress test.
          </p>
        ) : (
          <>
            {fileNote && (
              <div className="max-w-[95%] whitespace-pre-wrap rounded-lg border border-border bg-background px-4 py-2 description text-foreground/90">
                {fileNote}
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.slice(0, 24)}`}
                className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-lg border border-border bg-secondary px-4 py-2 description text-foreground"
              >
                {message}
              </div>
            ))}
          </>
        )}
      </div>

      <textarea
        rows={3}
        value={draft}
        disabled={isLoading}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addNote();
          }
        }}
        placeholder="What you know so far. Enter to add a note, Shift+Enter for a new line."
        className={textareaClass}
      />

      {isLoading ? (
        <RunStatusBar onCancel={onCancel} />
      ) : (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={!draft.trim()} onClick={addNote}>
            Add note
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={messages.length === 0 && !draft.trim() && !fileNote}
            onClick={run}
          >
            Execute stress test
          </Button>
        </div>
      )}
    </Card>
  );
}
