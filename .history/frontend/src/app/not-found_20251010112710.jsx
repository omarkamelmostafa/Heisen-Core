
// not-found.jsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Cat Illustration */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <LostCatIllustration />
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Looks like this cat got lost... just like the page you're looking for!
        </p>

        {/* Action Button */}
        <button
          onClick={() => window.history.back()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

// SVG Component - Inline for better performance and customization
function LostCatIllustration() {
  return (
    <svg
      width="240"
      height="200"
      viewBox="0 0 240 200"
      className="mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cat Body */}
      <ellipse cx="120" cy="130" rx="60" ry="40" fill="#4F46E5" />

      {/* Cat Head */}
      <circle cx="120" cy="80" r="40" fill="#4F46E5" />

      {/* Ears */}
      <path d="M90 50 L100 30 L110 50 Z" fill="#4F46E5" />
      <path d="M130 50 L140 30 L150 50 Z" fill="#4F46E5" />
      <path d="M92 48 L100 35 L108 48 Z" fill="#E5E7EB" />
      <path d="M132 48 L140 35 L148 48 Z" fill="#E5E7EB" />

      {/* Eyes - Animated */}
      <circle cx="105" cy="75" r="8" fill="#1F2937">
        <animate
          attributeName="cy"
          values="75;72;75"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="135" cy="75" r="8" fill="#1F2937">
        <animate
          attributeName="cy"
          values="75;72;75"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="108" cy="72" r="3" fill="#FFFFFF" />
      <circle cx="138" cy="72" r="3" fill="#FFFFFF" />

      {/* Whiskers */}
      <path
        d="M80 85 Q60 80 55 90"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M80 90 Q60 95 55 100"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M160 85 Q180 80 185 90"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M160 90 Q180 95 185 100"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
      />

      {/* Mouth - Sad expression */}
      <path
        d="M110 95 Q120 105 130 95"
        stroke="#1F2937"
        strokeWidth="2"
        fill="none"
      />

      {/* Tail - Curved */}
      <path
        d="M180 130 Q210 110 200 80 Q190 60 170 70"
        stroke="#4F46E5"
        strokeWidth="12"
        fill="none"
      />

      {/* Paws */}
      <circle cx="90" cy="165" r="8" fill="#4F46E5" />
      <circle cx="110" cy="165" r="8" fill="#4F46E5" />
      <circle cx="130" cy="165" r="8" fill="#4F46E5" />
      <circle cx="150" cy="165" r="8" fill="#4F46E5" />

      {/* Question Mark */}
      <g transform="translate(170, 50)">
        <circle r="20" fill="#FBBF24" />
        <text
          x="0"
          y="8"
          textAnchor="middle"
          fill="#1F2937"
          fontSize="24"
          fontWeight="bold"
        >
          ?
        </text>
      </g>
    </svg>
  );
}
// "use client";
// import Link from "next/link";

// export default function NotFound() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
//       <div className="max-w-2xl w-full text-center">
//         {/* Cat SVG Illustration */}
//         <div className="mb-8 animate-bounce-slow">
//           <svg
//             viewBox="0 0 400 400"
//             className="w-full max-w-md mx-auto"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             {/* 404 Text */}
//             <text
//               x="200"
//               y="140"
//               fontSize="120"
//               fontWeight="800"
//               textAnchor="middle"
//               fill="#1e293b"
//               fontFamily="system-ui, -apple-system, sans-serif"
//             >
//               4
//             </text>

//             {/* Cat in the middle "0" */}
//             <g transform="translate(200, 100)">
//               {/* Cat Body */}
//               <ellipse
//                 cx="0"
//                 cy="20"
//                 rx="35"
//                 ry="45"
//                 fill="#f1f5f9"
//                 stroke="#334155"
//                 strokeWidth="2.5"
//               />

//               {/* Cat Head */}
//               <circle
//                 cx="0"
//                 cy="-15"
//                 r="28"
//                 fill="#f1f5f9"
//                 stroke="#334155"
//                 strokeWidth="2.5"
//               />

//               {/* Left Ear */}
//               <path
//                 d="M -20,-35 L -28,-50 L -12,-40 Z"
//                 fill="#f1f5f9"
//                 stroke="#334155"
//                 strokeWidth="2.5"
//                 strokeLinejoin="round"
//               />
//               {/* Right Ear */}
//               <path
//                 d="M 20,-35 L 28,-50 L 12,-40 Z"
//                 fill="#f1f5f9"
//                 stroke="#334155"
//                 strokeWidth="2.5"
//                 strokeLinejoin="round"
//               />

//               {/* Ear inner */}
//               <path d="M -20,-38 L -23,-45 L -16,-40 Z" fill="#fecdd3" />
//               <path d="M 20,-38 L 23,-45 L 16,-40 Z" fill="#fecdd3" />

//               {/* Eyes */}
//               <circle cx="-10" cy="-18" r="3" fill="#334155" />
//               <circle cx="10" cy="-18" r="3" fill="#334155" />
//               <circle cx="-9" cy="-19" r="1.5" fill="#fff" />
//               <circle cx="11" cy="-19" r="1.5" fill="#fff" />

//               {/* Nose */}
//               <path d="M 0,-10 L -3,-6 L 3,-6 Z" fill="#f43f5e" />

//               {/* Mouth */}
//               <path
//                 d="M 0,-6 Q -5,-2 -8,0"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 fill="none"
//                 strokeLinecap="round"
//               />
//               <path
//                 d="M 0,-6 Q 5,-2 8,0"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 fill="none"
//                 strokeLinecap="round"
//               />

//               {/* Whiskers */}
//               <line
//                 x1="-28"
//                 y1="-12"
//                 x2="-45"
//                 y2="-14"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//               <line
//                 x1="-28"
//                 y1="-8"
//                 x2="-45"
//                 y2="-8"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//               <line
//                 x1="28"
//                 y1="-12"
//                 x2="45"
//                 y2="-14"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//               <line
//                 x1="28"
//                 y1="-8"
//                 x2="45"
//                 y2="-8"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />

//               {/* Stripes on head */}
//               <path
//                 d="M -15,-25 Q -10,-28 -5,-25"
//                 stroke="#94a3b8"
//                 strokeWidth="2"
//                 fill="none"
//                 strokeLinecap="round"
//               />
//               <path
//                 d="M 15,-25 Q 10,-28 5,-25"
//                 stroke="#94a3b8"
//                 strokeWidth="2"
//                 fill="none"
//                 strokeLinecap="round"
//               />

//               {/* Collar */}
//               <ellipse cx="0" cy="8" rx="32" ry="6" fill="#f43f5e" />
//               <circle
//                 cx="0"
//                 cy="8"
//                 r="4"
//                 fill="#fbbf24"
//                 stroke="#334155"
//                 strokeWidth="1"
//               />

//               {/* Paws */}
//               <ellipse
//                 cx="-15"
//                 cy="60"
//                 rx="10"
//                 ry="8"
//                 fill="#f1f5f9"
//                 stroke="#334155"
//                 strokeWidth="2"
//               />
//               <ellipse
//                 cx="15"
//                 cy="60"
//                 rx="10"
//                 ry="8"
//                 fill="#f1f5f9"
//                 stroke="#334155"
//                 strokeWidth="2"
//               />

//               {/* Tail */}
//               <path
//                 d="M 30,30 Q 50,20 55,40 Q 58,55 50,60"
//                 stroke="#334155"
//                 strokeWidth="8"
//                 fill="none"
//                 strokeLinecap="round"
//               />
//               <path
//                 d="M 30,30 Q 50,20 55,40 Q 58,55 50,60"
//                 stroke="#f1f5f9"
//                 strokeWidth="5"
//                 fill="none"
//                 strokeLinecap="round"
//               />
//             </g>

//             {/* Second "4" */}
//             <text
//               x="200"
//               y="140"
//               fontSize="120"
//               fontWeight="800"
//               textAnchor="middle"
//               fill="#1e293b"
//               fontFamily="system-ui, -apple-system, sans-serif"
//               transform="translate(140, 0)"
//             >
//               4
//             </text>

//             {/* Decorative elements */}
//             <g transform="translate(100, 280)">
//               {/* Ball of yarn */}
//               <circle
//                 cx="0"
//                 cy="0"
//                 r="18"
//                 fill="#fbbf24"
//                 stroke="#334155"
//                 strokeWidth="2"
//               />
//               <path
//                 d="M -10,-10 Q 0,-15 10,-10"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 fill="none"
//               />
//               <path
//                 d="M -12,0 Q 0,5 12,0"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 fill="none"
//               />
//               <path
//                 d="M -8,8 Q 0,12 8,8"
//                 stroke="#334155"
//                 strokeWidth="1.5"
//                 fill="none"
//               />
//             </g>

//             <g transform="translate(300, 290)">
//               {/* Plant pot */}
//               <path d="M -15,10 L -10,25 L 10,25 L 15,10 Z" fill="#334155" />
//               <ellipse cx="0" cy="10" rx="16" ry="6" fill="#334155" />
//               {/* Leaves */}
//               <path
//                 d="M 0,-10 Q -8,-15 -12,-5"
//                 fill="#22c55e"
//                 stroke="#166534"
//                 strokeWidth="1.5"
//               />
//               <path
//                 d="M 0,-10 Q 8,-18 15,-8"
//                 fill="#22c55e"
//                 stroke="#166534"
//                 strokeWidth="1.5"
//               />
//               <path
//                 d="M 0,-10 Q 5,-20 10,-12"
//                 fill="#22c55e"
//                 stroke="#166534"
//                 strokeWidth="1.5"
//               />
//             </g>
//           </svg>
//         </div>

//         {/* Text Content */}
//         <div className="space-y-4 mb-8">
//           <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
//             Page Not Found
//           </h1>
//           <p className="text-lg text-slate-600 max-w-md mx-auto">
//             Oops! Looks like this curious cat wandered off to a page that
//             doesn't exist.
//           </p>
//         </div>

//         {/* Action Button */}
//         <Link
//           href="/"
//           className="inline-flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
//           </svg>
//           Back to Home
//         </Link>

//         {/* Optional: Additional helpful links */}
//         <div className="mt-8 text-sm text-slate-500">
//           <p>
//             Need help?{" "}
//             <Link
//               href="/contact"
//               className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
//             >
//               Contact support
//             </Link>
//           </p>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes bounce-slow {
//           0%,
//           100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-10px);
//           }
//         }
//         .animate-bounce-slow {
//           animation: bounce-slow 3s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
