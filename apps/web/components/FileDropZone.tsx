"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy";
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
      className="relative space-y-4"
      data-testid="file-drop-zone"
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
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-dashed border-border bg-background/80">
          <p className="caption-mono text-foreground">{copy.file.drop}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 overflow-x-auto">{toolbar}</div>
        <div className="flex items-center gap-2">
          {ingesting && <span className="caption-mono text-muted-foreground">{copy.file.reading}</span>}
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || ingesting}
            onClick={() => inputRef.current?.click()}
          >
            {copy.file.choose}
          </Button>
        </div>
      </div>

      {attachment && (
        <Card className="space-y-2 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="caption-mono truncate text-foreground">{attachment.filename}</p>
              <p className="caption-mono mt-2 text-muted-foreground">
                {formatBytes(attachment.byteSize)} · {attachment.extractor} ·{" "}
                {attachment.charCount.toLocaleString()} chars
                {attachment.truncated ? " · truncated" : ""} ·{" "}
                {attachment.classification.kind === "idea" ? "form" : "chat"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={onRemove}
              className="shrink-0 normal-case tracking-normal"
            >
              {copy.file.remove}
            </Button>
          </div>
          <pre className="description max-h-28 overflow-y-auto whitespace-pre-wrap break-words text-muted-foreground">
            {attachment.preview}
            {attachment.preview.length >= 480 ? "…" : ""}
          </pre>
        </Card>
      )}

      {children}
    </div>
  );
}
