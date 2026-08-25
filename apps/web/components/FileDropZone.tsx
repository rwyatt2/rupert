"use client";

import { ACCEPT_FILE_TYPES } from "@/lib/extractText";
import type { FileAttachment } from "@/lib/ingestFile";
import { type ReactNode, useRef, useState } from "react";

interface FileDropZoneProps {
  toolbar: ReactNode;
  children: ReactNode;
  attachment: FileAttachment | null;
  disabled?: boolean;
  ingesting?: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropZone({
  toolbar,
  children,
  attachment,
  disabled,
  ingesting,
  onFile,
  onRemove,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const dragging = dragDepth > 0 && !disabled;

  const takeFile = (file: File | undefined) => {
    if (!file || disabled || ingesting) return;
    onFile(file);
  };

  return (
    <div
      className="relative space-y-3"
      onDragEnter={(e) => {
        e.preventDefault();
        if (disabled) return;
        setDragDepth((depth) => depth + 1);
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragDepth((depth) => Math.max(0, depth - 1));
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragDepth(0);
        takeFile(e.dataTransfer.files[0]);
      }}
    >
      {dragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-dashed border-zinc-500 bg-zinc-950/80 pointer-events-none">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-200">Drop file to attach</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {toolbar}
        <div className="flex items-center gap-2">
          {ingesting && <span className="text-[10px] font-mono uppercase text-zinc-500">Reading file…</span>}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ACCEPT_FILE_TYPES}
            disabled={disabled || ingesting}
            onChange={(e) => {
              takeFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={disabled || ingesting}
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-zinc-800 rounded bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Choose file
          </button>
        </div>
      </div>

      {attachment && (
        <div className="border border-zinc-800 rounded-lg bg-zinc-900 p-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-mono text-zinc-200 truncate">{attachment.filename}</p>
              <p className="text-[10px] font-mono uppercase text-zinc-500 mt-0.5">
                {formatBytes(attachment.byteSize)} · {attachment.extractor} ·{" "}
                {attachment.charCount.toLocaleString()} chars
                {attachment.truncated ? " · truncated" : ""} ·{" "}
                {attachment.classification.kind === "idea" ? "form" : "chat"}
              </p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={onRemove}
              className="shrink-0 text-[10px] font-mono uppercase text-zinc-500 hover:text-zinc-200 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
          <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap break-words max-h-28 overflow-y-auto">
            {attachment.preview}
            {attachment.preview.length >= 480 ? "…" : ""}
          </pre>
        </div>
      )}

      {children}
    </div>
  );
}
