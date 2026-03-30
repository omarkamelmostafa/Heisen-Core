// frontend/src/components/ui/logo.jsx
// components/ui/logo.jsx
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { BRAND } from "@/lib/config/brand-config";

export function Logo({ className = "size-8.5" }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={`${className} animate-pulse bg-muted rounded`} />;
  }

  const logoSrc = resolvedTheme === "dark" 
    ? "/images/logo-light.svg"
    : "/images/logo.svg";

  return (
    <Image
      src={logoSrc}
      alt={`${BRAND.APP_NAME} Logo`}
      width={34}
      height={34}
      className={className}
      priority
    />
  );
}
