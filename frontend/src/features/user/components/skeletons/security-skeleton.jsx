"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SecuritySkeleton() {
  return (
    <div className="space-y-8 rounded-lg border border-border bg-card p-6">
      {/* Email Change Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Divider */}
      <Skeleton className="h-px w-full" />

      {/* Password Change Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80" />
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Divider */}
      <Skeleton className="h-px w-full" />

      {/* 2FA Toggle Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Divider */}
      <Skeleton className="h-px w-full" />

      {/* Sign Out All Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-10 w-44 rounded-md" />
      </div>
    </div>
  );
}
