import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { forgotPassword } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { selectAuthLoading, selectAuthError } from "@/store/slices/auth/auth-selectors";

export function useForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // Clear any stale auth error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data) => {
    try {
      await dispatch(forgotPassword(data.userEmail)).unwrap();
      setSubmittedEmail(data.userEmail);
      setIsSuccess(true);
    } catch (err) {
      // Error is handled via Redux
      console.error("Forgot password error:", err);
    }
  };

  const handleTryAnotherEmail = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
  };

  return {
    isSuccess,
    submittedEmail,
    isLoading,
    error,
    handleSubmit,
    handleTryAnotherEmail,
  };
}
