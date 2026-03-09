// app/login/error.jsx - Error boundary
"use client";
export default function Error({ error, reset }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">
              Something went wrong!
            </h2>
            <p className="text-muted-foreground mb-4">
              {error.message || "An unexpected error occurred"}
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </div>
      <div className="bg-muted hidden lg:block" />
    </div>
  );
}
