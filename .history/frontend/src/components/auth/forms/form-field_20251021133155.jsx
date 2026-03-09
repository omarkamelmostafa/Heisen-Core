// components/auth/forms/form-field.jsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, Clock } from "lucide-react";
import { useFormContext } from "react-hook-form";

/**
 * Professional Form Field with React Hook Form integration
 * Replaces the old manual form field with automatic state management
 */
const FormField = React.forwardRef(
  (
    {
      // Basic props (same as before)
      label,
      type = "text",
      name,
      placeholder,
      disabled = false,
      required = false,
      icon: IconComponent,
      showPasswordToggle = false,
      onTogglePassword,
      className = "",
      inputClassName = "",

      // Advanced props (for complex scenarios)
      validationRules = {},
      ...props
    },
    ref
  ) => {
    // 1. ACCESS FORM CONTEXT - This is the magic!
    const {
      register,
      formState: { errors, isSubmitting },
    } = useFormContext();

    // 2. GET FIELD-SPECIFIC ICON
    const getIcon = () => {
      if (IconComponent) return IconComponent;

      switch (name) {
        case "email":
        case "userEmail":
          return Mail;
        case "password":
        case "confirmPassword":
          return Lock;
        case "firstName":
        case "lastName":
          return User;
        case "verificationCode":
          return Clock;
        default:
          return null;
      }
    };

    const Icon = getIcon();
    const hasIcon = Icon !== null;
    const isPasswordField = type === "password" || name.includes("password");

    // 3. GET ERROR STATE
    const error = errors[name];
    const isDisabled = disabled || isSubmitting;

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        {label && (
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {hasIcon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}

          {/* Input Field - THIS IS WHERE THE MAGIC HAPPENS */}
          <Input
            ref={ref}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={isDisabled}
            autoComplete="off"
            className={`
              w-full transition-colors duration-200
              ${hasIcon ? "pl-10" : "pl-3"}
              ${showPasswordToggle && isPasswordField ? "pr-10" : "pr-3"}
              ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }
              ${inputClassName}
            `}
            // 4. REACT HOOK FORM REGISTRATION - Automatic state management!
            {...register(name, validationRules)}
            {...props}
          />

          {/* Password Toggle Button */}
          {showPasswordToggle && isPasswordField && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={onTogglePassword}
              disabled={isDisabled}
            >
              {type === "password" ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {type === "password" ? "Show password" : "Hide password"}
              </span>
            </Button>
          )}
        </div>

        {/* Error Message - Automatic from Zod validation! */}
        {error && (
          <p className="text-sm text-red-600 font-medium">{error.message}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
// // components/ui/auth/form-field.jsx
// "use client";

// import React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Eye, EyeOff, Mail, Lock, User, Clock } from "lucide-react";

// const FormField = React.forwardRef(
//   (
//     {
//       label,
//       type = "text",
//       name,
//       placeholder,
//       value,
//       onChange,
//       onBlur,
//       disabled = false,
//       required = false,
//       icon: IconComponent,
//       showPasswordToggle = false,
//       onTogglePassword,
//       error,
//       helperText,
//       className = "",
//       inputClassName = "",
//       ...props
//     },
//     ref
//   ) => {
//     const getIcon = () => {
//       if (IconComponent) return IconComponent;

//       switch (name) {
//         case "email":
//         case "userEmail":
//           return Mail;
//         case "password":
//         case "confirmPassword":
//           return Lock;
//         case "firstName":
//         case "lastName":
//           return User;
//         case "verificationCode":
//           return Clock;
//         default:
//           return null;
//       }
//     };

//     const Icon = getIcon();
//     const hasIcon = Icon !== null;
//     const isPasswordField = type === "password" || name.includes("password");

//     return (
//       <div className={`space-y-2 ${className}`}>
//         {/* Label */}
//         {label && (
//           <Label htmlFor={name} className="text-sm font-medium">
//             {label}
//             {required && "*"}
//           </Label>
//         )}

//         {/* Input Container */}
//         <div className="relative">
//           {/* Left Icon */}
//           {hasIcon && (
//             <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           )}

//           {/* Input Field */}
//           <Input
//             ref={ref}
//             id={name}
//             name={name}
//             type={type}
//             placeholder={placeholder}
//             required={required}
//             disabled={disabled}
//             value={value}
//             onChange={onChange}
//             onBlur={onBlur}
//             autocomplete="off" // disable autocomplete
//             className={`
//               w-full
//               ${hasIcon ? "pl-10" : ""}
//               ${showPasswordToggle && isPasswordField ? "pr-10" : ""}
//               ${inputClassName}
//             `}
//             {...props}
//           />

//           {/* Password Toggle Button */}
//           {showPasswordToggle && isPasswordField && (
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//               onClick={onTogglePassword}
//               disabled={disabled}
//             >
//               {onTogglePassword ? (
//                 type === "password" ? (
//                   <EyeOff className="h-4 w-4 text-muted-foreground" />
//                 ) : (
//                   <Eye className="h-4 w-4 text-muted-foreground" />
//                 )
//               ) : (
//                 <Eye className="h-4 w-4 text-muted-foreground" />
//               )}
//               <span className="sr-only">
//                 {type === "password" ? "Show password" : "Hide password"}
//               </span>
//             </Button>
//           )}
//         </div>

//         {/* Error Message */}
//         {error && <p className="text-sm text-red-600">{error}</p>}

//         {/* Helper Text */}
//         {helperText && !error && (
//           <p className="text-sm text-muted-foreground">{helperText}</p>
//         )}
//       </div>
//     );
//   }
// );

// FormField.displayName = "FormField";

// export { FormField };
