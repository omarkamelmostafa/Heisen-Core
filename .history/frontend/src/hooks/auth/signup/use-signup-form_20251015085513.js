// hooks/auth/signup/use-signup-form.js
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 2000);
  };

  return {
    showPassword,
    showConfirmPassword,
    isLoading,
    formData,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    handleSubmit,
  };
}
