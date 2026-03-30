// frontend/src/features/auth/components/login/two-factor-step.jsx
"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export function TwoFactorStep({
  onVerify,
  onCancel,
  onResend,
  isVerifying,
  isResending,
}) {
  const [otpValue, setOtpValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otpValue.length === 6) {
      onVerify(otpValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          A verification code has been sent to your email.
          Enter the 6-digit code below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={setOtpValue}
            disabled={isVerifying}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isVerifying || otpValue.length !== 6}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending || isVerifying}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? "Sending new code..." : "Resend code"}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to login
        </button>
      </div>
    </div>
  );
}
