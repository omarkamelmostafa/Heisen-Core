// components/auth/error-simulator.jsx
"use client";

import { Button } from "@/components/ui/button";
import { AuthErrors } from "@/hooks/use-error-simulator";

export function ErrorSimulator({ onTriggerError }) {
  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg z-50">
      <h4 className="text-sm font-medium mb-3">Test Errors</h4>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTriggerError(AuthErrors.NETWORK)}
        >
          Network
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTriggerError(AuthErrors.CREDENTIALS)}
        >
          Credentials
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTriggerError(AuthErrors.EMAIL_EXISTS)}
        >
          Email Exists
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTriggerError(AuthErrors.RATE_LIMIT)}
        >
          Rate Limit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTriggerError(AuthErrors.EXPIRED)}
        >
          Expired
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTriggerError(AuthErrors.SERVER)}
        >
          Server
        </Button>
      </div>
    </div>
  );
}
