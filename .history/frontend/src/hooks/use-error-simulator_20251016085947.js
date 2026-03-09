// // hooks/use-error-simulator.js
// import { useState, useEffect } from "react";

// export function useErrorSimulator() {
//   const [error, setError] = useState(null);

//   // Russian Roulette on mount - 1 in 6 chance
//   useEffect(() => {
//     if (process.env.NODE_ENV === "development") {
//       const shouldError = Math.floor(Math.random() * 6) === 0; // 1 in 6 chance

//       if (shouldError) {
//         setError({
//           title: "Something Went Wrong",
//           message:
//             "Oops, something went wrong on our end. Please try again later.",
//         });
//         console.log("🎲 Russian Roulette: Error triggered on page load");
//       }
//     }
//   }, []);

//   const triggerError = () => {
//     if (process.env.NODE_ENV === "development") {
//       const errorData = {
//         title: "Something Went Wrong",
//         message:
//           "Oops, something went wrong on our end. Please try again later.",
//       };
//       setError(errorData);
//       return { triggered: true, error: errorData };
//     }
//     return { triggered: false, error: null };
//   };

//   const clearError = () => {
//     setError(null);
//   };

//   return {
//     error,
//     triggerError,
//     clearError,
//     isDevelopment: process.env.NODE_ENV === "development",
//   };
// }
