// components/login-card.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Send,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(data) {
    console.log("Login data:", data);
    // Handle login logic here
  }

  return (
    <div className="w-full max-w-md">
      {/* Header Brand */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white dark:bg-white dark:text-black size-8 rounded-md flex items-center justify-center font-bold text-sm">
            S/S
          </div>
          <span className="font-semibold text-lg">shaden/studio</span>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
          <CardDescription className="text-base">
            Please sign in to your Shaden Studio account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Verification Banner */}
          {!isVerified && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Verify your email 💸
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Account activation link sent to your email address.
                    <br />
                    <span className="font-medium">johndoe@gmail.com</span>,
                    Please follow the link inside to continue.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Skip for now
                    </Button>
                    <Button size="sm" className="text-xs h-8 gap-1">
                      <Send className="size-3" />
                      Resend
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          placeholder="johndoe@gmail.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 size-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        {/* <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        /> */}
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Button variant="link" className="px-0 text-sm h-auto">
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" className="w-full gap-2">
                Sign In
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4">
          <Separator />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Stay connected with shaden/studio Subscribe now for the latest
              updates and news.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">
                Learn More
              </Button>
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
