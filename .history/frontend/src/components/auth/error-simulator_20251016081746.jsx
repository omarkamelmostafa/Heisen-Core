// // components/auth/error-simulator.jsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { Bug, TestTube } from "lucide-react";

// export function ErrorSimulator({ onTriggerError }) {
//   const handleTrigger = () => {
//     const result = onTriggerError();
//     if (result.triggered) {
//       console.log("🔧 Error triggered for testing:", result.error);
//     }
//   };

//   return (
//     <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 shadow-lg z-50">
//       <div className="text-center space-y-2">
//         <div className="flex items-center justify-center gap-1">
//           <TestTube className="h-4 w-4 text-blue-500" />
//           <span className="text-xs font-medium text-foreground">Test Mode</span>
//         </div>

//         <Button
//           onClick={handleTrigger}
//           size="sm"
//           variant="outline"
//           className="w-full h-8 text-xs"
//         >
//           <Bug className="h-3 w-3 mr-1" />
//           Simulate Error
//         </Button>

//         <p className="text-[10px] text-muted-foreground">Development only</p>
//       </div>
//     </div>
//   );
// }
// components/auth/error-simulator.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Target, Skull, Dice5, Shield } from "lucide-react";

export function ErrorSimulator({ onTriggerError, rouletteResult }) {
  const handleTrigger = () => {
    const result = onTriggerError();
    console.log(result);

    if (result.triggered) {
      // Explosion effect
      document.body.style.animation = "shake 0.5s";
      setTimeout(() => {
        document.body.style.animation = "";
      }, 500);

      alert(`🔫 BANG! ${result.error.message}`);
    } else {
      alert(`🎉 ${result.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-200 rounded-lg p-4 shadow-lg z-50">
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
