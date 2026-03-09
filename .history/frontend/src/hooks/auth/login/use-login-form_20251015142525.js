// hooks/auth/login/use-login-form.js
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate API call - in real app, this would be your actual API call
    try {
      // Simulate different scenarios based on input
      if (formData.email === "error@test.com") {
        throw new Error("invalid_credentials");
      }

      if (formData.email === "network@test.com") {
        throw new Error("network_error");
      }

      // Normal successful login
      setTimeout(() => {
        setIsLoading(false);
        router.push("/");
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to be caught by the page
    }
  };

  return {
    showPassword,
    isLoading,
    formData,
    setShowPassword,
    handleChange,
    handleSubmit,
  };
}
