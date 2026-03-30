// app/(auth)/layout.jsx
import { EnvironmentDebug } from "@/hooks/environment-debug";
import { AuthLayoutWrapper } from "./auth-layout-wrapper";
import { DevWrapper } from "@/components/auth/error/dev-wrapper";
import { ProductionErrorTrigger } from "@/components/auth/production-error-trigger";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

export default function AuthLayout({ children }) {
  return (
    <>
      <ErrorBoundary>
        <AuthLayoutWrapper>
          <EnvironmentDebug />
          <DevWrapper>{children}</DevWrapper>
          {/* Show production error trigger only in production */}
          <ProductionErrorTrigger />
        </AuthLayoutWrapper>
      </ErrorBoundary>
    </>
  );
}
// export const dynamic = "force-dynamic";
