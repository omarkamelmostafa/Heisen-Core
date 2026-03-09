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
  mode = "onTouched",
  reValidateMode = "onChange",
  shouldFocusError = true,
}) {
  // Ensure default values are properly set, especially for checkboxes
  const safeDefaultValues = {
    ...defaultValues,
    rememberMe: defaultValues.rememberMe || false,
    terms: defaultValues.terms || false,
  };

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: safeDefaultValues,
    mode,
    reValidateMode,
    shouldFocusError,
    criteriaMode: "firstError",
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      // You can add toast notifications here if needed
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

User Input → FormField Component → React Hook Form → Zod Validation → Form State → Submission
     ↓              ↓                    ↓               ↓              ↓           ↓
  Typing      Register Field       Update State     Validate Rules   Error State   API Call



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
