// components/ui/logo.jsx
export function Logo({ className = "size-8.5" }) {
  return (
    <img
      src="/images/logo.svg"
      alt="Fantasy Coach Logo"
      className={className}
    />
  );
}
