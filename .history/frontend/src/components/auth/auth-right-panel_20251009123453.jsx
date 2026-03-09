// // components/auth/auth-right-panel.jsx
// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";

// export function AuthRightPanel() {
//   const [userCount, setUserCount] = useState(1247); // Mock data - replace with real API

//   // Simulate live user count updates
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setUserCount((prev) => prev + Math.floor(Math.random() * 3));
//     }, 10000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="flex-1 flex flex-col justify-center items-center p-8">
//       <div className="max-w-md mx-auto text-center">
//         <h1 className="text-3xl font-bold tracking-tight mb-4">
//           Welcome back!
//         </h1>
//         <p className="text-lg text-muted-foreground mb-6">
//           Please sign in to your Shadcn Studio account
//         </p>

//         <div className="my-8 p-6 bg-background/50 rounded-lg border">
//           <p className="text-sm text-muted-foreground">
//             Thank you for registering! Please check your inbox and click the
//             verification link to activate your account.
//           </p>
//         </div>

//         <div className="space-y-4 text-sm text-muted-foreground">
//           <p>Stay connected with shaden/studio</p>
//           <p>Subscribe now for the latest updates and news.</p>
//         </div>

//         {/* Live User Count */}
//         <div className="mt-12 pt-8 border-t">
//           <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//             <span>{userCount.toLocaleString()} users online now</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
