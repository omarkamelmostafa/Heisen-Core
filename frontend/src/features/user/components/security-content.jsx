// frontend/src/features/user/components/security-content.jsx
"use client"

import * as React from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createChangeEmailSchema, createChangePasswordSchema } from "@/lib/validations/auth-schemas"
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
import { useTranslations } from "next-intl";
import { TwoFactorToggle } from "./two-factor-toggle"

function PasswordField({ label, registration, show, onToggleShow, error, placeholder }) {
  const tc = useTranslations("common");
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
          aria-label={show ? tc("hidePassword") : tc("showPassword")}
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
  const t = useTranslations("securityPage");
  const tc = useTranslations("common");
  const tVal = useTranslations("validation");

  const changeEmailSchema = useMemo(() => createChangeEmailSchema(tVal), [tVal]);
  const changePasswordSchema = useMemo(() => createChangePasswordSchema(tVal), [tVal]);

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
          <h2 className="text-base font-semibold text-foreground tracking-tight">{t("changeEmail.title")}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {t("changeEmail.description")}
        </p>
        <div className="mt-4 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-foreground">{currentEmail}</span>
            {isEmailVerified && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-green-600 border-green-600">
                {tc("verified")}
              </Badge>
            )}
          </div>

          {emailSent ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  {t("changeEmail.emailSentTo", { email: sentToEmail })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onEmailReset}>
                {t("changeEmail.changeDifferent")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onEmailSave)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("changeEmail.newEmailLabel")}</label>
                <Input
                  type="email"
                  {...register("newEmail")}
                  placeholder={t("changeEmail.newEmailPlaceholder")}
                  className={emailErrors.newEmail ? "border-destructive" : ""}
                />
                {emailErrors.newEmail && (
                  <p className="text-xs text-destructive mt-0.5">{emailErrors.newEmail.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("changeEmail.confirmEmailLabel")}</label>
                <Input
                  type="email"
                  {...register("confirmNewEmail")}
                  placeholder={t("changeEmail.confirmEmailPlaceholder")}
                  className={emailErrors.confirmNewEmail ? "border-destructive" : ""}
                />
                {emailErrors.confirmNewEmail && (
                  <p className="text-xs text-destructive mt-0.5">{emailErrors.confirmNewEmail.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("changeEmail.currentPasswordLabel")}</label>
                <div className="relative">
                  <Input
                    type={showEmailPassword ? "text" : "password"}
                    {...register("currentPassword")}
                    placeholder={t("changeEmail.currentPasswordPlaceholder")}
                    className={emailErrors.currentPassword ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showEmailPassword ? tc("hidePassword") : tc("showPassword")}
                  >
                    {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {emailErrors.currentPassword && (
                  <p className="text-xs text-destructive mt-0.5">{emailErrors.currentPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isEmailSubmitting} className="w-full sm:w-auto">
                {isEmailSubmitting ? t("changeEmail.requesting") : t("changeEmail.requestChange")}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Separator />

      {/* Section A: Change Password */}
      <section>
        <div className="pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">{t("changePassword.title")}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-3">{t("changePassword.description")}</p>
        <form onSubmit={pwHandleSubmit((data) => onPasswordSave(data, pwReset))} className="mt-4 max-w-md space-y-4">
          <PasswordField
            label={t("changePassword.currentPasswordLabel")}
            registration={pwRegister("oldPassword")}
            show={showPasswords.old}
            onToggleShow={() => togglePassword("old")}
            error={pwErrors.oldPassword?.message}
            placeholder={t("changePassword.currentPasswordPlaceholder")}
          />
          <PasswordField
            label={t("changePassword.newPasswordLabel")}
            registration={pwRegister("newPassword")}
            show={showPasswords.new}
            onToggleShow={() => togglePassword("new")}
            error={pwErrors.newPassword?.message}
            placeholder={t("changePassword.newPasswordPlaceholder")}
          />
          <PasswordField
            label={t("changePassword.confirmPasswordLabel")}
            registration={pwRegister("confirmPassword")}
            show={showPasswords.confirm}
            onToggleShow={() => togglePassword("confirm")}
            error={pwErrors.confirmPassword?.message}
            placeholder={t("changePassword.confirmPasswordPlaceholder")}
          />
          <Button type="submit" disabled={isPasswordSubmitting} className="w-full sm:w-auto">
            {isPasswordSubmitting ? t("changePassword.updating") : t("changePassword.updatePassword")}
          </Button>
        </form>
      </section>

      <Separator />

      {/* Section B: Two-Factor Authentication */}
      <section>
        <div className="pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">{t("twoFactor.title")}</h2>
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
          <h2 className="text-base font-semibold text-foreground tracking-tight">{t("activeSessions.title")}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-3">{t("activeSessions.description")}</p>
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
              {isSigningOutAll ? t("activeSessions.signingOut") : t("activeSessions.signOutAll")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("activeSessions.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("activeSessions.confirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSignOutDialogOpen(false)}>
                {tc("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onSignOutAll();
                  setSignOutDialogOpen(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("activeSessions.signOutAll")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  );
}
