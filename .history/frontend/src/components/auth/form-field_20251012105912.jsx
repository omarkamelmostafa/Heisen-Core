// components/ui/auth/form-field.jsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";

const FormField = React.forwardRef(
  (
    {
      label,
      type = "text",
      name,
      placeholder,
      value,
      onChange,
      onBlur,
      disabled = false,
      required = false,
      icon: IconComponent,
      showPasswordToggle = false,
      onTogglePassword,
      error,
      helperText,
      className = "",
      inputClassName = "",
      ...props
    },
    ref
  ) => {
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

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        {label && (
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && "*"}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {hasIcon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}

          {/* Input Field */}
          <Input
            ref={ref}
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`
              w-full
              ${hasIcon ? "pl-10" : ""}
              ${showPasswordToggle && isPasswordField ? "pr-10" : ""}
              ${inputClassName}
            `}
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
              disabled={disabled}
            >
              {onTogglePassword ? (
                type === "password" ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {type === "password" ? "Show password" : "Hide password"}
              </span>
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
