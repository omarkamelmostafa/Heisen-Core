// frontend/src/components/auth/signup/password-fields.jsx
import { FormField } from "@/components/auth/forms/form-field";
import { signupContent as content } from "@/lib/config/auth/signup";

export function PasswordFields({
  showPassword,
  showConfirmPassword,
  isLoading,
  onTogglePassword,
  onToggleConfirmPassword,
}) {

  return (
    <>
      <FormField
        name="password"
        type={showPassword ? "text" : "password"}
        label={content.form.password.label}
        placeholder={content.form.password.placeholder}
        required
        disabled={isLoading}
        showPasswordToggle={true}
        onTogglePassword={onTogglePassword}
      />

      <FormField
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        label={content.form.confirmPassword.label}
        placeholder={content.form.confirmPassword.placeholder}
        required
        disabled={isLoading}
        showPasswordToggle={true}
        onTogglePassword={onToggleConfirmPassword}
      />
    </>
  );
}
