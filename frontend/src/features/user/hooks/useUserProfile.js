import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { clearCredentials } from "@/store/slices/auth/auth-slice";
import { selectAuthUser, selectIsAuthenticated } from "@/store/slices/auth/auth-selectors";
import { notify } from "@/lib/notify";

export function useUserProfile() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogout = async () => {
    try {
      // API configs - hardcoded directly to bypass any existing axios intercepts
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1";
      const BASE_URL = `${API_URL}/api/v${VERSION}`;

      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Send the HTTP-only cookie
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      dispatch(clearCredentials());

      sessionStorage.setItem('logout_source', 'local');
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage('LOGOUT');
      channel.close();

      notify.info("Signed out successfully");
      router.push("/login");
    }
  };

  const initials = user ? `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase() : "";
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), "MMMM d, yyyy") : "Unknown";

  return {
    user,
    isAuthenticated,
    handleLogout,
    initials,
    memberSince,
  };
}
