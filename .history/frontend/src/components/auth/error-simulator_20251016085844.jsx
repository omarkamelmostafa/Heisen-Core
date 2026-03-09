// components/auth/error-simulator.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Bug, RotateCcw } from "lucide-react";

export function ErrorSimulator({ onTriggerError, rouletteStatus }) {
  const handleTrigger = async () => {
    const result = await onTriggerError();

    if (result.triggered) {
      console.log("🔧 Error triggered for testing");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 shadow-lg z-50">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-1">
          <Bug className="h-3 w-3 text-orange-500" />
          <span className="text-xs font-medium">Test Mode</span>
        </div>

        <Button
          onClick={handleTrigger}
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs"
          disabled={rouletteStatus?.isSpinning}
        >
          {rouletteStatus?.isSpinning ? (
            <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Bug className="h-3 w-3 mr-1" />
          )}
          {rouletteStatus?.isSpinning ? "Spinning..." : "Pull Trigger"}
        </Button>

        <p className="text-[10px] text-muted-foreground">Dev: 1 in 6 chance</p>
      </div>
    </div>
  );
}
// // components/auth/error-simulator.jsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { Bug } from "lucide-react";

// export function ErrorSimulator({ onTriggerError }) {
//   const handleTrigger = () => {
//     const result = onTriggerError();

//     if (result.triggered) {
//       console.log("🔧 Error triggered for testing");
//     }
//   };

//   return (
//     <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 shadow-lg z-50">
//       <div className="text-center space-y-2">
//         <Button
//           onClick={handleTrigger}
//           size="sm"
//           variant="outline"
//           className="w-full h-8 text-xs"
//         >
//           <Bug className="h-3 w-3 mr-1" />
//           Simulate Error
//         </Button>
//         <p className="text-[10px] text-muted-foreground">Dev Mode</p>
//       </div>
//     </div>
//   );
// }
