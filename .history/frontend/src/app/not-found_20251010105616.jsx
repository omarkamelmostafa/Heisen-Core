import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Cat SVG */}
        <div className="flex min-h-screen flex-col items-center justify-center gap-12 px-8 py-8 sm:py-16 lg:justify-between lg:py-24">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[clamp(300px,50vh,600px)]"
          >
            <path
              d="M367.282 483.125C377.323 483.125 386.395 484.244 392.941 486.044C396.218 486.946 398.834 488.01 400.618 489.17C402.424 490.345 403.257 491.534 403.257 492.656C403.257 493.778 402.424 494.966 400.618 496.14C398.834 497.3 396.218 498.365 392.941 499.266C386.395 501.066 377.323 502.186 367.282 502.186C357.242 502.186 348.17 501.066 341.624 499.266C338.347 498.365 335.732 497.3 333.947 496.14C332.142 494.966 331.309 493.778 331.309 492.656C331.309 491.534 332.141 490.345 333.947 489.17C335.732 488.01 338.347 486.946 341.624 486.044C348.17 484.244 357.242 483.125 367.282 483.125Z"
              fill="var(--foreground)"
              stroke="var(--foreground)"
            ></path>
            {/* ... include all the SVG paths from your provided code ... */}
            <path
              d="M295.283 221.496C295.283 221.496 302.748 217.016 309.617 224.184"
              stroke="var(--foreground)"
              stroke-width="3.3399"
              stroke-miterlimit="10"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M259.748 248.371L266.914 250.163"
              stroke="var(--foreground)"
              stroke-width="1.1133"
              stroke-miterlimit="10"
              stroke-linecap="round"
            ></path>
            <path
              d="M266.019 252.85L259.748 254.045"
              stroke="var(--foreground)"
              stroke-width="1.1133"
              stroke-miterlimit="10"
              stroke-linecap="round"
            ></path>
            <path
              d="M267.212 256.135L262.732 258.523"
              stroke="var(--foreground)"
              stroke-width="1.1133"
              stroke-miterlimit="10"
              stroke-linecap="round"
            ></path>
            <path
              d="M312.604 245.086L318.873 243.593"
              stroke="var(--foreground)"
              stroke-width="1.1133"
              stroke-miterlimit="10"
              stroke-linecap="round"
            ></path>
            <path
              d="M313.797 248.073H317.977"
              stroke="var(--foreground)"
              stroke-width="1.1133"
              stroke-miterlimit="10"
              stroke-linecap="round"
            ></path>
            <path
              d="M314.693 251.058L320.366 252.552"
              stroke="var(--foreground)"
              stroke-width="1.1133"
              stroke-miterlimit="10"
              stroke-linecap="round"
            ></path>
          </svg>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-lg text-muted-foreground">
            We couldn't find the page you are looking for
          </p>
        </div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-foreground text-foreground font-medium rounded-md hover:bg-foreground hover:text-background transition-colors duration-200"
        >
          Back to home page
        </Link>
      </div>
    </div>
  );
}
