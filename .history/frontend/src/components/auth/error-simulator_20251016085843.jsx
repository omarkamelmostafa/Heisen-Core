
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
