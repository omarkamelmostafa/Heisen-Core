// components/auth/auth-layout.jsx
export function AuthLayout({ children, leftContent, className = "" }) {
  return (
    <div className="min-h-screen flex">
      Left Side - Branding/Content
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-blue-50 lg:to-indigo-100 lg:dark:from-gray-900 lg:dark:to-blue-900 lg:p-8">
        <div className="max-w-2xl w-full space-y-8">{leftContent}</div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-20">
        <div
          className={`w-full max-w-md xl:max-w-lg 2xl:max-w-xl ${className}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
