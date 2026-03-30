// hooks/auth/reset-password/use-reset-password.js
import { useState } from "react";

export function useResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // setIsSuccess(true);
    }, 2000);
  };

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: "", color: "" };
    return formData.password.length >= 8
      ? { strength: "Strong", color: "text-emerald-600" }
      : { strength: "Weak", color: "text-amber-600" };
  };

  const getPasswordMatch = () => {
    if (!formData.confirmPassword) return { match: "", color: "" };
    return formData.password === formData.confirmPassword
      ? { match: "✓ Passwords match", color: "text-emerald-600" }
      : { match: "✗ Passwords don't match", color: "text-red-600" };
  };

  return {
    showPassword,
    showConfirmPassword,
    isLoading,
    isSuccess,
    formData,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    handleSubmit,
    getPasswordStrength,
    getPasswordMatch,
  };
}
