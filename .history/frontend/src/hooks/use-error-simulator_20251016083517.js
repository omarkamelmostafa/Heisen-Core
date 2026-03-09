// hooks/use-error-simulator.js
import { useState, useEffect } from "react";

export function useErrorSimulator() {
  const [error, setError] = useState(null);

  // Russian Roulette on mount - 1 in 6 chance
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const shouldError = Math.floor(Math.random() * 6) === 0; // 1 in 6 chance

      if (shouldError) {
        setError({
          title: "Something Went Wrong",
          message:
            "Oops, something went wrong on our end. Please try again later.",
        });
        console.log("🎲 Russian Roulette: Error triggered on page load");
      }
    }
  }, []);

  const triggerError = () => {
    if (process.env.NODE_ENV === "development") {
      const errorData = {
        title: "Something Went Wrong",
        message:
          "Oops, something went wrong on our end. Please try again later.",
      };
      setError(errorData);
      return { triggered: true, error: errorData };
    }
    return { triggered: false, error: null };
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    triggerError,
    clearError,
    isDevelopment: process.env.NODE_ENV === "development",
  };
}

// // hooks/use-error-simulator.js
// import { useState, useEffect } from "react";

// // Fun error messages with emojis
// const ERROR_MESSAGES = [
//   // { emoji: "💥", message: "Boom! Component exploded!" },
//   // { emoji: "🔥", message: "Fire in the code! Everything is burning!" },
//   // { emoji: "🌪️", message: "Tornado of bugs swept through!" },
//   // { emoji: "🐛", message: "A wild bug appeared and crashed everything!" },
//   // { emoji: "⚡", message: "Zap! Electrical surge in the component!" },
//   // { emoji: "🚨", message: "Red alert! System meltdown!" },
//   // { emoji: "💣", message: "Tick... tick... BOOM! Code bomb detonated!" },
//   // { emoji: "🤯", message: "Mind blown! Component couldn't handle it!" },
//   // { emoji: "💀", message: "RIP Component. It lived a good life." },
//   // { emoji: "🎭", message: "Drama! Component had an existential crisis!" },
//   { emoji: "⛔", message: "Something went wrong, please try again!" },
//   { emoji: "⚠️", message: "We're sorry, an error occurred" },
// ];

// export function useErrorSimulator() {
//   const [errorTrigger, setErrorTrigger] = useState(null);
//   const [rouletteResult, setRouletteResult] = useState(null);

//   // 🎲 RUSSIAN ROULETTE on every mount/refresh
//   useEffect(() => {
//     if (process.env.NODE_ENV === "development") {
//       const bulletChamber = Math.floor(Math.random() * 6) + 1; // 1-6
//       const pullTrigger = Math.floor(Math.random() * 6) + 1; // 1-6

//       const result = {
//         chamber: bulletChamber,
//         trigger: pullTrigger,
//         // isHit: bulletChamber === pullTrigger,
//         isHit: false,
//       };

//       setRouletteResult(result);

//       if (result.isHit) {
//         // BANG! Error time!
//         const randomError =
//           ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
//         setErrorTrigger(randomError);

//         console.log(
//           `🔫 Russian Roulette: Chamber ${bulletChamber}, Trigger ${pullTrigger} - ${randomError.emoji} ${randomError.message}`
//         );
//       } else {
//         console.log(
//           `✅ Russian Roulette: Chamber ${bulletChamber}, Trigger ${pullTrigger} - Click! (Safe this time)`
//         );
//       }
//     }
//   }, []); // Empty dependency array = runs on every mount

//   const triggerManualError = () => {
//     if (process.env.NODE_ENV === "development") {
//       const bulletChamber = Math.floor(Math.random() * 6) + 1;
//       const pullTrigger = Math.floor(Math.random() * 6) + 1;

//       const result = {
//         chamber: bulletChamber,
//         trigger: pullTrigger,
//         isHit: bulletChamber === pullTrigger,
//       };

//       setRouletteResult(result);

//       if (result.isHit) {
//         const randomError =
//           ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
//         setErrorTrigger(randomError);
//         return {
//           triggered: true,
//           message: `${randomError.emoji} ${randomError.message}`,
//           result,
//         };
//       } else {
//         return {
//           triggered: false,
//           message: `✅ Click! Chamber ${bulletChamber} was safe!`,
//           result,
//         };
//       }
//     }
//     return { triggered: false, message: "Only works in development!" };
//   };

//   const clearError = () => {
//     setErrorTrigger(null);
//     setRouletteResult(null);
//   };

//   return {
//     errorTrigger,
//     rouletteResult,
//     triggerManualError,
//     clearError,
//   };
// }
