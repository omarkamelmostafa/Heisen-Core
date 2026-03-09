// components/auth/production-error-tester.jsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Code, Cpu } from "lucide-react";
import { useState } from "react";

export function ProductionErrorTester() {
  const [isVisible, setIsVisible] = useState(false);

  const triggerRuntimeError = () => {
    throw new Error("Production runtime error test - This is intentional");
  };

  const triggerTypeError = () => {
    // This will cause a TypeError
    const nullObject = null;
    nullObject.someMethod();
  };

  const triggerReferenceError = () => {
    // This will cause a ReferenceError
    someUndefinedFunction();
  };

  const triggerAsyncError = async () => {
    // Simulate async operation that fails
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Async operation failed in production"));
      }, 100);
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-24 right-4 bg-card border border-blue-500 rounded-lg p-3 shadow-lg z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs"
        >
          <Code className="h-3 w-3 mr-1" />
          Test Errors
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 bg-card border border-red-500 rounded-lg p-4 shadow-lg z-50 max-w-xs">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">Production Error Test</span>
        </div>

        <div className="space-y-2">
          <Button
            onClick={triggerRuntimeError}
            size="sm"
            variant="destructive"
            className="w-full h-8 text-xs"
          >
            <Cpu className="h-3 w-3 mr-1" />
            Runtime Error
          </Button>

          <Button
            onClick={triggerTypeError}
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
          >
            TypeError
          </Button>

          <Button
            onClick={triggerReferenceError}
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
          >
            ReferenceError
          </Button>

          <Button
            onClick={triggerAsyncError}
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
          >
            Async Error
          </Button>
        </div>

        <Button
          onClick={() => setIsVisible(false)}
          size="sm"
          variant="ghost"
          className="w-full h-6 text-xs"
        >
          Hide
        </Button>

        <p className="text-[10px] text-muted-foreground">
          Tests Next.js error boundary in production
        </p>
      </div>
    </div>
  );
}
