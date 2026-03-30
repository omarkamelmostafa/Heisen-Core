
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
