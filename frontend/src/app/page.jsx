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

import { useEditProfile } from "@/features/user/hooks/useEditProfile";

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
    formData, 
    showPasswords, 
    errors, 
    isSubmitting: isPasswordSubmitting, 
    updateField, 
    toggleShowPassword, 
    handleSubmit: handleChangePassword 
  } = useChangePassword();

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
              />
            ) : activeSection === "security" ? (
              <SecurityContent
                formData={formData}
                showPasswords={showPasswords}
                errors={errors}
                isSubmitting={isPasswordSubmitting}
                onFieldChange={updateField}
                onTogglePassword={toggleShowPassword}
                onSubmit={handleChangePassword}
              />
            ) : null}
          </div>
        </div>
      </div>
    </ProtectedGuard>
  );
}
