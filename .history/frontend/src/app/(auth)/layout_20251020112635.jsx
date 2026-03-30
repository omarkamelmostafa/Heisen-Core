// app/(auth)/layout.jsx
import { AuthLayoutWrapper } from "./auth-layout-wrapper";

export default function AuthLayout({ children }) {
  return <AuthLayoutWrapper>
  
  {children}</AuthLayoutWrapper>;
}
// export const dynamic = "force-dynamic";
