// frontend/src/hooks/auth/forgot-password/use-forgot-password.js
import { useState } from "react";

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 2000);
  };

  const resetForm = () => {
    setEmailSent(false);
    setEmail("");
  };

  return {
    isLoading,
    emailSent,
    email,
    setEmail,
    setEmailSent,
    handleSubmit,
    resetForm,
  };
}
// 