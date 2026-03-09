// components/auth/verif

"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

const VerificationInput = React.forwardRef(
  (
    {
      label,
      length = 6,
      name = "verificationCode",
      disabled = false,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const {
      setValue,
      watch,
      formState: { errors, touchedFields },
    } = useFormContext();
    const code = watch(name) || Array(length).fill("");
    const error = errors[name];
    const isTouched = touchedFields[name];

    const handleChange = (index, newValue) => {
      if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
        const newCode = [...code];
        newCode[index] = newValue;
        setValue(name, newCode, { shouldValidate: true });

        if (newValue && index < length - 1) {
          const nextInput = document.getElementById(`${name}-${index + 1}`);
          nextInput?.focus();
        }
      }
    };

    const handleKeyDown = (index, e) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        const prevInput = document.getElementById(`${name}-${index - 1}`);
        prevInput?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").slice(0, length);
      if (/^\d+$/.test(pasteData)) {
        const newCode = Array(length).fill("");
        for (let i = 0; i < pasteData.length; i++) {
          if (i < length) newCode[i] = pasteData[i];
        }
        setValue(name, newCode, { shouldValidate: true });

        const focusIndex = Math.min(pasteData.length, length - 1);
        const focusInput = document.getElementById(`${name}-${focusIndex}`);
        focusInput?.focus();
      }
    };

    // Show error when any digit is touched or all are empty
    const shouldShowError = isTouched || error?.message?.includes("required");

    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && "*"}
          </Label>
        )}

        <div className="flex gap-2 justify-center">
          {Array.from({ length }, (_, index) => (
            <Input
              key={index}
              id={`${name}-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={code[index] || ""}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              required={required}
              disabled={disabled}
              className={`w-12 h-12 text-center text-lg font-semibold ${
                shouldShowError && error
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              {...props}
            />
          ))}
        </div>

        {shouldShowError && error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 font-medium text-center"
          >
            {error.message}
          </motion.p>
        )}
      </div>
    );
  }
);

VerificationInput.displayName = "VerificationInput";

export { VerificationInput };

// // components/ui/auth/verify-email/verification-input.jsx
// "use client";

// import React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useVerifyEmailContent } from "@/lib/config/auth-content";

// const VerificationInput = React.forwardRef(
//   (
//     {
//       label,
//       length,
//       value = [],
//       onChange,
//       disabled = false,
//       required = false,
//       className = "",
//       ...props
//     },
//     ref
//   ) => {
//     const content = useVerifyEmailContent();
//     const inputRefs = React.useRef([]);

//     const displayLabel = label || content.form.verificationCode.label;
//     const codeLength = length || content.form.verificationCode.length;

//     const handleChange = (index, newValue) => {
//       if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
//         const newCode = [...value];
//         newCode[index] = newValue;
//         onChange(newCode);

//         if (newValue && index < codeLength - 1) {
//           inputRefs.current[index + 1]?.focus();
//         }
//       }
//     };

//     const handleKeyDown = (index, e) => {
//       if (e.key === "Backspace" && !value[index] && index > 0) {
//         inputRefs.current[index - 1]?.focus();
//       }
//     };

//     const handlePaste = (e) => {
//       e.preventDefault();
//       const pasteData = e.clipboardData.getData("text").slice(0, codeLength);
//       if (/^\d+$/.test(pasteData)) {
//         const newCode = [...value];
//         for (let i = 0; i < pasteData.length; i++) {
//           if (i < codeLength) newCode[i] = pasteData[i];
//         }
//         onChange(newCode);
//         inputRefs.current[
//           Math.min(pasteData.length - 1, codeLength - 1)
//         ]?.focus();
//       }
//     };

//     return (
//       <div className={`space-y-2 ${className}`}>
//         {displayLabel && (
//           <Label className="text-sm font-medium">
//             {displayLabel}
//             {required && "*"}
//           </Label>
//         )}

//         <div className="flex gap-2 justify-center">
//           {Array.from({ length: codeLength }, (_, index) => (
//             <Input
//               key={index}
//               ref={(el) => (inputRefs.current[index] = el)}
//               type="text"
//               inputMode="numeric"
//               pattern="[0-9]*"
//               maxLength={1}
//               value={value[index] || ""}
//               onChange={(e) => handleChange(index, e.target.value)}
//               onKeyDown={(e) => handleKeyDown(index, e)}
//               onPaste={handlePaste}
//               required={required}
//               disabled={disabled}
//               className="w-12 h-12 text-center text-lg font-semibold"
//               {...props}
//             />
//           ))}
//         </div>
//       </div>
//     );
//   }
// );

// VerificationInput.displayName = "VerificationInput";

// export { VerificationInput };
