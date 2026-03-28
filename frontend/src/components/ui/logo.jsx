// frontend/src/components/ui/logo.jsx
// components/ui/logo.jsx
import Image from "next/image";
import { BRAND } from "@/lib/config/brand-config";

export function Logo({ className = "size-8.5" }) {
  return (
    <Image
      src="/images/logo.svg"
      alt={`${BRAND.APP_NAME} Logo`}
      width={34} // 8.5 * 4 = 34 (since 1rem = 4px in Tailwind)
      height={34}
      className={className}
    />
  );
}
