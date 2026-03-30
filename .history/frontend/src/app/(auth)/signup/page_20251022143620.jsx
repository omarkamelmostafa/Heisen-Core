// app/(auth)/signup/page.jsx
"use client";

import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { SignupHeader } from "@/components/auth/signup/signup-header";
import { WelcomeSection } from "@/components/auth/signup/welcome-section";
import { SignupForm } from "@/components/auth/signup/signup-form";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { signupSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import SignupLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
import { useState } from "react";
import { SuppressConsoleErrors } from "@/components/utils/suppress-console-errors";

export default function SignupPage() {
  const [passwordStates, setPasswordStates] = useState({
    showPassword: false,
    showConfirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isLoadingPage = useSimulatedLoading(0);

  const handleSignupSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log("Signup data:", data);
      // Your API call here
      // await signupUser(data);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      // Success handling
      console.log("Signup successful!");
    } catch (error) {
      console.error("Signup error:", error);
      // Error handling - you can add toast notifications here
    } finally {
      setIsLoading(false);
    }
  };

  // Proper toggle functions that maintain state
  const togglePassword = () => {
    setPasswordStates((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  const toggleConfirmPassword = () => {
    setPasswordStates((prev) => ({
      ...prev,
      showConfirmPassword: !prev.showConfirmPassword,
    }));
  };

  if (isLoadingPage) {
    return <SignupLoading />;
  }

  return (
    <>
      <SuppressConsoleErrors />
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
            <SignupHeader variants={itemVariants} />

            <WelcomeSection variants={itemVariants} />

            <AuthFormProvider
              schema={signupSchema}
              defaultValues={{
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                terms: false,
              }}
              onSubmit={handleSignupSubmit}
              className="space-y-6"
            >
              <SignupForm
                variants={itemVariants}
                showPassword={passwordStates.showPassword}
                showConfirmPassword={passwordStates.showConfirmPassword}
                isLoading={isLoading}
                onTogglePassword={togglePassword}
                onToggleConfirmPassword={toggleConfirmPassword}
              />
            </AuthFormProvider>
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </>
  );
}

// // app/(auth)/signup/page.jsx
// "use client";

// import { useSignupForm } from "@/hooks/auth/signup/use-signup-form";
// import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
// import { SignupHeader } from "@/components/auth/signup/signup-header";
// import { WelcomeSection } from "@/components/auth/signup/welcome-section";
// import { SignupForm } from "@/components/auth/signup/signup-form";
// import {
//   motionProps,
//   containerVariants,
//   itemVariants,
// } from "@/lib/animations/auth/authAnimations";
// import { motion } from "framer-motion";
// import SignupLoading from "./loading";
// import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
// import { AuthProviders } from "@/components/auth/providers/auth-providers";

// export default function SignupPage() {
//   const {
//     showPassword,
//     showConfirmPassword,
//     isLoading,
//     formData,
//     setShowPassword,
//     setShowConfirmPassword,
//     handleChange,
//     handleSubmit,
//   } = useSignupForm();

//   const isLoadingPage = useSimulatedLoading(0);

//   if (isLoadingPage) {
//     return <SignupLoading />;
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
//             className="flex w-full flex-col gap-6 sm:max-w-lg"
//           >
//             <SignupHeader variants={itemVariants} />

//             <WelcomeSection variants={itemVariants} />

//             {/* <AuthProviders
//               providers={["google", "facebook"]}
//               disabledProviders={["google", "facebook"]}
//               context="signup"
//               layout="horizontal"
//               variants={itemVariants}
//             /> */}

//             <SignupForm
//               variants={itemVariants}
//               showPassword={showPassword}
//               showConfirmPassword={showConfirmPassword}
//               isLoading={isLoading}
//               formData={formData}
//               onTogglePassword={() => setShowPassword(!showPassword)}
//               onToggleConfirmPassword={() =>
//                 setShowConfirmPassword(!showConfirmPassword)
//               }
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
