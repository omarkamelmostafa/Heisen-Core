// app/(auth)/signup/page.jsx - Updated state management
"use client";

import { useSignupForm } from "@/hooks/auth/signup/use-signup-form";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { SignupHeader } from "@/components/auth/signup/signup-header";
import { WelcomeSection } from "@/components/auth/signup/welcome-section";
import { SignupForm } from "@/components/auth/signup/signup-form";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import SignupLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
import { AuthProviders } from "@/components/auth/providers/auth-providers";
import { useState } from "react";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";

export default function SignupPage() {
  // Use separate states for each password field
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  // Stable toggle functions using useCallback pattern
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <AuthFormProvider>
      <SignupForm
        showPassword={passwordVisibility.password}
        showConfirmPassword={passwordVisibility.confirmPassword}
        onTogglePassword={() => togglePasswordVisibility("password")}
        onToggleConfirmPassword={() =>
          togglePasswordVisibility("confirmPassword")
        }
      />
    </AuthFormProvider>
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
