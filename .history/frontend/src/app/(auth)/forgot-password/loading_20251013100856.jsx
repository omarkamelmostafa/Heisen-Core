// app/(auth)/forgot-password/loading.jsx
import { Skeleton } from "@/components/ui/skeleton";
 

export default function ForgotPasswordLoading() {
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
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Help Text */}
          <Skeleton className="h-16 w-full rounded-lg" />

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />

          {/* Back to Login Link */}
          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
