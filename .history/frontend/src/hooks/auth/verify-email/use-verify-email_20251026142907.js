// // frontend/src/hooks/auth/verify-email/use-verify-email.js
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// export function useVerifyEmail() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [code, setCode] = useState(["", "", "", "", "", ""]);
//   const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
//   const router = useRouter();

//   // Countdown timer
//   useEffect(() => {
//     if (timeLeft > 0 && !isVerified) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [timeLeft, isVerified]);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setIsLoading(true);

//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false);
//       setIsVerified(true);

//       // Navigate to home after successful verification
//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//     }, 2000);
//   };

//   const resendCode = () => {
//     setTimeLeft(300); // Reset to 5 minutes
//     // Simulate resend code API call
//   };

//   return {
//     isLoading,
//     isVerified,
//     code,
//     timeLeft,
//     setCode,
//     setIsVerified,
//     handleSubmit,
//     resendCode,
//     formatTime,
//   };
// }
