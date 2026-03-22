import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { updateProfileSchema } from "@/lib/validations/auth-schemas"

export function ProfileContent({
  initials,
  displayName,
  firstName,
  lastName,
  email,
  isVerified,
  memberSince,
  lastLogin,
  isEditing,
  isSubmitting,
  onEdit,
  onCancel,
  onSave,
  editDefaultValues
}) {
  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: editDefaultValues || { firstname: "", lastname: "" },
  });

  // Sync form with default values when entering edit mode
  React.useEffect(() => {
    if (isEditing && editDefaultValues) {
      form.reset(editDefaultValues);
    }
  }, [isEditing, editDefaultValues, form]);

  return (
    <main className="flex-1 min-w-0 bg-card rounded-xl border border-border p-7 md:p-8 shadow-sm flex flex-col gap-8">
      {/* Section A: Profile Information */}
      <section>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">Profile Information</h2>
          {!isEditing ? (
            <Button variant="default" size="sm" className="gap-1.5 cursor-pointer" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { form.reset(); onCancel(); }} 
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                <span>Cancel</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-1.5 " 
                onClick={form.handleSubmit(onSave)} 
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 mt-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl font-semibold bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-[17px] font-semibold text-foreground tracking-tight">{displayName}</h1>
            <span className="text-[13px] text-muted-foreground">{email}</span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {isVerified ? (
                <Badge variant="outline" className="w-fit text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="w-fit text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950">
                  Unverified
                </Badge>
              )}
              <span className="text-muted-foreground/40 text-xs select-none">·</span>
              <span className="text-xs text-muted-foreground">Joined {memberSince}</span>
              <span className="text-muted-foreground/40 text-xs select-none">·</span>
              <span className="text-xs text-muted-foreground">Last active {lastLogin}</span>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Section B: Personal Information */}
      <section>
        <h3 className="text-sm font-semibold text-foreground tracking-tight mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">First Name</label>
            {!isEditing ? (
              <div className="h-10 flex items-center px-3 bg-muted border border-border rounded-md text-[13.5px] text-foreground">
                {firstName || "—"}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Input 
                  {...form.register("firstname")} 
                  placeholder="Enter first name" 
                  disabled={isSubmitting}
                  className={form.formState.errors.firstname ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {form.formState.errors.firstname && (
                  <p className="text-[11px] text-destructive font-medium">
                    {form.formState.errors.firstname.message}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Last Name</label>
            {!isEditing ? (
              <div className="h-10 flex items-center px-3 bg-muted border border-border rounded-md text-[13.5px] text-foreground">
                {lastName || "—"}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Input 
                  {...form.register("lastname")} 
                  placeholder="Enter last name" 
                  disabled={isSubmitting}
                  className={form.formState.errors.lastname ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {form.formState.errors.lastname && (
                  <p className="text-[11px] text-destructive font-medium">
                    {form.formState.errors.lastname.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
