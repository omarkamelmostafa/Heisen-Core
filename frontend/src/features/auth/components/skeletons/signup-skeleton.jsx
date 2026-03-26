// frontend/src/features/auth/components/skeletons/signup-skeleton.jsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SignupSkeleton() {
  return (
    <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
      <div className="flex w-full flex-col gap-6 sm:max-w-lg">
        {/* Header with Logo Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-7 w-40" />
        </div>

        {/* Welcome Section */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-4">
          {/* Name Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Skeleton className="h-4 w-4 mt-1 rounded" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />

          {/* Login Link */}
          <div className="text-center">
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
