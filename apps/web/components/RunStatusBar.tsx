"use client";

import { Button } from "@/components/ui/button";

interface RunStatusBarProps {
  onCancel?: () => void;
}

export function RunStatusBar({ onCancel }: RunStatusBarProps) {
  return (
    <div className="flex gap-2">
      <Button type="button" size="lg" className="flex-1 opacity-50" disabled>
        Running adversarial simulation...
      </Button>
      <Button type="button" variant="destructive" size="lg" onClick={onCancel}>
        Stop
      </Button>
    </div>
  );
}
