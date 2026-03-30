// app/(auth)/layout.jsx
import { AuthRightPanel } from "@/components/auth/auth-right-panel";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Dynamic Content */}
      <div className="flex-1 flex items-center justify-center  sm:px-6 lg:px-8">
      <div className="flex-1 flex items-center justify-center  sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right Section - Shared Layout */}
      <div className="hidden lg:flex flex-1 bg-muted/40">
        <AuthRightPanel />
      </div>
    </div>
  );
}
