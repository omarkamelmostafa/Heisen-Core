// components/auth/auth-right-panel.tsx
export function AuthRightPanel() {
  return (
    <div className="bg-muted h-screen p-5 max-lg:hidden">
      <div className="text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm bg-primary relative h-full justify-between overflow-hidden border-none py-8">
        {/* Header Section */}
        <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 gap-6 px-8">
          <h1 className="text-primary-foreground text-4xl font-bold xl:text-5xl/15.5 leading-tight">
            Welcome back! Please sign in to your Shadcn Studio account
          </h1>
          <p className="text-primary-foreground text-xl leading-relaxed">
            Thank you for registering! Please check your inbox and click the
            verification link to activate your account.
          </p>
        </div>

        {/* Background Decorative SVG */}
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-secondary/10 pointer-events-none absolute bottom-30 -left-50 size-130"
        >
          <path
            d="M63.6734 24.8486V49.3899C63.6734 57.4589 57.1322 64.0001 49.0632 64.0001H25.2041"
            stroke="currentColor"
            strokeWidth="8.11681"
          />
          <path
            d="M64.3266 103.152L64.3266 78.6106C64.3266 70.5416 70.8678 64.0003 78.9368 64.0003L102.796 64.0004"
            stroke="currentColor"
            strokeWidth="8.11681"
          />
          <line
            x1="93.3468"
            y1="35.6108"
            x2="76.555"
            y2="52.205"
            stroke="currentColor"
            strokeWidth="8.11681"
          />
          <line
            x1="51.7697"
            y1="77.0624"
            x2="34.9778"
            y2="93.6567"
            stroke="currentColor"
            strokeWidth="8.11681"
          />
          <line
            x1="50.9584"
            y1="51.3189"
            x2="34.2651"
            y2="34.6256"
            stroke="currentColor"
            strokeWidth="8.11681"
          />
          <line
            x1="93.1625"
            y1="93.6397"
            x2="76.4692"
            y2="76.9464"
            stroke="currentColor"
            strokeWidth="8.11681"
          />
        </svg>

        {/* Content Card */}
        <div className="relative z-10 mx-8 h-62 overflow-hidden rounded-2xl px-0">
          {/* Card Background SVG */}
          <svg
            width="1094"
            height="249"
            viewBox="0 0 1094 249"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute right-0 -z-10 select-none"
          >
            <path
              d="M0.263672 16.8809C0.263672 8.0443 7.42712 0.880859 16.2637 0.880859H786.394H999.115C1012.37 0.880859 1023.12 11.626 1023.12 24.8808L1023.12 47.3809C1023.12 60.6357 1033.86 71.3809 1047.12 71.3809H1069.6C1082.85 71.3809 1093.6 82.126 1093.6 95.3809L1093.6 232.881C1093.6 241.717 1086.43 248.881 1077.6 248.881H16.2637C7.42716 248.881 0.263672 241.717 0.263672 232.881V16.8809Z"
              fill="var(--card)"
            />
          </svg>

          {/* Card Icon */}
          <div className="bg-card absolute top-0 right-0 flex size-15 items-center justify-center rounded-2xl">
          
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-15"
            >
              <path
                d="M63.6734 24.8486V49.3899C63.6734 57.4589 57.1322 64.0001 49.0632 64.0001H25.2041"
                stroke="currentColor"
                strokeWidth="8.11681"
              />
              <path
                d="M64.3266 103.152L64.3266 78.6106C64.3266 70.5416 70.8678 64.0003 78.9368 64.0003L102.796 64.0004"
                stroke="currentColor"
                strokeWidth="8.11681"
              />
              <line
                x1="93.3468"
                y1="35.6108"
                x2="76.555"
                y2="52.205"
                stroke="currentColor"
                strokeWidth="8.11681"
              />
              <line
                x1="51.7697"
                y1="77.0624"
                x2="34.9778"
                y2="93.6567"
                stroke="currentColor"
                strokeWidth="8.11681"
              />
              <line
                x1="50.9584"
                y1="51.3189"
                x2="34.2651"
                y2="34.6256"
                stroke="currentColor"
                strokeWidth="8.11681"
              />
              <line
                x1="93.1625"
                y1="93.6397"
                x2="76.4692"
                y2="76.9464"
                stroke="currentColor"
                strokeWidth="8.11681"
              />
            </svg>
          </div>

          {/* Card Content */}
          <div className="flex flex-col gap-5 p-6">
            <p className="line-clamp-2 pr-12 text-3xl font-bold text-card-foreground">
              Please enter your login details
            </p>
            <p className="line-clamp-2 text-lg text-card-foreground/80">
              Stay connected with shadcn/studio Subscribe now for the latest
              updates and news.
            </p>

            {/* User Avatars Stack */}
            <div className="flex -space-x-4 self-end">
              <div className="relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background size-12">
                <img
                  className="aspect-square size-full"
                  alt="Olivia Sparks"
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png"
                />
              </div>
              <div className="relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background size-12">
                <img
                  className="aspect-square size-full"
                  alt="Howard Lloyd"
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"
                />
              </div>
              <div className="relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background size-12">
                <img
                  className="aspect-square size-full"
                  alt="Hallie Richards"
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
                />
              </div>
              <div className="relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background size-12">
                <div className="bg-muted flex size-full items-center justify-center rounded-full text-xs font-medium">
                  +3695
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
