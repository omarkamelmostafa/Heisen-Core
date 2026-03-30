// components/auth/russian-roulette-wrapper.jsx
"use client";

import { useErrorSimulator } from "@/hooks/use-error-simulator";
import { ErrorBoundary } from "./error-boundary";
import { ErrorSimulator } from "./error-simulator";

export function RussianRouletteWrapper({ children }) {
  const { errorTrigger, triggerManualError, clearError, isDevelopment } =
    useErrorSimulator();

  // Show error boundary if there's an error
  if (errorTrigger) {
    return (
      <>
        <ErrorBoundary
          error={new Error("Simulated Error")}
          reset={clearError}
          customMessage={errorTrigger}
        />
        {isDevelopment && (
          <ErrorSimulator onTriggerError={triggerManualError} />
        )}
      </>
    );
  }

  return (
    <>
      {children}
      {isDevelopment && <ErrorSimulator onTriggerError={triggerManualError} />}
    </>
  );
}
// // components/auth/russian-roulette-wrapper.jsx
// "use client";

// import { useErrorSimulator } from "@/hooks/use-error-simulator";
// import { ErrorBoundary } from "./error-boundary";
// import { ErrorSimulator } from "./error-simulator";

// export function RussianRouletteWrapper({ children }) {
//   const { errorTrigger, rouletteResult, triggerManualError, clearError } =
//     useErrorSimulator();

//   // Show error boundary if Russian roulette hit
//   if (errorTrigger) {
//     return (
//       <>
//         <ErrorBoundary
//           error={new Error("Russian Roulette Crash")}
//           reset={clearError}
//           customMessage={errorTrigger}
//           rouletteResult={rouletteResult}
//         />
//         <ErrorSimulator
//           onTriggerError={triggerManualError}
//           rouletteResult={rouletteResult}
//         />
//       </>
//     );
//   }

//   return (
//     <>
//       {/* Roulette Status Indicator */}
//       <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-300 rounded px-3 py-1 text-xs z-40">
//         🎲 Russian Roulette: Active
//       </div>

//       {children}

//       {/* Error Simulator */}
//       {process.env.NODE_ENV === "development" && (
//         <ErrorSimulator
//           onTriggerError={triggerManualError}
//           rouletteResult={rouletteResult}
//         />
//       )}
//     </>
//   );
// }
