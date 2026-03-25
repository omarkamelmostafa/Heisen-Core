// frontend/src/features/auth/components/signup/name-fields.jsx
import { FormField } from "@/features/auth/components/forms/form-field";
import { signupContent as content } from "@/lib/config/auth/signup";
import { User } from "lucide-react";

export function NameFields({ isLoading }) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        name="firstname"
        type="text"
        label={content.form.firstName.label}
        placeholder={content.form.firstName.placeholder}
        required
        disabled={isLoading}
        icon={User}
      />

      <FormField
        name="lastname"
        type="text"
        label={content.form.lastName.label}
        placeholder={content.form.lastName.placeholder}
        required
        disabled={isLoading}
        icon={User}
      />
    </div>
  );
}
