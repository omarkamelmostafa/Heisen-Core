// app/(auth)/reset-password/loading.jsx
import { Skeleton } from "@/components/ui/skeleton";
 

export default function ResetPasswordLoading() {
  return (
    <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
      <div className="flex w-full flex-col gap-6 sm:max-w-lg">
        {/* Header with Logo */}
        <div className="flex items-center gap-3">
          <Logo />
          <Skeleton className="h-7 w-40" />
        </div>

        {/* Header Section */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-4">
          {/* New Password Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password Strength Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />

          {/* Help Text */}
          <div className="text-center">
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>

          {/* Back to Login Link */}
          <div className="text-center pt-4">
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>

        {/* Password Requirements */}
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}
