"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changeEmailSchema } from "@/lib/validations/auth-schemas"
import { Eye, EyeOff, Smartphone, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

function PasswordField({ label, value, onChange, show, onToggleShow, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  // Password change props (EXISTING — unchanged)
  formData,
  showPasswords,
  errors,
  isSubmitting,
  onFieldChange,
  onTogglePassword,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      newEmail: "",
      confirmNewEmail: "",
      currentPassword: "",
    },
  });

  const [showEmailPassword, setShowEmailPassword] = React.useState(false);

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
        <div className="mt-4 max-w-md space-y-4">
          <PasswordField
            label="Current Password"
            value={formData.currentPassword}
            onChange={(v) => onFieldChange("currentPassword", v)}
            show={showPasswords.current}
            onToggleShow={() => onTogglePassword("current")}
            error={errors.currentPassword}
            placeholder="Enter current password"
          />
          <PasswordField
            label="New Password"
            value={formData.newPassword}
            onChange={(v) => onFieldChange("newPassword", v)}
            show={showPasswords.new}
            onToggleShow={() => onTogglePassword("new")}
            error={errors.newPassword}
            placeholder="Enter new password"
          />
          <PasswordField
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(v) => onFieldChange("confirmPassword", v)}
            show={showPasswords.confirm}
            onToggleShow={() => onTogglePassword("confirm")}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
          />
          <Button onClick={onSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Changing Password..." : "Update Password"}
          </Button>
        </div>
      </section>

      <Separator />

      {/* Section B: Two-Factor Authentication (Stub) */}
      <section>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">Two-Factor Authentication</h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">Soon</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Add an extra layer of security to your account with two-factor authentication.</p>
        <Button variant="outline" size="sm" className="mt-4" disabled>
          <Smartphone className="h-4 w-4 mr-2" />
          <span>Enable 2FA</span>
        </Button>
      </section>

      <Separator />

      {/* Section C: Active Sessions (Stub) */}
      <section>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">Active Sessions</h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">Soon</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Manage your active sessions and sign out from other devices.</p>
        <Button variant="outline" size="sm" className="mt-4 text-destructive hover:text-destructive" disabled>
          <Monitor className="h-4 w-4 mr-2" />
          <span>Sign Out All Devices</span>
        </Button>
      </section>
    </main>
  );
}
