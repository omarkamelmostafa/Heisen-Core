// frontend/src/app/(auth)/login/page.jsx
"use client";

import { useState } from "react";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginHeader } from "@/features/auth/components/login/login-header";
import { WelcomeSection } from "@/features/auth/components/login/welcome-section";
import { LoginForm } from "@/features/auth/components/login/login-form";
import { Divider } from "@/features/auth/components/login/divider";
import { AuthFormProvider } from "@/features/auth/components/forms/auth-form-provider";
import { AuthErrorAlert } from "@/features/auth/components/forms/auth-error-alert";
import { loginSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import LoginLoading from "./loading";
import { ProductionErrorTrigger } from "@/features/auth/components/error/production-error-trigger";
import { PublicGuard } from "@/features/auth/components/guards/public-guard";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    isLoading,
    error,
    handleLogin,
    isVerified,
    isReset,
  } = useLogin();

  const isLoadingPage = useSimulatedLoading(0);
  
  if (isLoadingPage) {
    return <LoginLoading />;
  }

  return (
    <PublicGuard>
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
            <LoginHeader variants={itemVariants} />
            <WelcomeSection variants={itemVariants} />

            <AuthFormProvider
              schema={loginSchema}
              defaultValues={{
                email: "",
                password: "",
                rememberMe: false,
              }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <Divider variants={itemVariants} />

              {isVerified && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200">
                  Your email has been verified. You can now log in.
                </div>
              )}
              {isReset && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200">
                  Your password has been successfully reset. Please log in.
                </div>
              )}

              <AuthErrorAlert error={error} />

              <LoginForm
                variants={itemVariants}
                showPassword={showPassword}
                isLoading={isLoading}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
              />
            </AuthFormProvider>
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </PublicGuard>
  );
}

// // app/(auth)/login/page.jsx
// "use client";

// import { useLoginForm } from "@/hooks/auth/login/use-login-form";
// import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
// import { LoginHeader } from "@/features/auth/components/login/login-header";
// import { WelcomeSection } from "@/features/auth/components/login/welcome-section";
// import { LoginForm } from "@/features/auth/components/login/login-form";
// import { AuthProviders } from "@/features/auth/components/providers/auth-providers";
// import { Divider } from "@/features/auth/components/login/divider";
// import {
//   motionProps,
//   containerVariants,
//   itemVariants,
// } from "@/lib/animations/auth/authAnimations";
// import { motion } from "framer-motion";
// import LoginLoading from "./loading";
// import { Suspense } from "react";
// import { ProductionErrorTrigger } from "@/features/auth/components/error/production-error-trigger";
// import { AuthLayoutWrapper } from "../auth-layout-wrapper";

// export default function LoginPage() {
//   const {
//     showPassword,
//     isLoading,
//     formData,
//     setShowPassword,
//     handleChange,
//     handleSubmit,
//   } = useLoginForm();

//   const isLoadingPage = useSimulatedLoading(0);

//   if (isLoadingPage) {
//     return <LoginLoading />;
//   }

//   return (
//     <>
//       <div className="flex min-h-[100vh] items-center justify-center overflow-hidden">
//         <motion.div
//           {...motionProps.page}
//           className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8"
//         >
//           <motion.div
//             initial="hidden"
//             animate="visible"
//             variants={containerVariants}
//             className="flex h-full w-full flex-col gap-6 sm:max-w-lg"
//           >
//             <LoginHeader variants={itemVariants} />

//             <WelcomeSection variants={itemVariants} />

//             <AuthProviders
//               providers={["google", "facebook"]}
//               disabledProviders={["google", "facebook"]}
//               context="login"
//               layout="horizontal"
//               variants={itemVariants}
//             />

//             <Divider variants={itemVariants} />

//             <LoginForm
//               variants={itemVariants}
//               showPassword={showPassword}
//               isLoading={isLoading}
//               formData={formData}
//               onTogglePassword={() => setShowPassword(!showPassword)}
//               onChange={handleChange}
//               onSubmit={handleSubmit}
//             />
//           </motion.div>
//         </motion.div>
//       </div>
//       {/* Show production error trigger only in production */}
//       <ProductionErrorTrigger />
//     </>
//   );
// }
