// components/auth/russian-roulette-wrapper.jsx
"use client";

import { useErrorSimulator } from "@/hooks/use-error-simulator";
import { ErrorBoundary } from "./error-boundary";
import { ErrorSimulator } from "./error-simulator";
import { RouletteStatus } from "./roulette-status";
import { isDevelopment, isProduction } from "@/lib/environment";

export function RussianRouletteWrapper({ children }) {
  // Early return for production - no simulation
  if (!isDevelopment &&) {
    return children;
  }

  const { error, rouletteStatus, triggerError, clearError } =
    useErrorSimulator();

  // Development simulation logic
  if (rouletteStatus.isSpinning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-muted-foreground">Spinning the chamber...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <ErrorBoundary
          error={error}
          reset={clearError}
          rouletteResult={rouletteStatus}
        />
        <ErrorSimulator
          onTriggerError={triggerError}
          rouletteStatus={rouletteStatus}
        />
      </>
    );
  }

  return (
    <>
      <RouletteStatus rouletteStatus={rouletteStatus} />
      {children}
      <ErrorSimulator
        onTriggerError={triggerError}
        rouletteStatus={rouletteStatus}
      />
    </>
  );
}

// // components/auth/russian-roulette-wrapper.jsx
// "use client";

// import { useErrorSimulator } from "@/hooks/use-error-simulator";
// import { ErrorBoundary } from "./error-boundary";
// import { ErrorSimulator } from "./error-simulator";
// import { RouletteStatus } from "./roulette-status";

// export function RussianRouletteWrapper({ children }) {
//   const { error, rouletteStatus, triggerError, clearError, isDevelopment } =
//     useErrorSimulator();

//   // Show loading during roulette spin
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

//   // Show error boundary if Russian Roulette hit
//   if (error) {
//     return (
//       <>
//         <ErrorBoundary error={error} reset={clearError} />
//         {isDevelopment && (
//           <ErrorSimulator
//             onTriggerError={triggerError}
//             rouletteStatus={rouletteStatus}
//           />
//         )}
//       </>
//     );
//   }

//   // Normal page content with status badge
//   return (
//     <>
//       {isDevelopment && rouletteStatus.chamber && (
//         <RouletteStatus rouletteStatus={rouletteStatus} />
//       )}
//       {children}
//       {isDevelopment && (
//         <ErrorSimulator
//           onTriggerError={triggerError}
//           rouletteStatus={rouletteStatus}
//         />
//       )}
//     </>
//   );
// }
// // components/auth/russian-roulette-wrapper.jsx
// "use client";

// import { useErrorSimulator } from "@/hooks/use-error-simulator";
// import { ErrorBoundary } from "./error-boundary";
// import { ErrorSimulator } from "./error-simulator";

// export function RussianRouletteWrapper({ children }) {
//   const { error, triggerError, clearError, isDevelopment } =
//     useErrorSimulator();

//   // Clean conditional rendering - show error or children
//   if (error) {
//     return (
//       <>
//         <ErrorBoundary error={error} reset={clearError} />
//         {isDevelopment && <ErrorSimulator onTriggerError={triggerError} />}
//       </>
//     );
//   }

//   // Normal page content
//   return (
//     <>
//       {children}
//       {isDevelopment && <ErrorSimulator onTriggerError={triggerError} />}
//     </>
//   );
// }
