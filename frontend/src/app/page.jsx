"use client";

import { useState } from "react";
import { useUserProfile } from "@/features/user/hooks/useUserProfile";
import { ProtectedGuard } from "@/features/auth/components/guards/protected-guard";
import { TopNav } from "@/components/layout/top-nav";
import { SettingsSidebar } from "@/features/user/components/settings-sidebar";
import { ProfileContent } from "@/features/user/components/profile-content";
import { SettingsMobileNav } from "@/features/user/components/settings-mobile-nav";
import { SecurityContent } from "@/features/user/components/security-content";
import { useChangePassword } from "@/features/user/hooks/useChangePassword";
import { useChangeEmail } from "@/features/user/hooks/useChangeEmail";
import { useSignOutAll } from "@/features/user/hooks/useSignOutAll";
import { useToggle2fa } from "@/features/user/hooks/useToggle2fa";

import { useEditProfile } from "@/features/user/hooks/useEditProfile";
import { useProfilePhoto } from "@/features/user/hooks/useProfilePhoto";

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

  const [activeSection, setActiveSection] = useState("profile");

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

  const {
    isSubmitting: isPasswordSubmitting,
    handleSave: onPasswordSave
  } = useChangePassword();

  const {
    isSubmitting: isEmailSubmitting,
    emailSent,
    sentToEmail,
    handleSave: handleEmailSave,
    resetEmailChange,
  } = useChangeEmail({ currentEmail: email });

  const { isSigningOutAll, handleSignOutAll } = useSignOutAll();

  const {
    twoFactorEnabled,
    isToggling2fa,
    showEnableDialog,
    showDisableDialog,
    password,
    setPassword,
    handleOpenEnable,
    handleOpenDisable,
    handleCloseDialogs,
    handleToggle2fa,
  } = useToggle2fa();

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-muted">
        <TopNav
          initials={initials}
          displayName={displayName}
          onLogout={handleLogout}
          avatarUrl={avatar?.url}
        />
        <div className="w-full max-w-[1200px] mx-auto p-4 md:p-7">
          <SettingsMobileNav
            activeId={activeSection}
            onItemClick={handleSectionChange}
          />
          <div className="flex items-start gap-5">
            <SettingsSidebar
              activeId={activeSection}
              onItemClick={handleSectionChange}
            />
            {activeSection === "profile" ? (
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
            ) : activeSection === "security" ? (
              <SecurityContent
                currentEmail={email}
                isEmailVerified={isVerified}
                isEmailSubmitting={isEmailSubmitting}
                emailSent={emailSent}
                sentToEmail={sentToEmail}
                onEmailSave={handleEmailSave}
                onEmailReset={resetEmailChange}
                isPasswordSubmitting={isPasswordSubmitting}
                onPasswordSave={onPasswordSave}
                isSigningOutAll={isSigningOutAll}
                onSignOutAll={handleSignOutAll}
                twoFactorEnabled={twoFactorEnabled}
                isToggling2fa={isToggling2fa}
                showEnableDialog={showEnableDialog}
                showDisableDialog={showDisableDialog}
                password={password}
                setPassword={setPassword}
                onOpenEnable2fa={handleOpenEnable}
                onOpenDisable2fa={handleOpenDisable}
                onClose2faDialogs={handleCloseDialogs}
                onConfirmToggle2fa={handleToggle2fa}
              />
            ) : null}
          </div>
        </div>
      </div>
    </ProtectedGuard>
  );
}
