import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-row items-center justify-between px-8">
      {/* Left side - Content */}
      <div className="flex-1 flex flex-col items-start pl-12">
        {/* Whoops! Heading */}
        <h1 className="text-8xl font-bold text-gray-900 mb-6">Whoops!</h1>

        {/* Subheading */}
        <h2 className="text-3xl font-semibold text-gray-700 mb-8">
          Something went wrong
        </h2>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-12 max-w-md leading-relaxed">
          The page you're looking for isn't found, we suggest you back to home.
        </p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg transition-colors duration-200 text-lg"
        >
          Back to home page
        </Link>

        {/* 4 4 Text - positioned at bottom left of content area */}
        <div className="mt-20 text-6xl font-bold text-gray-300 space-y-2">
          <div>4</div>
          <div>4</div>
        </div>
      </div>

      {/* Right side - Error image */}
      <div className="flex-1 flex justify-center items-center">
        <Image
          src="/images/error-image.png"
          alt="Error illustration"
          width={500}
          height={500}
          className="object-contain"
        />
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
