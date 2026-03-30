// components/auth/error-simulator.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Target, Skull, Dice5, Shield } from "lucide-react";

export function ErrorSimulator({ onTriggerError, rouletteResult }) {
  const handleTrigger = () => {
    const result = onTriggerError();

    if (result.triggered) {
      // Explosion effect
      document.body.style.animation = "shake 0.5s";
      setTimeout(() => {
        document.body.style.animation = "";
      }, 500);

      alert(`🔫 BANG! ${result.message}`);
    } else {
      alert(`🎉 ${result.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-200 rounded-lg p-4 shadow-lg z-50">
    // <div className="flex min-h-[100vh] items-center justify-center overflow-hidden">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-red-500" />
          <Skull className="h-5 w-5 text-red-500" />
          <Dice5 className="h-5 w-5 text-red-500" />
        </div>

        <h4 className="text-sm font-bold text-red-600">RUSSIAN ROULETTE</h4>

        {/* Live Status */}
        {rouletteResult && (
          <div className="text-xs bg-gray-50 p-2 rounded border">
            <p>
              Chamber: <strong>{rouletteResult.chamber}</strong>
            </p>
            <p>
              Trigger: <strong>{rouletteResult.trigger}</strong>
            </p>
            <p
              className={
                rouletteResult.isHit
                  ? "text-red-600 font-bold"
                  : "text-green-600"
              }
            >
              {rouletteResult.isHit ? "💥 HIT!" : "✅ SAFE"}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          1 in 6 chance of BOOM! 💥
        </p>

        <Button
          onClick={handleTrigger}
          size="sm"
          variant="destructive"
          className="w-full font-bold danger-pulse"
        >
          🎲 PULL TRIGGER
        </Button>

        <p className="text-[10px] text-muted-foreground">
          Auto-plays on page load! 🔥
        </p>
      </div>
    </div>
  );
}
// // components/auth/error-simulator.jsx
// "use client";

// import { Button } from "@/components/ui/button";

// export function ErrorSimulator({ onTriggerError }) {
//   const handleTrigger = () => {
//     const triggered = onTriggerError();
//     if (triggered) {
//       alert("💥 Boom! Error triggered!");
//     } else {
//       alert("✅ Lucky! No error this time.");
//     }
//   };

//   return (
//     <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg z-50">
//       <h4 className="text-sm font-medium mb-3">Error Roulette</h4>
//       <p className="text-xs text-muted-foreground mb-3">
//         1 in 6 chance of crash
//       </p>
//       <Button onClick={handleTrigger} size="sm" variant="outline">
//         🎲 Trigger Random Error
//       </Button>
//     </div>
//   );
// }
