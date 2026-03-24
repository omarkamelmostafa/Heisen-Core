import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutAllDevices } from "@/store/slices/auth/auth-thunks";
import { notify } from "@/lib/notify";

export function useSignOutAll() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);

  const handleSignOutAll = async () => {
    setIsSigningOutAll(true);
    try {
      await dispatch(logoutAllDevices()).unwrap();

      sessionStorage.setItem('logout_source', 'local');
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage('LOGOUT');
      channel.close();

      notify.success("All devices have been signed out");
      router.push("/login");
    } catch (error) {
      if (!error?.isGlobalError) {
        notify.error(error?.message || "Failed to sign out all devices");
      }
    } finally {
      setIsSigningOutAll(false);
    }
  };

  return { isSigningOutAll, handleSignOutAll };
}
