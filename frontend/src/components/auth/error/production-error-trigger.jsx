// frontend/src/components/auth/error/production-error-trigger.jsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { isDevelopment } from "@/lib/environment";

export function ProductionErrorTrigger() {
  // Only mount in production
  if (isDevelopment) {
    return null;
  }

  const [shouldThrow, setShouldThrow] = useState(null);

  // Render-time throws will be caught by React/Next error boundary
  if (shouldThrow === "runtime") {
    throw new Error("Real production runtime error - component failure");
  }

  if (shouldThrow === "type") {
    // Causes a TypeError during render
    const nullObject = null;
    // Accessing property during render will throw
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    nullObject.someMethod();
  }

  return (
    <div className="fixed bottom-4 left-4 bg-card border border-red-500 rounded-lg p-3 shadow-lg z-50">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <span className="text-xs font-medium">Prod Error Test</span>
        </div>

        <Button
          onClick={() => setShouldThrow("runtime")}
          size="sm"
          variant="destructive"
          className="w-full h-8 text-xs"
        >
          Runtime Error
        </Button>

        <Button
          onClick={() => setShouldThrow("type")}
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs"
        >
          TypeError
        </Button>

        <p className="text-[10px] text-muted-foreground">
          Tests real error boundary
        </p>
      </div>
    </div>
  );
}
