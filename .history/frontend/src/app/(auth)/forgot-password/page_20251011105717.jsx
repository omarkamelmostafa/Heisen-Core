// app/(auth)/forgot-password/page.jsx
"use "
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8">
      <div className="flex w-full flex-col gap-6 sm:max-w-lg">
        {/* Header with Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted"></div>
          <h2 className="text-3xl font-bold">Forgot Password</h2>
        </div>
      </div>
    </div>
  );
}
