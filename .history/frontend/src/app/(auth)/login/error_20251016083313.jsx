// app/(auth)/login/error.jsx
"use client";

// import { ErrorBoundary } from "@/components/auth/error-boundary";

// export default function LoginError({ error, reset }) {
//   return <ErrorBoundary error={error} reset={reset} />;
// }

// app/login/error.jsx
import { ErrorBoundary } from "@/components/auth/error-boundary";

export default function LoginError({ error, reset }) {
  return (
    <ErrorBoundary
      error={{
        title: "Oops!",
        message:
          "Oops, something went wrong on our end. Please try again later.",
      }}
      reset={reset}
    />
  );
}
