"use client";

import { useDispatch, useSelector } from "react-redux";
import { clearCredentials } from "@/store/slices/auth/auth-slice";
import { selectAuthUser } from "@/store/slices/auth/auth-selectors";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ProtectedGuard } from "@/components/auth/guards/protected-guard";
import { format } from "date-fns";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const router = useRouter();

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
      
      // CRITICAL: Broadcast logout to all open tabs for immediate session revocation across the application.
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage('LOGOUT');
      channel.close();
      
      router.push("/login");
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
  };

  if (!user) return null;

  return (
    <ProtectedGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-6">
        <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-lg shadow-indigo-200">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm font-medium text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Status</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user?.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {user?.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Member Since</span>
              <span className="text-sm font-semibold text-slate-900">
                {user?.createdAt ? format(new Date(user.createdAt), "MMMM d, yyyy") : "Unknown"}
              </span>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-6 rounded-xl transition-all active:scale-[0.98]"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </ProtectedGuard>
  );
}
