// frontend/src/features/auth/components/error/dev-error-toggle.jsx
"use client";

// import SHOW_ENV_DEBUG from dev-wrapper to avoid circular dependency
// This prevents a circular dependency issue
import { SHOW_ENV_DEBUG } from "@/hooks/environment-debug";
import { Button } from "@/components/ui/button";
import { Bug, X } from "lucide-react";

export function DevErrorToggle({
  onTriggerError,
  onClearError,
  isErrorActive,
}) {


  if (!SHOW_ENV_DEBUG) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 shadow-lg z-50">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-1">
          <Bug className="h-3 w-3 text-orange-500" />
          <span className="text-xs font-medium">Dev Tools</span>
        </div>

        {!isErrorActive ? (
          <Button
            onClick={onTriggerError}
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
          >
            <Bug className="h-3 w-3 mr-1" />
            Show Error
          </Button>
        ) : (
          <Button
            onClick={onClearError}
            size="sm"
            variant="destructive"
            className="w-full h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Error
          </Button>
        )}

        <p className="text-[10px] text-muted-foreground">Test error boundary</p>
      </div>
    </div>
  );
}
