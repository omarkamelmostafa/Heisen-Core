// app/(auth)/layout.jsx 
import { AuthRightPanel } from "@/components/auth/auth-right-panel";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left Section - Takes full height on mobile, half on desktop */}
      <div className="flex items-center justify-center p-4   w-full  ">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
      {/* Right Section - Hidden on mobile, visible on desktop */}
      <AuthRightPanel />
    </div>
  );
}
// app/(auth)/layout.jsx
// import { AuthRightPanel } from "@/components/auth/auth-right-panel";

// export default function AuthLayout({ children }) {
//   return (
//     <div className="min-h-screen flex">
//       {/* Left Section - Dynamic Content */}
//       <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
//         {/* <div className="flex-1 flex items-center justify-center  sm:px-6 lg:px-8"> */}
//         <div className="w-full max-w-md">{children}</div>
//       </div>

//       {/* Right Section - Shared Layout */}
//       <div className="hidden lg:flex flex-1 bg-muted/40">
//         <AuthRightPanel />
//       </div>
//     </div>
//   );
// }
