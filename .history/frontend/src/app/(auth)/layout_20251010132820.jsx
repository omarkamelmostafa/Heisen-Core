// app/(auth)/layout.jsx
import { headers } from "next/headers";
import { AuthRightPanel } from "@/components/auth/auth-right-panel";

const routeConfig = {
  "/login": {
    title: "Welcome back! Please sign in to your Fantasy Coach account",
    description:
      "Access your personalized dashboard and manage your fantasy teams with ease.",
    cardTitle: "Please enter your login details",
    cardDescription:
      "Secure access to your Fantasy Coach account and team management tools.",
  },
  "/signup": {
    title: "Join Fantasy Coach today!",
    description:
      "Create your account to start building your dream team and competing with friends.",
    cardTitle: "Create your account",
    cardDescription:
      "Get started with Fantasy Coach and unlock all premium features for free.",
  },
  "/verify-email": {
    title: "Welcome back! Please sign in to your Fantasy Coach account.",
    description: "Welcome back! Please sign in to your Fantasy Coach account.",
    cardTitle: "Please enter your login details",
    cardDescription:
      "Stay connected with shadcn/studio Subscribe now for the latest updates and news.",
  },
  "/forgot-password": {
    title: "Don’t worry it happens! Resetting your password is quick and easy.",
    description:
      "Just enter your registered email address below, and we’ll send you a secure link to reset your password. Follow the instructions in the email, and you’ll be back in your account in no time!",
    cardTitle: "Follow the instructions",
    cardDescription:
      "If you don’t see the email in your inbox, be sure to check your spam or junk folder.",
  },
  "/reset-password": {
    title: "Create new password",
    description:
      "Enter your new password below to secure your Fantasy Coach account.",
    cardTitle: "Set new password",
    cardDescription:
      "Choose a strong password to protect your account and fantasy teams.",
  },
};

export default function AuthLayout({ children }) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "/login";

  const config = routeConfig[pathname] || routeConfig["/login"];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="flex items-center justify-center p-4 w-full">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
      <AuthRightPanel {...config} />
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
