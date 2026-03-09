import { AnimatedLogoLoader } from "@/components/ui/animated-logo";

export default function AuthLoading() {
  return (
    <AnimatedLogoLoader
      message="Securing your session..."
      showProgress={true}
    />
  );
}
