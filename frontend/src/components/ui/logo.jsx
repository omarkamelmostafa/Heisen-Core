// frontend/src/components/ui/logo.jsx
// components/ui/logo.jsx
import Image from "next/image";

export function Logo({ className = "size-8.5" }) {
  return (
    <Image
      src="/images/logo.svg"
      alt="Fantasy Coach Logo"
      width={34} // 8.5 * 4 = 34 (since 1rem = 4px in Tailwind)
      height={34}
      className={className}
    />
  );
}
