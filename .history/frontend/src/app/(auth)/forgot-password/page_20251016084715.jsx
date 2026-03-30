// app/(auth)/forgot-password/page.jsx
"use client";

import { useForgotPassword } from "@/hooks/auth/forgot-password/use-forgot-password";
import { useSimulatedLoading } from "@/hooks/use-loading-simulated";
import { ForgotPasswordHeader } from "@/components/auth/forgot-password/forgot-password-header";
import { FormState } from "@/components/auth/forgot-password/form-state";
import { SuccessState } from "@/components/auth/forgot-password/success-state";
import { AnimatePresence } from "framer-motion";
import ForgotPasswordLoading from "./loading";
import { RussianRouletteWrapper } from "@/components/auth/russian-roulette-wrapper";

export default function ForgotPasswordPage() {
  const { isLoading, emailSent, email, setEmail, handleSubmit, resetForm } =
    useForgotPassword();

  const isLoadingPage = useSimulatedLoading(0);

  if (isLoadingPage) {
    return <ForgotPasswordLoading />;
  }

  return (
          <RussianRouletteWrapper>


    <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
      <div className="flex w-full flex-col gap-6 sm:max-w-lg">
        <ForgotPasswordHeader />

        <AnimatePresence mode="wait">
          {!emailSent ? (
            <FormState
              isLoading={isLoading}
              email={email}
              onEmailChange={(e) => setEmail(e.target.value)}
              onSubmit={handleSubmit}
            />
          ) : (
            <SuccessState email={email} onTryAnotherEmail={resetForm} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
