// frontend/src/features/user/hooks/useSignOutAll.js
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutAllDevices } from "@/store/slices/auth/auth-thunks";
import { NotificationService } from "@/lib/notifications/notify";

export function useSignOutAll() {
  const dispatch = useDispatch();
  const router = useRouter();
  const t = useTranslations("toasts");
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);

  const handleSignOutAll = async () => {
    setIsSigningOutAll(true);
    try {
      await dispatch(logoutAllDevices()).unwrap();

      sessionStorage.setItem('logout_source', 'local');
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage('LOGOUT');
      channel.close();

      NotificationService.success(t("allDevicesSignedOut"));
      router.push("/login");
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || t("signOutAllFailed"));
      }
    } finally {
      setIsSigningOutAll(false);
    }
  };

  return { isSigningOutAll, handleSignOutAll };
}
