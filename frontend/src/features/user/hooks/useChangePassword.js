import { useState } from "react";
import { useDispatch } from "react-redux";
import { changePassword } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notify";

export function useChangePassword() {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData, resetForm) => {
    setIsSubmitting(true);
    try {
      await dispatch(changePassword(formData)).unwrap();
      NotificationService.success("Password updated successfully");
      if (resetForm) resetForm();
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || "Failed to change password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSave };
}
