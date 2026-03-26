// frontend/src/features/user/components/skeletons/settings-shell-skeleton.jsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SettingsShellSkeleton() {
  return (
    <div className="flex gap-5">
      {/* Sidebar skeleton */}
      <div className="hidden md:block w-64 space-y-2">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-4 w-40 mb-6" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
      {/* Content area skeleton */}
      <div className="flex-1 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}
