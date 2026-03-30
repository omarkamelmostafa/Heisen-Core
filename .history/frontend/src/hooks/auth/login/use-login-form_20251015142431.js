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


    

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 2000);
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
