// frontend/src/features/auth/components/skeletons/verify-email-skeleton.jsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function VerifyEmailSkeleton() {
  return (
    <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
      <div className="flex w-full flex-col gap-6 sm:max-w-lg">
        {/* Header with Logo Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-7 w-40" />
        </div>

        {/* Header Section */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Verification Form Skeleton */}
        <div className="space-y-6">
          {/* Code Input Fields */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2 justify-center">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-12" />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />

          {/* Resend Code Section */}
          <div className="text-center space-y-3">
            <Skeleton className="h-4 w-36 mx-auto" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Back to Login Link */}
          <div className="text-center pt-4">
            <Skeleton className="h-4 w-28 mx-auto" />
          </div>
        </div>

        {/* Help Text */}
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}
