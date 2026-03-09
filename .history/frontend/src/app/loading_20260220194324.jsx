import { AnimatedLogoLoader } from "@/components/ui/animated-logo";

export default function RootLoading() {
  return (
    <AnimatedLogoLoader
      message="Streaming your fantasy experience..."
      showProgress={true}
    />
  );
}
