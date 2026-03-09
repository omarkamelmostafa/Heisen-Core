// app/(auth)/layout.jsx
import { AuthLayoutWrapper } from "./auth-layout-wrapper";

export default function AuthLayout({ children }) {
  return (
    <AuthLayoutWrapper>
      <EnvironmentDebug />
      {children}
    </AuthLayoutWrapper>
  );
}
// export const dynamic = "force-dynamic";
