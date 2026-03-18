import { Button } from "@/components/ui/button";

export function UserProfileCard({ user, handleLogout, initials, memberSince }) {
  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-6">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-lg shadow-indigo-200">
            {initials}
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
              {memberSince}
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
  );
}
