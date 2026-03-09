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
 