// frontend/src/app/(auth)/forgot-password/page.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ForgotPasswordHeader } from "@/components/auth/forgot-password/forgot-password-header";
import { FormState } from "@/components/auth/forgot-password/form-state";
import { SuccessState } from "@/components/auth/forgot-password/success-state";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { forgotPasswordSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
} from "@/lib/animations/auth/authAnimations";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import ForgotPasswordLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const isLoadingPage = useSimulatedLoading(0);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log("Forgot password data:", data);
      // Your API call here
      // await sendPasswordResetEmail(data.userEmail);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      setSubmittedEmail(data.userEmail);
      setIsSuccess(true);
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnotherEmail = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
  };

  if (isLoadingPage) {
    return <ForgotPasswordLoading />;
  }

  return (
    <>
      <div className="flex min-h-[100vh] items-center justify-center overflow-hidden">
        <motion.div
          {...motionProps.page}
          className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex w-full flex-col gap-6 sm:max-w-lg"
          >
            <ForgotPasswordHeader />

            {!isSuccess ? (
              <AuthFormProvider
                schema={forgotPasswordSchema}
                defaultValues={{
                  userEmail: "",
                }}
                onSubmit={handleSubmit}
                mode="onTouched"
                reValidateMode="onChange"
              >
                <FormState isLoading={isLoading} />
              </AuthFormProvider>
            ) : (
              <SuccessState
                email={submittedEmail}
                onTryAnotherEmail={handleTryAnotherEmail}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </>
  );
}

// // app/(auth)/forgot-password/page.jsx
// "use client";

// import { useForgotPassword } from "@/hooks/auth/forgot-password/use-forgot-password";
// import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
// import { ForgotPasswordHeader } from "@/components/auth/forgot-password/forgot-password-header";
// import { FormState } from "@/components/auth/forgot-password/form-state";
// import { SuccessState } from "@/components/auth/forgot-password/success-state";
// import { AnimatePresence } from "framer-motion";
// import ForgotPasswordLoading from "./loading";
// import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";

// export default function ForgotPasswordPage() {
//   const { isLoading, emailSent, email, setEmail, handleSubmit, resetForm } =
//     useForgotPassword();

//   const isLoadingPage = useSimulatedLoading(0);

//   if (isLoadingPage) {
//     return <ForgotPasswordLoading />;
//   }

//   return (
//     <>
//       <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
//         <div className="flex w-full flex-col gap-6 sm:max-w-lg">
//           <ForgotPasswordHeader />

//           <AnimatePresence mode="wait">
//             {!emailSent ? (
//               <FormState
//                 isLoading={isLoading}
//                 email={email}
//                 onEmailChange={(e) => setEmail(e.target.value)}
//                 onSubmit={handleSubmit}
//               />
//             ) : (
//               <SuccessState email={email} onTryAnotherEmail={resetForm} />
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//       {/* Show production error trigger only in production */}
//       <ProductionErrorTrigger />
//     </>
//   );
// }
