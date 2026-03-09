"use client";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/slices/auth/auth-thunks";
import { selectAuthUser } from "@/store/slices/auth/auth-selectors";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-400">
          Welcome back, <span className="text-primary font-semibold">{user?.name || user?.email || "User"}</span>!
        </p>
        <div className="p-8 border border-slate-800 bg-slate-900/50 rounded-2xl">
          <p className="text-sm text-slate-500 mb-6">
            This is a placeholder dashboard. You are successfully authenticated using HttpOnly cookies.
          </p>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
