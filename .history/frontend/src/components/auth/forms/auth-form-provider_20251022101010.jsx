"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DevTool } from "@hookform/devtools";

export function AuthFormProvider({
  children,
  schema,
  defaultValues = {},
  onSubmit,
  className = "",
}) {
  const { control, handleSubmit, register } = useForm();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
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
      <DevTool /> {/* Render the DevTool component */}
    </FormProvider>
  );
}
