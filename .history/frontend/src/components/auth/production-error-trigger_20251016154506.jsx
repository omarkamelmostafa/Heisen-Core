// // components/auth/russian-roulette-wrapper.jsx
// "use client";

// import { useErrorSimulator } from "@/hooks/use-error-simulator";
// import { ErrorBoundary } from "./error-boundary";
// import { ErrorSimulator } from "./error-simulator";
// import { RouletteStatus } from "./roulette-status";

// const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === "development";

// export function RussianRouletteWrapper({ children }) {
//   // This hook ONLY runs in development
//   const { error, rouletteStatus, triggerError, clearError } =
//     useErrorSimulator();

//   console.log("🔧 RussianRouletteWrapper - Development:", isDevelopment);
//   console.log("🔧 Current error state:", error);
//   console.log("🔧 Roulette status:", rouletteStatus);

//   // In production: just render children, no simulation
//   if (!isDevelopment) {
//     return children;
//   }

//   // Development-only: Show loading during roulette spin
//   if (rouletteStatus.isSpinning) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="text-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="text-muted-foreground">Spinning the chamber...</p>
//         </div>
//       </div>
//     );
//   }

//   // Development-only: Show error boundary if Russian Roulette hit
//   if (error) {
//     console.log("🔧 Showing error boundary for simulation error");
//     return (
//       <>
//         <ErrorBoundary
//           error={error}
//           reset={clearError}
//           rouletteResult={rouletteStatus.isHit ? rouletteStatus : null}
//         />
//         <ErrorSimulator
//           onTriggerError={triggerError}
//           rouletteStatus={rouletteStatus}
//         />
//       </>
//     );
//   }

//   // Development-only: Normal page content with dev tools
//   console.log("🔧 Rendering normal content with dev tools");
//   return (
//     <>
//       <RouletteStatus rouletteStatus={rouletteStatus} />
//       {children}
//       <ErrorSimulator
//         onTriggerError={triggerError}
//         rouletteStatus={rouletteStatus}
//       />
//     </>
//   );
// }
// // components/auth/production-error-trigger.jsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { AlertTriangle, Link } from "lucide-react";
// import { useSearchParams } from "next/navigation";
// import { useEffect } from "react";

// export function ProductionErrorTrigger() {
//   const searchParams = useSearchParams();

//   // Handle URL-triggered errors
//   useEffect(() => {
//     const triggerError = searchParams.get("test_error");

//     if (triggerError === "boundary") {
//       throw new Error("Production error boundary test triggered via URL");
//     }

//     if (triggerError === "runtime") {
//       throw new Error("URL-triggered runtime error in production");
//     }

//     if (triggerError === "undefined") {
//       // This will cause a runtime error
//       const obj = undefined;
//       console.log(obj.nonExistentProperty);
//     }
//   }, [searchParams]);

//   // Handle button-triggered errors
//   const triggerRealError = () => {
//     throw new Error("Real production runtime error - component failure");
//   };

//   const triggerTypeError = () => {
//     // This will cause a TypeError
//     const nullObject = null;
//     nullObject.someMethod();
//   };

//   const triggerReferenceError = () => {
//     // This will cause a ReferenceError
//     someUndefinedFunction();
//   };

//   return (
//     <div className="fixed bottom-4 left-4 bg-card border border-red-500 rounded-lg p-3 shadow-lg z-50">
//       <div className="text-center space-y-2">
//         <div className="flex items-center justify-center gap-1">
//           <AlertTriangle className="h-3 w-3 text-red-500" />
//           <span className="text-xs font-medium">Prod Error Test</span>
//         </div>

//         <Button
//           onClick={triggerRealError}
//           size="sm"
//           variant="destructive"
//           className="w-full h-8 text-xs"
//         >
//           Runtime Error
//         </Button>

//         <div className="flex gap-1">
//           <Button
//             onClick={triggerTypeError}
//             size="sm"
//             variant="outline"
//             className="flex-1 h-7 text-xs"
//           >
//             TypeError
//           </Button>
//           <Button
//             onClick={triggerReferenceError}
//             size="sm"
//             variant="outline"
//             className="flex-1 h-7 text-xs"
//           >
//             RefError
//           </Button>
//         </div>

//         <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
//           <Link className="h-3 w-3" />
//           <span>URL: ?test_error=boundary</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Test Real Errors in Production:
// // Via URL Parameters:
// // https://yourapp.com/login?test_error=boundary
// // https://yourapp.com/login?test_error=runtime
// // https://yourapp.com/login?test_error=undefined
