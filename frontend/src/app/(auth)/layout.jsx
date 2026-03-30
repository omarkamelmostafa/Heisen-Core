// frontend/src/app/(auth)/layout.jsx
import { EnvironmentDebug } from "@/hooks/environment-debug";
import { AuthLayoutWrapper } from "./auth-layout-wrapper";
import { DevWrapper } from "@/features/auth/components/error/dev-wrapper";
import { PublicHeader } from "@/components/layout/public-header";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <AuthLayoutWrapper>
        <EnvironmentDebug />
        <DevWrapper>{children}</DevWrapper>
      </AuthLayoutWrapper>
    </div>
  );
}
