"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header: Avatar + Name + Badge area */}
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
        {/* Avatar skeleton */}
        <Skeleton className="size-24 rounded-full" />
        <div className="space-y-2 text-center sm:text-left">
          {/* Display name */}
          <Skeleton className="h-7 w-48" />
          {/* Email + badge */}
          <Skeleton className="h-5 w-64" />
          {/* Role/status badge */}
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Divider */}
      <Skeleton className="h-px w-full" />

      {/* Personal Information Section */}
      <div className="space-y-4">
        {/* Section title */}
        <Skeleton className="h-6 w-40" />

        {/* Form fields grid (2 columns on desktop) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* First name field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          {/* Last name field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
