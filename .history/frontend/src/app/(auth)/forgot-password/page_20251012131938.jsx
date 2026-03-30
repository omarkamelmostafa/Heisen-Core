// app/(auth)/forgot-password/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "@/components/auth/form-field";
import {
  motionProps,
  containerVariants,
  itemVariants,
  successVariants,
  iconVariants,
  quickFadeInVariants,
} from "@/lib/animations/auth/authAnimations";
import {
  AuthSubmitButtons,
  useAuthSubmitState,
} from "@/components/auth/auth-submit-button";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const {
    showSuccess,
    startLoading,
    showSuccess: showSuccessState,
  } = useAuthSubmitState();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 2000);
  }

  return (
    <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
      <div className="flex w-full flex-col gap-6 sm:max-w-lg">
        {/* Header with Logo */}
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xl font-semibold">Fantasy Coach</span>
        </div>

        <AnimatePresence mode="wait">
          {!emailSent ? (
            <motion.div
              key="form"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
            >
              {/* Header Section */}
              <motion.div variants={itemVariants}>
                <h2 className="mb-1.5 text-2xl font-semibold">
                  Reset Your Password
                </h2>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </motion.div>

              {/* Reset Password Form */}
              <motion.div variants={itemVariants} className="space-y-4">
                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Email Field */}
                  <FormField
                    name="userEmail"
                    type="email"
                    label="Email address"
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {/* Help Text */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={quickFadeInVariants}
                    className="bg-muted rounded-lg p-3 text-sm"
                  >
                    <p className="text-muted-foreground">
                      We'll send a secure reset link to your email. The link
                      will expire in 1 hour for security.
                    </p>
                  </motion.div>

                  {/* Submit Button */}
                  {/* <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                  </Button> */}
                  <AuthSubmitButtons.ForgotPassword
                    isLoading={isLoading}
                    email={email}
                  />
                </form>

                {/* Back to Login Link */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={quickFadeInVariants}
                  className="text-center"
                >
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Login
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial="hidden"
              animate="visible"
              variants={successVariants}
              className="text-center space-y-6"
            >
              {/* Success State */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={iconVariants}
                className="flex justify-center"
              >
                <CheckCircle className="h-16 w-16 text-emerald-500" />
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={quickFadeInVariants}
                className="space-y-3"
              >
                <h2 className="text-2xl font-semibold">Check Your Email!</h2>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Click the link in the email to create a new password.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={quickFadeInVariants}
                className="space-y-4"
              >
                <div className="bg-muted rounded-lg p-4 text-sm">
                  <p className="font-medium text-foreground">
                    Didn't receive the email?
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email address</li>
                    <li>• Wait a few minutes and try again</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Try Another Email
                  </Button>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// // app/(auth)/forgot-password/page.jsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
// import { Logo } from "@/components/ui/logo";
// import { motion, AnimatePresence } from "framer-motion";

// export default function ForgotPasswordPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [emailSent, setEmailSent] = useState(false);
//   const [email, setEmail] = useState("");

//   async function onSubmit(event) {
//     event.preventDefault();
//     setIsLoading(true);

//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false);
//       setEmailSent(true);
//     }, 2000);
//   }

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         ease: "easeOut",
//       },
//     },
//     exit: {
//       opacity: 0,
//       y: -20,
//       transition: {
//         duration: 0.4,
//         ease: "easeIn",
//       },
//     },
//   };

//   const successVariants = {
//     hidden: {
//       opacity: 0,
//       y: 20,
//     },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         ease: "easeOut",
//         delay: 0.2,
//       },
//     },
//   };

//   return (
//     <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
//       <div className="flex w-full flex-col gap-6 sm:max-w-lg">
//         {/* Header with Logo */}
//         <div className="flex items-center gap-3">
//           <Logo />
//           <span className="text-xl font-semibold">Fantasy Coach</span>
//         </div>

//         <AnimatePresence mode="wait">
//           {!emailSent ? (
//             <motion.div
//               key="form"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//             >
//               {/* Header Section */}
//               <motion.div variants={itemVariants}>
//                 <h2 className="mb-1.5 text-2xl font-semibold">
//                   Reset Your Password
//                 </h2>
//                 <p className="text-muted-foreground">
//                   Enter your email address and we'll send you a link to reset
//                   your password.
//                 </p>
//               </motion.div>

//               {/* Reset Password Form */}
//               <motion.div variants={itemVariants} className="space-y-4">
//                 <form onSubmit={onSubmit} className="space-y-4">
//                   {/* Email Field */}
//                   <div className="space-y-2">
//                     <Label htmlFor="userEmail" className="text-sm font-medium">
//                       Email address*
//                     </Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="userEmail"
//                         type="email"
//                         placeholder="Enter your email address"
//                         required
//                         disabled={isLoading}
//                         className="w-full pl-10"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                       />
//                     </div>
//                   </div>

//                   {/* Help Text */}
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2 }}
//                     className="bg-muted rounded-lg p-3 text-sm"
//                   >
//                     <p className="text-muted-foreground">
//                       We'll send a secure reset link to your email. The link
//                       will expire in 1 hour for security.
//                     </p>
//                   </motion.div>

//                   {/* Submit Button */}
//                   <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
//                   </Button>
//                 </form>

//                 {/* Back to Login Link */}
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ delay: 0.3 }}
//                   className="text-center"
//                 >
//                   <Link
//                     href="/login"
//                     className="inline-flex items-center text-sm text-primary hover:underline"
//                   >
//                     <ArrowLeft className="h-4 w-4 mr-1" />
//                     Back to Login
//                   </Link>
//                 </motion.div>
//               </motion.div>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="success"
//               variants={successVariants}
//               initial="hidden"
//               animate="visible"
//               className="text-center space-y-6"
//             >
//               {/* Success State */}
//               <motion.div
//                 initial={{ scale: 0.5, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
//                 className="flex justify-center"
//               >
//                 <CheckCircle className="h-16 w-16 text-emerald-500" />
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.5 }}
//                 className="space-y-3"
//               >
//                 <h2 className="text-2xl font-semibold">Check Your Email!</h2>
//                 <p className="text-muted-foreground">
//                   We've sent a password reset link to <strong>{email}</strong>.
//                   Click the link in the email to create a new password.
//                 </p>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.7 }}
//                 className="space-y-4"
//               >
//                 <div className="bg-muted rounded-lg p-4 text-sm">
//                   <p className="font-medium text-foreground">
//                     Didn't receive the email?
//                   </p>
//                   <ul className="mt-2 space-y-1 text-muted-foreground">
//                     <li>• Check your spam or junk folder</li>
//                     <li>• Make sure you entered the correct email address</li>
//                     <li>• Wait a few minutes and try again</li>
//                   </ul>
//                 </div>

//                 <div className="flex flex-col gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => setEmailSent(false)}
//                     className="w-full"
//                   >
//                     Try Another Email
//                   </Button>
//                   <Link href="/login" className="w-full">
//                     <Button variant="ghost" className="w-full">
//                       <ArrowLeft className="h-4 w-4 mr-2" />
//                       Back to Login
//                     </Button>
//                   </Link>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }
