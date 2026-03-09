// // components/auth/auth-submit-button.jsx
// "use client";

// import { Button } from "@/components/ui/button";

// export function AuthSubmitButton({
//   isLoading = false,
//   loadingText,
//   defaultText,
//   disabled = false,
//   disabledConditions = [],
//   className = "w-full",
//   type = "submit",
//   variant = "default",
//   // Additional validation conditions beyond isLoading
//   validateEmptyFields = [],
//   // For verification code pages
//   validateCode = false,
//   code = [],
//   // For password confirmation
//   validatePasswordMatch = false,
//   password = "",
//   confirmPassword = "",
//   ...buttonProps
// }) {
//   // Calculate disabled state based on multiple conditions
//   const isDisabled = () => {
//     if (isLoading) return true;
//     if (disabled) return true;

//     // Check additional disabled conditions
//     if (disabledConditions.some((condition) => condition)) return true;

//     // Validate empty fields
//     if (validateEmptyFields.length > 0) {
//       if (validateEmptyFields.some((field) => !field || field.trim() === ""))
//         return true;
//     }

//     // Validate verification code
//     if (validateCode && code.some((digit) => digit === "")) return true;

//     // Validate password match
//     if (validatePasswordMatch && password !== confirmPassword) return true;

//     return false;
//   };

//   return (
//     <Button
//       type={type}
//       className={className}
//       disabled={isDisabled()}
//       variant={variant}
//       {...buttonProps}
//     >
//       {isLoading ? loadingText : defaultText}
//     </Button>
//   );
// }
