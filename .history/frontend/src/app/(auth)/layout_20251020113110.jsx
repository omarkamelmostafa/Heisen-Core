// app/(auth)/layout.jsx
import { EnvironmentDebug } from "@/hooks/environment-debug";
import { AuthLayoutWrapper } from "./auth-layout-wrapper";
import { DevWrapper } from "@/components/auth/error/dev-wrapper";
import { ProductionErrorTrigger } from "@/components/auth/production-error-trigger";

export default function AuthLayout({ children }) {
  return (
    <AuthLayoutWrapper>
      <EnvironmentDebug />
      <DevWrapper>{children}</DevWrapper>
      {/* Show production error trigger only in production */}
      {<ProductionErrorTrigger />}
    </AuthLayoutWrapper>
  );
}
// export const dynamic = "force-dynamic";
