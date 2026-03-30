// components/auth/auth-layout.jsx
export function AuthLayout({ children, className = "" }) {
  return (
    <div className="h-full min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className={`w-full max-w-lg ${className}`}>{children}</div>
    </div>
  );
}
