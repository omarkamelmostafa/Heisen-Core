"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// I need to make this component reusable so I can use it in the login and signup forms

export default AuthInput = ({ isLoading }) => {

  return (
    <Fra>
      <Label htmlFor="userEmail" className="text-sm font-medium">
        Email address*
      </Label>
      <Input
        id="userEmail"
        type="email"
        placeholder="Enter your email address"
        required
        disabled={isLoading}
        className="w-full"
      />
    </Fra>
  );
};

<Label htmlFor="userEmail" className="text-sm font-medium">
                Email address*
              </Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                className="w-full"
              />