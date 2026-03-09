import { useState } from "react";

export function useAuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return {
    showPassword,
    showConfirmPassword,
    isLoading,
    setIsLoading,
    togglePassword,
    toggleConfirmPassword,
  };
}
