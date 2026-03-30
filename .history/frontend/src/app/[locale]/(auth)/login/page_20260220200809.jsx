// frontend/src/app/(auth)/login/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/store/slices/auth/auth-selectors";
import { LoginHeader } from "@/components/auth/login/login-header";
import { WelcomeSection } from "@/components/auth/login/welcome-section";
import { LoginForm } from "@/components/auth/login/login-form";
import { Divider } from "@/components/auth/login/divider";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { AuthErrorAlert } from "@/components/auth/forms/auth-error-alert";
import { loginSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import LoginLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isLoadingPage = useSimulatedLoading(0);

  // Redirect on successful login
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = searchParams.get("returnUrl") || "/";
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  // Clear any stale error when component mounts
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleLoginSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      // Success handled by useEffect redirect above
    } catch (error) {
      // Error is stored in Redux state and displayed below
      console.error("Login error:", error);
    }
  };

  if (isLoadingPage) {
    return <LoginLoading />;
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
            // className="flex h-full w-full flex-col gap-6 sm:max-w-lg"
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
              onSubmit={handleLoginSubmit}
              className="space-y-6"
            >
              <Divider variants={itemVariants} />

              <AuthErrorAlert />

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
    </>
  );
}

// // app/(auth)/login/page.jsx
// "use client";

// import { useLoginForm } from "@/hooks/auth/login/use-login-form";
// import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
// import { LoginHeader } from "@/components/auth/login/login-header";
// import { WelcomeSection } from "@/components/auth/login/welcome-section";
// import { LoginForm } from "@/components/auth/login/login-form";
// import { AuthProviders } from "@/components/auth/providers/auth-providers";
// import { Divider } from "@/components/auth/login/divider";
// import {
//   motionProps,
//   containerVariants,
//   itemVariants,
// } from "@/lib/animations/auth/authAnimations";
// import { motion } from "framer-motion";
// import LoginLoading from "./loading";
// import { Suspense } from "react";
// import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
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
