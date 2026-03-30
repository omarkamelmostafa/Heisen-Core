export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Cat SVG Illustration */}
        <div className="mb-8 animate-bounce-slow">
          <svg
            viewBox="0 0 400 400"
            className="w-full max-w-md mx-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 404 Text */}
            <text
              x="200"
              y="140"
              fontSize="120"
              fontWeight="800"
              textAnchor="middle"
              fill="#1e293b"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              4
            </text>

            {/* Cat in the middle "0" */}
            <g transform="translate(200, 100)">
              {/* Cat Body */}
              <ellipse
                cx="0"
                cy="20"
                rx="35"
                ry="45"
                fill="#f1f5f9"
                stroke="#334155"
                strokeWidth="2.5"
              />

              {/* Cat Head */}
              <circle
                cx="0"
                cy="-15"
                r="28"
                fill="#f1f5f9"
                stroke="#334155"
                strokeWidth="2.5"
              />

              {/* Left Ear */}
              <path
                d="M -20,-35 L -28,-50 L -12,-40 Z"
                fill="#f1f5f9"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Right Ear */}
              <path
                d="M 20,-35 L 28,-50 L 12,-40 Z"
                fill="#f1f5f9"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Ear inner */}
              <path d="M -20,-38 L -23,-45 L -16,-40 Z" fill="#fecdd3" />
              <path d="M 20,-38 L 23,-45 L 16,-40 Z" fill="#fecdd3" />

              {/* Eyes */}
              <circle cx="-10" cy="-18" r="3" fill="#334155" />
              <circle cx="10" cy="-18" r="3" fill="#334155" />
              <circle cx="-9" cy="-19" r="1.5" fill="#fff" />
              <circle cx="11" cy="-19" r="1.5" fill="#fff" />

              {/* Nose */}
              <path d="M 0,-10 L -3,-6 L 3,-6 Z" fill="#f43f5e" />

              {/* Mouth */}
              <path
                d="M 0,-6 Q -5,-2 -8,0"
                stroke="#334155"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 0,-6 Q 5,-2 8,0"
                stroke="#334155"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* Whiskers */}
              <line
                x1="-28"
                y1="-12"
                x2="-45"
                y2="-14"
                stroke="#334155"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="-28"
                y1="-8"
                x2="-45"
                y2="-8"
                stroke="#334155"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="28"
                y1="-12"
                x2="45"
                y2="-14"
                stroke="#334155"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="28"
                y1="-8"
                x2="45"
                y2="-8"
                stroke="#334155"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Stripes on head */}
              <path
                d="M -15,-25 Q -10,-28 -5,-25"
                stroke="#94a3b8"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 15,-25 Q 10,-28 5,-25"
                stroke="#94a3b8"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Collar */}
              <ellipse cx="0" cy="8" rx="32" ry="6" fill="#f43f5e" />
              <circle
                cx="0"
                cy="8"
                r="4"
                fill="#fbbf24"
                stroke="#334155"
                strokeWidth="1"
              />

              {/* Paws */}
              <ellipse
                cx="-15"
                cy="60"
                rx="10"
                ry="8"
                fill="#f1f5f9"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse
                cx="15"
                cy="60"
                rx="10"
                ry="8"
                fill="#f1f5f9"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Tail */}
              <path
                d="M 30,30 Q 50,20 55,40 Q 58,55 50,60"
                stroke="#334155"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 30,30 Q 50,20 55,40 Q 58,55 50,60"
                stroke="#f1f5f9"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Second "4" */}
            <text
              x="200"
              y="140"
              fontSize="120"
              fontWeight="800"
              textAnchor="middle"
              fill="#1e293b"
              fontFamily="system-ui, -apple-system, sans-serif"
              transform="translate(140, 0)"
            >
              4
            </text>

            {/* Decorative elements */}
            <g transform="translate(100, 280)">
              {/* Ball of yarn */}
              <circle
                cx="0"
                cy="0"
                r="18"
                fill="#fbbf24"
                stroke="#334155"
                strokeWidth="2"
              />
              <path
                d="M -10,-10 Q 0,-15 10,-10"
                stroke="#334155"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M -12,0 Q 0,5 12,0"
                stroke="#334155"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M -8,8 Q 0,12 8,8"
                stroke="#334155"
                strokeWidth="1.5"
                fill="none"
              />
            </g>

            <g transform="translate(300, 290)">
              {/* Plant pot */}
              <path d="M -15,10 L -10,25 L 10,25 L 15,10 Z" fill="#334155" />
              <ellipse cx="0" cy="10" rx="16" ry="6" fill="#334155" />
              {/* Leaves */}
              <path
                d="M 0,-10 Q -8,-15 -12,-5"
                fill="#22c55e"
                stroke="#166534"
                strokeWidth="1.5"
              />
              <path
                d="M 0,-10 Q 8,-18 15,-8"
                fill="#22c55e"
                stroke="#166534"
                strokeWidth="1.5"
              />
              <path
                d="M 0,-10 Q 5,-20 10,-12"
                fill="#22c55e"
                stroke="#166534"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Oops! Looks like this curious cat wandered off to a page that
            doesn't exist.
          </p>
        </div>

        {/* Action Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Home
        </a>

        {/* Optional: Additional helpful links */}
        <div className="mt-8 text-sm text-slate-500">
          <p>
            Need help?{" "}
            <a
              href="/contact"
              className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
