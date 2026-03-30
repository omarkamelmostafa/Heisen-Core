// frontend/src/features/user/hooks/useEditProfile.js
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/hooks/redux";
import { updateProfile } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";

/**
 * Hook for managing profile name editing.
 * Handles API interaction, state transitions, and notifications.
 * 
 * @param {Object} currentData - Current user names
 */
export function useEditProfile({ firstname, lastname }) {
  const dispatch = useAppDispatch();
  const t = useTranslations("toasts");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEditing = () => setIsEditing(true);

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    try {
      // Dispatch the thunk and unwrap to handle errors locally
      await dispatch(
        updateProfile({
          firstname: formData.firstname,
          lastname: formData.lastname,
        })
      ).unwrap();

      NotificationService.success(t("profileUpdated"));
      setIsEditing(false);
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || t("profileUpdateFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditing,
    isSubmitting,
    startEditing,
    cancelEditing,
    handleSave,
    // Provide default values for the form controller
    defaultValues: {
      firstname: firstname || "",
      lastname: lastname || "",
    },
  };
}
