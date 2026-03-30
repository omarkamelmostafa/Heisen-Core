// components/auth/forms/auth-form-provider.jsx

"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function AuthFormProvider({
  children,
  schema,
  defaultValues = {},
  onSubmit,
  className = "",
  mode = "onTouched", // Changed to onTouched for better UX
  reValidateMode = "onChange", // Re-validate on change after first validation
  shouldFocusError = true,
}) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    reValidateMode,
    shouldFocusError,
    criteriaMode: "firstError", // Show first error only
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

// "use client";

// import { FormProvider, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// export function AuthFormProvider({
//   children,
//   schema,
//   defaultValues = {},
//   onSubmit,
//   className = "",
//   mode = "onChange", // or "onBlur", "onSubmit", "all"
// }) {
//   const methods = useForm({
//     resolver: zodResolver(schema),
//     defaultValues,
//     mode,
//   });

//   return (
//     <FormProvider {...methods}>
//       <form
//         onSubmit={methods.handleSubmit(onSubmit)}
//         className={className}
//         noValidate
//       >
//         {children}
//       </form>
//     </FormProvider>
//   );
// }
// "use client";

// import { FormProvider, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { DevTool } from "@hookform/devtools";

// export function AuthFormProvider({
//   children,
//   schema,
//   defaultValues = {},
//   onSubmit,
//   className = "",
// }) {
//   const { control, handleSubmit, register } = useForm();

//   const methods = useForm({
//     resolver: zodResolver(schema),
//     defaultValues,
//     mode: "onChange",
//   });

//   return (
//     <FormProvider {...methods}>
//       <form
//         onSubmit={methods.handleSubmit(onSubmit)}
//         className={className}
//         noValidate
//       >
//         {children}
//       </form>
//         <DevTool control={control} /> {/* Render the DevTool component */}
//     </FormProvider>
//   );
// }
