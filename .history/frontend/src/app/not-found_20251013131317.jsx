// app/not-found.jsx
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-background">
      {/* Left side - Content */}
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <h2 className="mb-4 text-6xl font-bold text-primary">Whoops!</h2>
        <h3 className="mb-3 text-3xl font-semibold text-foreground">
          Something went wrong
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-base font-medium shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          Back to Home Page
        </Link>
      </div>

      {/* Right side - Illustration */}
      <div className="relative flex items-center justify-center p-6 max-lg:hidden">
        <div className="absolute inset-0 rounded-2xl bg-muted/30 backdrop-blur-sm"></div>
        <Image
          src="/images/error-image.png"
          alt="404 Illustration"
          width={406}
          height={406}
          priority
          className="relative z-10 h-[clamp(260px,25vw,406px)] w-auto object-contain"
        />
      </div>
    </div>
  );
}

// // app/not-found.jsx
// import Link from "next/link";
// import Image from "next/image";

// export default function NotFound() {
//   return (
//     <div className="h-full w-full">
//       <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
//         {/* Left side - Content */}
//         <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
//           <h2 className="mb-6 text-5xl font-semibold">Whoops!</h2>
//           <h3 className="mb-1.5 text-3xl font-semibold">
//             Something went wrong
//           </h3>
//           <p className="text-muted-foreground mb-6 max-w-sm">
//             The page you're looking for isn't found, we suggest you back to
//             home.
//           </p>
//           <Link
//             href="/"
//             className="inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-base shadow-sm"
//           >
//             Back to home page
//           </Link>
//         </div>

//         {/* Right side - Image */}
//         <div className="relative max-h-screen w-full p-2 max-lg:hidden">
//           <div className="h-full w-full rounded-2xl bg-black"></div>
//           <Image
//             src="/images/error-image.png"
//             alt="404 illustration"
//             width={406}
//             height={406}
//             className="absolute top-1/2 left-1/2 h-[clamp(260px,25vw,406px)] -translate-x-1/2 -translate-y-1/2 object-contain"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
