// components/auth/production-error-trigger.jsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function ProductionErrorTrigger() {
  const triggerRealError = () => {
    // This REAL error will be caught by Next.js error boundary
    throw new Error("Real production runtime error - component failure");

    const searchParams = useSearchParams();

    useEffect(() => {
      // Check for secret trigger parameter
      const triggerError = searchParams.get("test_error");

      if (triggerError === "boundary") {
        // Trigger error on mount
        throw new Error("Production error boundary test triggered via URL");
      }
    }, [searchParams]);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-card border border-red-500 rounded-lg p-3 shadow-lg z-50">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <span className="text-xs font-medium">Prod Test</span>
        </div>

        <Button
          onClick={triggerRealError}
          size="sm"
          variant="destructive"
          className="w-full h-8 text-xs"
        >
          Trigger Real Error
        </Button>

        <p className="text-[10px] text-muted-foreground">
          Tests error boundary
        </p>
      </div>
    </div>
  );
}
