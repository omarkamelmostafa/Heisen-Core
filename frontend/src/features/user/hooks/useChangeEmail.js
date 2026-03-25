// frontend/src/features/user/hooks/useChangeEmail.js
import { useState } from "react";
import { useDispatch } from "react-redux";
import { requestEmailChange } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";

export function useChangeEmail({ currentEmail }) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const handleSave = async (formData) => {
    // Client-side same-email check before hitting API
    if (formData.newEmail.toLowerCase() === currentEmail?.toLowerCase()) {
      NotificationService.error("New email must be different from your current email");
      return;
    }

    // Strip confirmNewEmail — backend never sees it
    const { confirmNewEmail, ...payload } = formData;

    setIsSubmitting(true);
    try {
      await dispatch(requestEmailChange(payload)).unwrap();
      setEmailSent(true);
      setSentToEmail(formData.newEmail);
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || "Failed to request email change");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEmailChange = () => {
    setEmailSent(false);
    setSentToEmail("");
  };

  return {
    isSubmitting,
    emailSent,
    sentToEmail,
    handleSave,
    resetEmailChange,
  };
}
