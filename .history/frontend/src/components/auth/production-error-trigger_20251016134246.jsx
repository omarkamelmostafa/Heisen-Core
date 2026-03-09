// components/auth/production-error-trigger.jsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ProductionErrorTrigger() {
  // Handle button-triggered errors only
  const triggerRealError = () => {
    throw new Error("Real production runtime error - component failure");
  };

  const triggerTypeError = () => {
    const nullObject = null;
    nullObject.someMethod();
  };

  const triggerReferenceError = () => {
    someUndefinedFunction();
  };

  return (
    <div className="fixed bottom-4 left-4 bg-card border border-red-500 rounded-lg p-3 shadow-lg z-50">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <span className="text-xs font-medium">Prod Error Test</span>
        </div>

        <Button
          onClick={triggerRealError}
          size="sm"
          variant="destructive"
          className="w-full h-8 text-xs"
        >
          Runtime Error
        </Button>

        <div className="flex gap-1">
          <Button
            onClick={triggerTypeError}
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs"
          >
            TypeError
          </Button>
          <Button
            onClick={triggerReferenceError}
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs"
          >
            RefError
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Tests real error boundary
        </p>
      </div>
    </div>
  );
}
// // components/auth/production-error-trigger.jsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { AlertTriangle, Link } from "lucide-react";
// import { useSearchParams } from "next/navigation";
// import { useEffect } from "react";

// export function ProductionErrorTrigger() {
//   const searchParams = useSearchParams();

//   // Handle URL-triggered errors
//   useEffect(() => {
//     const triggerError = searchParams.get("test_error");

//     if (triggerError === "boundary") {
//       throw new Error("Production error boundary test triggered via URL");
//     }

//     if (triggerError === "runtime") {
//       throw new Error("URL-triggered runtime error in production");
//     }

//     if (triggerError === "undefined") {
//       // This will cause a runtime error
//       const obj = undefined;
//       console.log(obj.nonExistentProperty);
//     }
//   }, [searchParams]);

//   // Handle button-triggered errors
//   const triggerRealError = () => {
//     throw new Error("Real production runtime error - component failure");
//   };

//   const triggerTypeError = () => {
//     // This will cause a TypeError
//     const nullObject = null;
//     nullObject.someMethod();
//   };

//   const triggerReferenceError = () => {
//     // This will cause a ReferenceError
//     someUndefinedFunction();
//   };

//   return (
//     <div className="fixed bottom-4 left-4 bg-card border border-red-500 rounded-lg p-3 shadow-lg z-50">
//       <div className="text-center space-y-2">
//         <div className="flex items-center justify-center gap-1">
//           <AlertTriangle className="h-3 w-3 text-red-500" />
//           <span className="text-xs font-medium">Prod Error Test</span>
//         </div>

//         <Button
//           onClick={triggerRealError}
//           size="sm"
//           variant="destructive"
//           className="w-full h-8 text-xs"
//         >
//           Runtime Error
//         </Button>

//         <div className="flex gap-1">
//           <Button
//             onClick={triggerTypeError}
//             size="sm"
//             variant="outline"
//             className="flex-1 h-7 text-xs"
//           >
//             TypeError
//           </Button>
//           <Button
//             onClick={triggerReferenceError}
//             size="sm"
//             variant="outline"
//             className="flex-1 h-7 text-xs"
//           >
//             RefError
//           </Button>
//         </div>

//         <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
//           <Link className="h-3 w-3" />
//           <span>URL: ?test_error=boundary</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Test Real Errors in Production:
// // Via URL Parameters:
// // https://yourapp.com/login?test_error=boundary
// // https://yourapp.com/login?test_error=runtime
// // https://yourapp.com/login?test_error=undefined
