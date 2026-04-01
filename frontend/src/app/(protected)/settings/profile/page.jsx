// frontend/src/app/(protected)/settings/profile/page.jsx
"use client";

import { useUserProfile } from "@/features/user/hooks/useUserProfile";
import { useEditProfile } from "@/features/user/hooks/useEditProfile";
import { useProfilePhoto } from "@/features/user/hooks/useProfilePhoto";
import { useTransitionReady } from "@/hooks/use-transition-ready";
import { ProfileSkeleton } from "@/features/user/components/skeletons/profile-skeleton";
import { ProfileContent } from "@/features/user/components/profile-content";

export default function ProfilePage() {
  const {
    handleLogout,
    initials,
    displayName,
    firstName,
    lastName,
    email,
    isVerified,
    memberSince,
    lastLogin,
    avatar,
  } = useUserProfile();

  const {
    isEditing,
    isSubmitting: isProfileSubmitting,
    startEditing,
    cancelEditing,
    handleSave,
    defaultValues: editDefaultValues,
  } = useEditProfile({ firstname: firstName, lastname: lastName });

  const {
    previewUrl,
    isUploading,
    hasSelectedFile,
    handleFileSelect,
    handleUpload: onUploadPhoto,
    handleCancel: onCancelPhoto,
  } = useProfilePhoto();

  const { isReady } = useTransitionReady({ delay: 0 });

  if (!isReady) return <ProfileSkeleton />;

  return (
    <ProfileContent
      initials={initials}
      displayName={displayName}
      firstName={firstName}
      lastName={lastName}
      email={email}
      isVerified={isVerified}
      memberSince={memberSince}
      lastLogin={lastLogin}
      isEditing={isEditing}
      isSubmitting={isProfileSubmitting}
      onEdit={startEditing}
      onCancel={cancelEditing}
      onSave={handleSave}
      editDefaultValues={editDefaultValues}
      avatarUrl={avatar?.url}
      previewUrl={previewUrl}
      isUploading={isUploading}
      hasSelectedFile={hasSelectedFile}
      onFileSelect={handleFileSelect}
      onUploadPhoto={onUploadPhoto}
      onCancelPhoto={onCancelPhoto}
    />
  );
}
