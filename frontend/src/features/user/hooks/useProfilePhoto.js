import { useState, useCallback } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { uploadAvatar } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notify";

export function useProfilePhoto() {
  const dispatch = useAppDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    event.target.value = "";
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await dispatch(uploadAvatar({ file: selectedFile })).unwrap();
      NotificationService.success("Profile photo updated successfully");
      clearSelection();
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || "Failed to upload photo");
      }
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, dispatch, clearSelection]);

  return {
    previewUrl,
    isUploading,
    hasSelectedFile: !!selectedFile,
    handleFileSelect,
    handleUpload,
    handleCancel: clearSelection,
  };
}
