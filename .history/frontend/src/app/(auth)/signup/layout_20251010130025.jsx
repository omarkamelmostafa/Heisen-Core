import { AuthRightPanel } from "@/components/auth/auth-right-panel";

export default function SignupLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="flex items-center justify-center p-4 w-full">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
      <AuthRightPanel
        title="Join Fantasy Coach today!"
        description="Create your account to start building your dream team and competing with friends."
        cardTitle="Create your account"
        cardDescription="Get started with Fantasy Coach and unlock all premium features for free."
      />
    </div>
  );
}
