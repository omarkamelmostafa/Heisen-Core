// frontend/src/components/auth/forms/form-field.jsx

"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, Clock } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

/**
 * Reusable form field used across auth flows.
 * - showPasswordToggle: when true and this is a password field, renders an independent toggle button.
 * - onTogglePassword: parent-controlled callback to flip visibility state for this specific field.
 *
 * Important: toggle button uses type="button" to avoid accidental form submit.
 */
const FormField = React.forwardRef(
  (
    {
      label,
      type = "text",
      name,
      placeholder,
      disabled = false,
      required = false,
      icon: IconComponent = null,
      showPasswordToggle = false,
      onTogglePassword = undefined,
      className = "",
      inputClassName = "",
      ...props
    },
    ref
  ) => {
    const {
      register,
      formState: { errors, touchedFields },
    } = useFormContext();

    // Choose a sensible left icon based on the field name if no IconComponent provided
    const getLeftIcon = () => {
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

    const LeftIcon = getLeftIcon();
    const hasLeftIcon = LeftIcon !== null;

    // We treat fields with "password" in name as password fields OR type === "password"
    const isPasswordField = type === "password" || /password/i.test(name);
    const error = errors?.[name];
    const isTouched = touchedFields?.[name];

    const errorMessage =
      error?.message || (isTouched && error ? String(error) : null);

    // Ensure toggle handler does not submit the form and is stable
    const handleToggleClick = (e) => {
      // Prevent form submit if this button is inside a form
      e.preventDefault();
      if (typeof onTogglePassword === "function" && !disabled) {
        try {
          onTogglePassword();
        } catch (err) {
          // defensive: ensure toggle errors don't unmount UI
          console.error("onTogglePassword error:", err);
        }
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span aria-hidden="true">*</span>}
          </Label>
        )}

        <div className="relative">
          {hasLeftIcon && (
            <LeftIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}

          <Input
            ref={ref}
            id={name}
            {...register(name)}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            className={`w-full
              ${hasLeftIcon ? "pl-10" : ""}
              ${showPasswordToggle && isPasswordField ? "pr-10" : ""}
              ${
                errorMessage
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }
              transition-colors duration-200
              ${inputClassName}
            `}
            {...props}
          />

          {showPasswordToggle && isPasswordField && (
            <Button
              type="button" // critical: not submit
              variant="ghost"
              size="sm"
              onClick={handleToggleClick}
              disabled={disabled}
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              aria-label={
                type === "password" ? "Show password" : "Hide password"
              }
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

        {errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 font-medium"
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
