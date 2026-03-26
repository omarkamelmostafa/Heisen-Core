// frontend/src/app/settings/not-found.jsx
import Link from "next/link";

export default function SettingsNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Page Not Found
      </h2>
      <p className="text-muted-foreground mb-6">
        The settings page you're looking for doesn't exist.
      </p>
      <Link
        href="/settings/profile"
        className="text-primary hover:underline"
      >
        Go to Profile Settings
      </Link>
    </div>
  );
}
