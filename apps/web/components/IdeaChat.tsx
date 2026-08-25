"use client";

import { RunStatusBar } from "@/components/RunStatusBar";
import { useEffect, useRef, useState } from "react";

interface IdeaChatProps {
  onSubmit: (messages: string[]) => void;
  onCancel?: () => void;
  isLoading: boolean;
  fileNote?: string | null;
}

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
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4 flex flex-col min-h-112">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Describe the idea</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Dump what you know. Missing details stay unproven and will score accordingly.
        </p>
      </div>

      <div
        ref={threadRef}
        className="flex-1 min-h-48 max-h-96 overflow-y-auto space-y-3 rounded border border-zinc-800 bg-zinc-950 p-3"
      >
        {messages.length === 0 && !fileNote ? (
          <p className="text-xs font-mono text-zinc-600 py-8 text-center">
            No notes yet. Add what you know, or drop a file, then run the stress test.
          </p>
        ) : (
          <>
            {fileNote && (
              <div className="max-w-[95%] bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 whitespace-pre-wrap">
                {fileNote}
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.slice(0, 24)}`}
                className="ml-auto max-w-[85%] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 whitespace-pre-wrap"
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
        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 disabled:opacity-50"
      />

      {isLoading ? (
        <RunStatusBar onCancel={onCancel} />
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addNote}
            disabled={!draft.trim()}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold text-xs uppercase tracking-wider rounded transition"
          >
            Add note
          </button>
          <button
            type="button"
            onClick={run}
            disabled={messages.length === 0 && !draft.trim() && !fileNote}
            className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-100 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded transition"
          >
            Execute stress test
          </button>
        </div>
      )}
    </div>
  );
}
