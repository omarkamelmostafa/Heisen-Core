// frontend/src/components/auth/reset-password/password-match-indicator.jsx
// import { motion } from "framer-motion";
// import { useResetPasswordContent } from "@/lib/config/auth-content";

// export function PasswordMatchIndicator({ password, confirmPassword }) {
//   const content = useResetPasswordContent();

//   if (!confirmPassword) return null;

//   const isMatch = password === confirmPassword;
//   const color = isMatch ? "text-emerald-600" : "text-red-600";
//   const message = isMatch
//     ? content.indicators.match.match
//     : content.indicators.match.noMatch;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className={`text-xs ${color}`}
//     >
//       {message}
//     </motion.div>
//   );
// }
