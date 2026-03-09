import { AuthRightPanel } from "@/components/auth/auth-right-panel";

export default function LoginLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="flex items-center justify-center p-4 w-full">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
      <AuthRightPanel
        title="Welcome back! Please sign in to your Fantasy Coach account"
        description="Access your personalized dashboard and manage your fantasy teams with ease."
        cardTitle="Please enter your login details"
        cardDescription="Secure access to your Fantasy Coach account and team management tools."
      />
    </div>
  );
}
