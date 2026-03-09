// components/auth/forms/form-field.jsx

// components/auth/forms/form-field.jsx - Professional fix
"use client";

import React, { useCallback } from "react";

const FormField = React.forwardRef((props, ref) => {
  const {
    showPasswordToggle = false,
    onTogglePassword,
    type,
    name,
    disabled = false,
    // ... other props
  } = props;

  const isPasswordField = type === "password" || name?.includes("password");

  // Stable event handler with proper prevention
  const handleToggleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (onTogglePassword && !disabled) {
        onTogglePassword();
      }
    },
    [onTogglePassword, disabled]
  );

  return (
    <div className="relative">
      <Input
        type={type}
        // ... other input props
      />

      {/* Always render toggle when enabled - no disappearing */}
      {showPasswordToggle && isPasswordField && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={handleToggleClick}
          disabled={disabled}
        >
          {type === "password" ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  );
});

ex
// "use client";

// import React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Eye, EyeOff, Mail, Lock, User, Clock } from "lucide-react";
// import { useFormContext } from "react-hook-form";

// const FormField = React.forwardRef(
//   (
//     {
//       label,
//       type = "text",
//       name,
//       placeholder,
//       disabled = false,
//       required = false,
//       icon: IconComponent,
//       showPasswordToggle = false,
//       onTogglePassword,
//       className = "",
//       inputClassName = "",
//       ...props
//     },
//     ref
//   ) => {
//     const {
//       register,
//       formState: { errors },
//     } = useFormContext();

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
//     const error = errors[name];

//     return (
//       <div className={`space-y-2 ${className}`}>
//         {label && (
//           <Label htmlFor={name} className="text-sm font-medium">
//             {label}
//             {required && "*"}
//           </Label>
//         )}

//         <div className="relative">
//           {hasIcon && (
//             <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           )}

//           <Input
//             ref={ref}
//             id={name}
//             type={type}
//             placeholder={placeholder}
//             disabled={disabled}
//             autoComplete="off"
//             className={`
//               w-full
//               ${hasIcon ? "pl-10" : ""}
//               ${showPasswordToggle && isPasswordField ? "pr-10" : ""}
//               ${
//                 error
//                   ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                   : ""
//               }
//               ${inputClassName}
//             `}
//             {...register(name)}
//             {...props}
//           />

//           {showPasswordToggle && isPasswordField && (
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//               onClick={onTogglePassword}
//               disabled={disabled}
//             >
//               {type === "password" ? (
//                 <EyeOff className="h-4 w-4 text-muted-foreground" />
//               ) : (
//                 <Eye className="h-4 w-4 text-muted-foreground" />
//               )}
//               <span className="sr-only">
//                 {type === "password" ? "Show password" : "Hide password"}
//               </span>
//             </Button>
//           )}
//         </div>

//         {error && (
//           <p className="text-sm text-red-600 font-medium">{error.message}</p>
//         )}
//       </div>
//     );
//   }
// );

// FormField.displayName = "FormField";

// export { FormField };

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
