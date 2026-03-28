// frontend/src/features/user/components/two-factor-toggle.jsx
"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TwoFactorToggle({
  twoFactorEnabled,
  isToggling2fa,
  showEnableDialog,
  showDisableDialog,
  password,
  setPassword,
  onOpenEnable,
  onOpenDisable,
  onCloseDialogs,
  onConfirmToggle,
}) {
  const t = useTranslations("securityPage.twoFactor");
  const tc = useTranslations("common");
  const isDialogOpen = showEnableDialog || showDisableDialog;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${twoFactorEnabled ? "bg-green-100" : "bg-muted"}`}>
          {twoFactorEnabled ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <ShieldOff className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t("heading")}</h3>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled
                  ? t("enabledDescription")
                  : t("disabledDescription")}
              </p>
            </div>
            <Button
              variant={twoFactorEnabled ? "outline" : "default"}
              size="sm"
              onClick={twoFactorEnabled ? onOpenDisable : onOpenEnable}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              {twoFactorEnabled ? t("disableButton") : t("enableButton")}
            </Button>
          </div>

          {twoFactorEnabled && (
            <p className="text-xs text-green-600 mt-2">
              {t("enabledStatus")}
            </p>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={onCloseDialogs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showEnableDialog ? t("enableDialogTitle") : t("disableDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {showEnableDialog
                ? t("enableDialogDescription")
                : t("disableDialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="2fa-password">{t("passwordLabel")}</Label>
              <Input
                id="2fa-password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCloseDialogs}>
              {tc("cancel")}
            </Button>
            <Button
              onClick={onConfirmToggle}
              disabled={isToggling2fa}
              variant={showEnableDialog ? "default" : "destructive"}
            >
              {isToggling2fa
                ? t("processing")
                : showEnableDialog
                  ? t("enableButton")
                  : t("disableButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
