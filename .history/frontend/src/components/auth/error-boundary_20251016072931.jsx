// // components/auth/error-boundary.jsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { RefreshCw, Home, ArrowLeft } from "lucide-react";

// export function ErrorBoundary({ error, reset }) {
//   return (
//     <div className="min-h-screen flex items-center justify-center p-6">
//       <div className="max-w-md w-full text-center space-y-6">
//         {/* Error Icon */}
//         <div className="text-6xl">💥</div>

//         {/* Error Message */}
//         <div className="space-y-3">
//           <h2 className="text-2xl font-semibold">Something Went Wrong</h2>
//           <p className="text-muted-foreground">
//             The page crashed unexpectedly. This might be a temporary issue.
//           </p>
//         </div>

//         {/* Action Buttons */}
//         <div className="space-y-3">
//           <Button onClick={reset} className="w-full" size="lg">
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Try Again
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
//               Home
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
