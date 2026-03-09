"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Fragment } from "react/cjs/react.production";

// I need to make this component reusable so I can use it in the login and signup forms

export default AuthInput = ({ 
  htmlFor,
  required,
  label,
  id,
  type,
  placeholder,
  disabled,
  className,
  ...props 


}) => {

  return (
    <>
      <Label htmlFor="userEmail" className="text-sm font-medium">
         ${label}{${required ? "*" : ""}} 
         
      </Label>
      <Input
        id="userEmail"
        type="email"
        placeholder="Enter your email address"
        required
        disabled={isLoading}
        className="w-full"
      />
    </>
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