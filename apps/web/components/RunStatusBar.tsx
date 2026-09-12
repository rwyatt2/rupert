"use client";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

interface RunStatusBarProps {
  onCancel?: () => void;
}

export function RunStatusBar({ onCancel }: RunStatusBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row" data-testid="run-status-bar">
      <Button type="button" size="lg" className="flex-1 opacity-50" disabled>
        {copy.form.running}
      </Button>
      <Button type="button" variant="destructive" size="lg" onClick={onCancel} className="sm:w-auto">
        {copy.form.stop}
      </Button>
    </div>
  );
}
