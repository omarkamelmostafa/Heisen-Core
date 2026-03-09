// components/auth/auth-layout.jsx
export function AuthLayout({ children, className = "" }) {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Background/Brand Area */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-8">
        <div className="max-w-2xl text-center text-white space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold">
              Fantasy Coach
            </h1>
            <p className="text-xl xl:text-2xl 2xl:text-3xl opacity-90">
              Build Your Dream Team. Dominate Your League.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 opacity-80">
            <div className="text-center">
              <div className="text-3xl xl:text-4xl 2xl:text-5xl font-bold">
                10K+
              </div>
              <div className="text-sm xl:text-base">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl xl:text-4xl 2xl:text-5xl font-bold">
                99%
              </div>
              <div className="text-sm xl:text-base">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl xl:text-4xl 2xl:text-5xl font-bold">
                24/7
              </div>
              <div className="text-sm xl:text-base">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-20">
        <div
          className={`w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl ${className}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
