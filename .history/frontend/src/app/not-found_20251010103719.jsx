import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="flex min-h-full w-full flex-col items-center justify-center bg-background px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="mx-auto max-w-max">
            <main className="flex flex-col items-center justify-center sm:flex-row">
              {/* Error Code */}
              <div className="text-center sm:ml-6 sm:text-left">
                <p className="text-9xl font-semibold text-primary">404</p>

                {/* Main Message */}
                <div className="mt-4">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Page not found
                  </h1>
                  <p className="mt-4 text-base text-muted-foreground">
                    Sorry, we couldn&apos;t find the page you&apos;re looking
                    for.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/"
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                  >
                    Go back home
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-colors border"
                  >
                    Contact support
                  </Link>
                </div>
              </div>

              {/* Cat Illustration */}
              <div className="mt-10 sm:mt-0 sm:ml-10">
                <div className="relative">
                  <Image
                    src="/images/404-cat.png"
                    alt="Confused cat illustration"
                    width={400}
                    height={300}
                    className="max-w-[280px] sm:max-w-[320px] md:max-w-[360px]"
                    priority
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
