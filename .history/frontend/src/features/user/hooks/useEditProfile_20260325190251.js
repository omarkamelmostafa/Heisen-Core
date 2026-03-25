import { useState } from "react";
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

      NotificationService.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || "Failed to update profile");
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
