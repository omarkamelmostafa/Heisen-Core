"use_clite"
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Image */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-64 h-48">
            <Image
              src="/images/404-error.png" // Update this path to match your actual image
              alt="404 Not Found"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Page not found
            </h1>
            <p className="text-muted-foreground text-lg">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>

          <p className="text-muted-foreground/80 text-sm">
            The page might have been moved, deleted, or perhaps you entered the
            wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Go back home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
            >
              Go back
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// "use client";
// // app/not-found.jsx
// "use client";
// import Link from "next/link";

// export default function NotFound() {
//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen text-center bg-white px-4 select-none">
//       <div className="flex flex-col items-center justify-center space-y-6">
//         {/* 404 Header */}
//         <div className="text-[7rem] font-extrabold text-black flex items-center justify-center relative">
//           <span>4</span>
//           <span>0</span>
//           {/* <CatSVG /> */}
//           <span>4</span>
//         </div>

//         {/* Message */}
//         <div>
//           <h1 className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
//             Page Not Found <span>⚠️</span>
//           </h1>
//           <p className="text-gray-600 mt-2">
//             We couldn’t find the page you are looking for
//           </p>
//         </div>

//         {/* Button */}
//         <Link
//           href="/"
//           className="mt-4 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
//         >
//           Back to home page
//         </Link>
//       </div>
//     </main>
//   );
// }

// /* 🐱 Cat SVG Component */
// function CatSVG() {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 200 150"
//       className="w-28 h-28 -mt-4"
//     >
//       <g fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round">
//         {/* Yarn */}
//         <circle cx="120" cy="115" r="14" fill="#f5f5f5" stroke="#444" />
//         <path
//           d="M106 120c-10 2-22 6-32 0"
//           stroke="#777"
//           strokeDasharray="3 3"
//         />

//         {/* Cat Body */}
//         <ellipse cx="90" cy="80" rx="20" ry="25" fill="#fff" stroke="#444" />
//         <path
//           d="M70 70c5-12 35-12 40 0"
//           fill="none"
//           stroke="#444"
//           strokeLinecap="round"
//         />

//         {/* Head */}
//         <circle cx="90" cy="50" r="15" fill="#fff" stroke="#444" />
//         <path
//           d="M80 45q10 8 20 0"
//           stroke="#444"
//           fill="none"
//           strokeLinecap="round"
//         />

//         {/* Ears */}
//         <path d="M78 38l-8-10 10 4zM102 38l8-10-10 4z" fill="#444" />

//         {/* Eyes & Nose */}
//         <circle cx="84" cy="50" r="1.5" fill="#000" />
//         <circle cx="96" cy="50" r="1.5" fill="#000" />
//         <path d="M90 53l2 2 2-2" stroke="#000" strokeLinecap="round" />

//         {/* Smile */}
//         <path d="M86 57q4 3 8 0" stroke="#000" strokeLinecap="round" />

//         {/* Legs */}
//         <path d="M78 95q6 5 10 0" stroke="#444" />
//         <path d="M95 95q6 5 10 0" stroke="#444" />

//         {/* Tail */}
//         <path
//           d="M108 90c10 10 18 15 20 25"
//           stroke="#444"
//           strokeWidth="2"
//           strokeLinecap="round"
//         />
//       </g>

//       {/* Plant */}
//       <g stroke="#444" strokeWidth="1.5">
//         <path d="M145 100v-12" />
//         <path
//           d="M145 88c3-5 8-8 10-6s-1 6-5 10M145 90c-3-4-8-7-10-5s1 5 5 8"
//           fill="#777"
//         />
//         <path d="M140 100h10v10h-10z" fill="#444" />
//       </g>
//     </svg>
//   );
// }
