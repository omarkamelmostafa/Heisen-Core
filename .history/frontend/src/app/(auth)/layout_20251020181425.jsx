// app/(auth)/layout.jsx
import { EnvironmentDebug } from "@/hooks/environment-debug";
import { AuthLayoutWrapper } from "./auth-layout-wrapper";
import { DevWrapper } from "@/components/auth/error/dev-wrapper";

export default function AuthLayout({ children }) {
  return (
    // <AuthLayoutWrapper>
      <EnvironmentDebug />
      <DevWrapper>{children}</DevWrapper>
    {/* </AuthLayoutWrapper> */}
  );
}
// export const dynamic = "force-dynamic";
