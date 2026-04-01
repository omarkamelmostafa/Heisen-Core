// frontend/src/features/user/hooks/useToggle2fa.js
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { toggle2fa } from "@/store/slices/user/user-thunks";
import { selectUser2FA } from "@/store/slices/user";
import { NotificationService } from "@/lib/notifications/notify";

export function useToggle2fa() {
  const dispatch = useDispatch();
  const t = useTranslations("toasts");
  const [isToggling2fa, setIsToggling2fa] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [password, setPassword] = useState("");

  const twoFactorEnabled = useSelector(selectUser2FA) || false;

  const handleOpenEnable = () => {
    setPassword("");
    setShowEnableDialog(true);
  };

  const handleOpenDisable = () => {
    setPassword("");
    setShowDisableDialog(true);
  };

  const handleCloseDialogs = () => {
    setShowEnableDialog(false);
    setShowDisableDialog(false);
    setPassword("");
  };

  const handleToggle2fa = async () => {
    if (!password) {
      NotificationService.error(t("enterPassword"));
      return;
    }

    setIsToggling2fa(true);
    try {
      const result = await dispatch(
        toggle2fa({ enable: !twoFactorEnabled, currentPassword: password })
      ).unwrap();

      NotificationService.success(
        twoFactorEnabled
          ? t("twoFactorDisabled")
          : t("twoFactorEnabled")
      );
      handleCloseDialogs();
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || t("twoFactorUpdateFailed"));
      }
    } finally {
      setIsToggling2fa(false);
    }
  };

  return {
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
  };
}
