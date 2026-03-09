// app/(auth)/layout.jsx
import { EnvironmentDebug } from "@/hooks/environment-debug";
import { AuthLayoutWrapper } from "./auth-layout-wrapper";
import { DevWrapper } from "@/components/auth/error/dev-wrapper";
import { LanguageProvider } from "@/lib/config/auth-content";

export default function AuthLayout({ children }) {
  return (
    <LanguageProvider language="en">
      <AuthLayoutWrapper>
        <EnvironmentDebug />
        <DevWrapper>{children}</DevWrapper>
      </AuthLayoutWrapper>
    </LanguageProvider>
  );
}
// export const dynamic = "force-dynamic";
