// components/auth/roulette-status.jsx
"use client";

import { Target, Shield } from "lucide-react";

export function RouletteStatus({ rouletteStatus }) {
  const { chamber, trigger, isHit } = rouletteStatus;

  return (
    <div className="fixed top-4 left-4 bg-card border rounded-lg p-3 shadow-lg z-40">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium">Russian Roulette</span>
          <Shield className="h-4 w-4 text-green-500" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Chamber</div>
            <div className="font-bold text-lg">{chamber}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Trigger</div>
            <div className="font-bold text-lg">{trigger}</div>
          </div>
        </div>

        <div
          className={`text-xs font-medium px-2 py-1 rounded ${
            isHit
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          {isHit ? "💥 BANG! Hit!" : "✅ Click! Safe"}
        </div>

        <div className="text-[10px] text-muted-foreground">1 in 6 chance</div>
      </div>
    </div>
  );
}
