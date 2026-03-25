// frontend/src/features/user/components/security-content.jsx
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changeEmailSchema, changePasswordSchema } from "@/lib/validations/auth-schemas"
import { Eye, EyeOff, Smartphone, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TwoFactorToggle } from "./two-factor-toggle"

function PasswordField({ label, registration, show, onToggleShow, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          {...registration}
          placeholder={placeholder}
          className={error ? "border-destructive pr-10" : "pr-10"}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

export function SecurityContent({
  // Email change props
  currentEmail,
  isEmailVerified,
  isEmailSubmitting,
  emailSent,
  sentToEmail,
  onEmailSave,
  onEmailReset,
  // Password change props
  isPasswordSubmitting,
  onPasswordSave,
  // Sign out all devices props
  isSigningOutAll,
  onSignOutAll,
  // 2FA props
  twoFactorEnabled,
  isToggling2fa,
  showEnableDialog,
  showDisableDialog,
  password,
  setPassword,
  onOpenEnable2fa,
  onOpenDisable2fa,
  onClose2faDialogs,
  onConfirmToggle2fa,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      newEmail: "",
      confirmNewEmail: "",
      currentPassword: "",
    },
  });

  const {
    register: pwRegister,
    handleSubmit: pwHandleSubmit,
    formState: { errors: pwErrors },
    reset: pwReset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [showEmailPassword, setShowEmailPassword] = React.useState(false);

  const [showPasswords, setShowPasswords] = React.useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [signOutDialogOpen, setSignOutDialogOpen] = React.useState(false);

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <main className="flex-1 min-w-0 bg-card rounded-xl border border-border p-7 md:p-8 shadow-sm flex flex-col gap-8">
      {/* Section: Change Email */}
      <section>
        <div className="pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">Change Email</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Update the email address associated with your account.
        </p>
        <div className="mt-4 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-foreground">{currentEmail}</span>
            {isEmailVerified && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-green-600 border-green-600">
                Verified
              </Badge>
            )}
          </div>

          {emailSent ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  We sent a verification link to <strong>{sentToEmail}</strong>.
                  Check your inbox to confirm the change.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onEmailReset}>
                Change to a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onEmailSave)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">New Email Address</label>
                <Input
                  type="email"
                  {...register("newEmail")}
                  placeholder="Enter new email address"
                  className={emailErrors.newEmail ? "border-destructive" : ""}
                />
                {emailErrors.newEmail && (
                  <p className="text-xs text-destructive mt-0.5">{emailErrors.newEmail.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Confirm New Email</label>
                <Input
                  type="email"
                  {...register("confirmNewEmail")}
                  placeholder="Confirm new email address"
                  className={emailErrors.confirmNewEmail ? "border-destructive" : ""}
                />
                {emailErrors.confirmNewEmail && (
                  <p className="text-xs text-destructive mt-0.5">{emailErrors.confirmNewEmail.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                <div className="relative">
                  <Input
                    type={showEmailPassword ? "text" : "password"}
                    {...register("currentPassword")}
                    placeholder="Enter your current password"
                    className={emailErrors.currentPassword ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showEmailPassword ? "Hide password" : "Show password"}
                  >
                    {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {emailErrors.currentPassword && (
                  <p className="text-xs text-destructive mt-0.5">{emailErrors.currentPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isEmailSubmitting} className="w-full sm:w-auto">
                {isEmailSubmitting ? "Requesting..." : "Request Email Change"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Separator />

      {/* Section A: Change Password */}
      <section>
        <div className="pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">Change Password</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Update your password to keep your account secure.</p>
        <form onSubmit={pwHandleSubmit((data) => onPasswordSave(data, pwReset))} className="mt-4 max-w-md space-y-4">
          <PasswordField
            label="Current Password"
            registration={pwRegister("oldPassword")}
            show={showPasswords.old}
            onToggleShow={() => togglePassword("old")}
            error={pwErrors.oldPassword?.message}
            placeholder="Enter current password"
          />
          <PasswordField
            label="New Password"
            registration={pwRegister("newPassword")}
            show={showPasswords.new}
            onToggleShow={() => togglePassword("new")}
            error={pwErrors.newPassword?.message}
            placeholder="Enter new password"
          />
          <PasswordField
            label="Confirm New Password"
            registration={pwRegister("confirmPassword")}
            show={showPasswords.confirm}
            onToggleShow={() => togglePassword("confirm")}
            error={pwErrors.confirmPassword?.message}
            placeholder="Confirm new password"
          />
          <Button type="submit" disabled={isPasswordSubmitting} className="w-full sm:w-auto">
            {isPasswordSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </section>

      <Separator />

      {/* Section B: Two-Factor Authentication */}
      <section>
        <div className="pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">Two-Factor Authentication</h2>
        </div>
        <div className="mt-4">
          <TwoFactorToggle
            twoFactorEnabled={twoFactorEnabled}
            isToggling2fa={isToggling2fa}
            showEnableDialog={showEnableDialog}
            showDisableDialog={showDisableDialog}
            password={password}
            setPassword={setPassword}
            onOpenEnable={onOpenEnable2fa}
            onOpenDisable={onOpenDisable2fa}
            onCloseDialogs={onClose2faDialogs}
            onConfirmToggle={onConfirmToggle2fa}
          />
        </div>
      </section>

      <Separator />

      {/* Section C: Active Sessions */}
      <section>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">Active Sessions</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Manage your active sessions and sign out from other devices.</p>
        <AlertDialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={isSigningOutAll}
              onClick={() => setSignOutDialogOpen(true)}
            >
              <Monitor className="h-4 w-4 mr-2" />
              {isSigningOutAll ? "Signing out..." : "Sign Out All Devices"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out all devices?</AlertDialogTitle>
              <AlertDialogDescription>
                This will sign you out from all devices including this one.
                You will need to log in again on every device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSignOutDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onSignOutAll();
                  setSignOutDialogOpen(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sign Out All Devices
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  );
}
