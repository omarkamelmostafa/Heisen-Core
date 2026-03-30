// components/auth/error-boundary.jsx
"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Home, ArrowLeft, AlertCircle } from "lucide-react";

export function ErrorBoundary({ error, reset }) {
  const errorMessage =
    error?.message ||
    "Oops, something went wrong on our end. Please try again later.";
  const errorTitle = error?.title || "Something Went Wrong";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            {errorTitle}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={reset} className="w-full" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
// // components/auth/error-boundary.jsx
// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   RefreshCw,
//   Home,
//   ArrowLeft,
//   Target,
//   AlertTriangle,
// } from "lucide-react";

// export function ErrorBoundary({ error, reset, customMessage, rouletteResult }) {
//   return (
//     <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-orange-50">
//       <div className="max-w-md w-full text-center space-y-6">
//         {/* Russian Roulette Info */}
//         {rouletteResult && (
//           <div className="bg-white border-2 border-red-200 rounded-lg p-4 mb-4">
//             <div className="flex items-center justify-center gap-2 mb-2">
//               <Target className="h-5 w-5 text-red-500" />
//               <span className="font-bold text-red-600">
//                 RUSSIAN ROULETTE RESULT
//               </span>
//             </div>
//             <p className="text-sm">
//               Chamber:{" "}
//               <span className="font-bold">{rouletteResult.chamber}</span> |
//               Trigger:{" "}
//               <span className="font-bold">{rouletteResult.trigger}</span>
//             </p>
//             <p className="text-xs text-muted-foreground mt-1">
//               💥 You hit the bullet! Better luck next time!
//             </p>
//           </div>
//         )}

//         {/* Fun Error Icon */}
//         <div className="text-8xl animate-bounce">
//           {customMessage?.emoji || "💥"}
//         </div>

//         {/* Dramatic Error Message */}
//         <div className="space-y-3">
//           <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
//             {customMessage?.message || "Critical System Failure!"}
//           </h2>
//           <p className="text-muted-foreground text-lg">
//             Refresh or restart: Try refreshing your browser tab or restarting
//             the app you are using.
//           </p>
//         </div>

//         {/* Action Buttons */}
//         <div className="space-y-3">
//           <Button
//             onClick={reset}
//             className="w-full"
//             size="lg"
//             variant="destructive"
//           >
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Spin Again & Retry
//           </Button>

//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               onClick={() => window.history.back()}
//               className="flex-1"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Go Back
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => (window.location.href = "/")}
//               className="flex-1"
//             >
//               <Home className="h-4 w-4 mr-2" />
//               Go Home
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
