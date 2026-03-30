// hooks/use-error-simulator.js
import { useState, useEffect } from "react";

export function useErrorSimulator() {
  const [error, setError] = useState(null);
  const [rouletteStatus, setRouletteStatus] = useState({
    isSpinning: false,
    chamber: null,
    trigger: null,
    isHit: false,
  });

  // Russian Roulette on mount with delay
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_ENV === "development") {
      const runRoulette = async () => {
        setRouletteStatus({
          isSpinning: true,
          chamber: null,
          trigger: null,
          isHit: false,
        });

        // Simulate spinning delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const chamber = Math.floor(Math.random() * 6) + 1;
        const trigger = Math.floor(Math.random() * 6) + 1;
        const isHit = chamber === trigger;

        setRouletteStatus({ isSpinning: false, chamber, trigger, isHit });

        if (isHit) {
          setError({
            title: "Something Went Wrong",
            message:
              "Oops, something went wrong on our end. Please try again later.",
          });
          console.log(
            "🎲 Russian Roulette: BANG! Chamber",
            chamber,
            "Trigger",
            trigger
          );
        } else {
          console.log(
            "🎲 Russian Roulette: Click! Chamber",
            chamber,
            "Trigger",
            trigger,
            "- Safe!"
          );
        }
      };

      runRoulette();
    }
  }, []);

  const triggerError = async () => {
    if (process.env.NEXT_PUBLIC_APP_ENV === "development") {
      setRouletteStatus({
        isSpinning: true,
        chamber: null,
        trigger: null,
        isHit: false,
      });

      // Simulate spinning delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const chamber = Math.floor(Math.random() * 6) + 1;
      const trigger = Math.floor(Math.random() * 6) + 1;
      const isHit = chamber === trigger;

      setRouletteStatus({ isSpinning: false, chamber, trigger, isHit });

      if (isHit) {
        const errorData = {
          title: "Something Went Wrong",
          message:
            "Oops, something went wrong on our end. Please try again later.",
        };
        setError(errorData);
        return { triggered: true, error: errorData, chamber, trigger };
      }

      return { triggered: false, error: null, chamber, trigger };
    }
    return { triggered: false, error: null };
  };

  const clearError = () => {
    setError(null);
    setRouletteStatus({
      isSpinning: false,
      chamber: null,
      trigger: null,
      isHit: false,
    });
  };

  return {
    error,
    rouletteStatus,
    triggerError,
    clearError,
    isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === "development",
  };
}




// // hooks/use-error-simulator.js
// import { useState, useEffect } from "react";

// export function useErrorSimulator() {
//   const [error, setError] = useState(null);

//   // Russian Roulette on mount - 1 in 6 chance
//   useEffect(() => {
//     if (process.env.NEXT_PUBLIC_APP_ENV === "development") {
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
//     if (process.env.NEXT_PUBLIC_APP_ENV === "development") {
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
//     isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === "development",
//   };
// }
