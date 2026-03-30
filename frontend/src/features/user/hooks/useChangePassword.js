// frontend/src/features/user/hooks/useChangePassword.js
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { changePassword } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";

export function useChangePassword() {
  const dispatch = useDispatch();
  const t = useTranslations("toasts");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData, resetForm) => {
    setIsSubmitting(true);
    try {
      await dispatch(changePassword(formData)).unwrap();
      NotificationService.success(t("passwordUpdated"));
      if (resetForm) resetForm();
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || t("passwordChangeFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSave };
}
