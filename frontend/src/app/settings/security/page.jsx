// frontend/src/app/settings/security/page.jsx
"use client";

import { useUserProfile } from "@/features/user/hooks/useUserProfile";
import { useChangePassword } from "@/features/user/hooks/useChangePassword";
import { useChangeEmail } from "@/features/user/hooks/useChangeEmail";
import { useSignOutAll } from "@/features/user/hooks/useSignOutAll";
import { useToggle2fa } from "@/features/user/hooks/useToggle2fa";
import { useTransitionReady } from "@/hooks/use-transition-ready";
import { SecuritySkeleton } from "@/features/user/components/skeletons/security-skeleton";
import { SecurityContent } from "@/features/user/components/security-content";

export default function SecurityPage() {
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

  const { isReady } = useTransitionReady({ delay: 300 });

  if (!isReady) return <SecuritySkeleton />;

  return (
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
  );
}
