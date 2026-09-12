"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copy } from "@/lib/copy";
import type { InputMode } from "@/lib/storage";

interface ModeToggleProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
  disabled?: boolean;
}

export function ModeToggle({ value, onChange, disabled }: ModeToggleProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as InputMode)}
      className="w-fit"
    >
      <TabsList variant="line" className="caption-mono h-auto gap-0 bg-transparent p-0">
        <TabsTrigger value="form" disabled={disabled} className="px-4 py-2" data-testid="mode-form">
          {copy.mode.form}
        </TabsTrigger>
        <TabsTrigger value="chat" disabled={disabled} className="px-4 py-2" data-testid="mode-chat">
          {copy.mode.chat}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
