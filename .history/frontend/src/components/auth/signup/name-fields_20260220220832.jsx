// frontend/src/components/auth/signup/name-fields.jsx
import { FormField } from "@/components/auth/forms/form-field";
import { signupContent as content } from "@/lib/config/auth/signup";

export function NameFields({ isLoading }) {
  const content = useSignupContent();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        name="firstName"
        type="text"
        label={content.form.firstName.label}
        placeholder={content.form.firstName.placeholder}
        required
        disabled={isLoading}
      />

      <FormField
        name="lastName"
        type="text"
        label={content.form.lastName.label}
        placeholder={content.form.lastName.placeholder}
        required
        disabled={isLoading}
      />
    </div>
  );
}
