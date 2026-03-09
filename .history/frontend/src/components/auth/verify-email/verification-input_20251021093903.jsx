// components/ui/auth/verify-email/verification-input.jsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyEmailContent } from "@/lib/config/auth-content";

const VerificationInput = React.forwardRef(
  (
    {
      label,
      length,
      value = [],
      onChange,
      disabled = false,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const content = useVerifyEmailContent();
    const inputRefs = React.useRef([]);

    const displayLabel = label || content.form.verificationCode.label;
    const codeLength = length || content.form.verificationCode.length;

    const handleChange = (index, newValue) => {
      if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
        const newCode = [...value];
        newCode[index] = newValue;
        onChange(newCode);

        if (newValue && index < codeLength - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (index, e) => {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").slice(0, codeLength);
      if (/^\d+$/.test(pasteData)) {
        const newCode = [...value];
        for (let i = 0; i < pasteData.length; i++) {
          if (i < codeLength) newCode[i] = pasteData[i];
        }
        onChange(newCode);
        inputRefs.current[
          Math.min(pasteData.length - 1, codeLength - 1)
        ]?.focus();
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        {displayLabel && (
          <Label className="text-sm font-medium">
            {displayLabel}
            {required && "*"}
          </Label>
        )}

        <div className="flex gap-2 justify-center">
          {Array.from({ length: codeLength }, (_, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={value[index] || ""}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              required={required}
              disabled={disabled}
              className="w-12 h-12 text-center text-lg font-semibold"
              {...props}
            />
          ))}
        </div>
      </div>
    );
  }
);

VerificationInput.displayName = "VerificationInput";

export { VerificationInput };
