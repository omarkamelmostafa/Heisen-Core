"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  MessageCircle,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  if (!isAuthenticated) return null;

  const initials = `${(user?.firstname?.[0] || "").toUpperCase()}${(user?.lastname?.[0] || "").toUpperCase()}` || "U";
  const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "User";

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background">
      <div className="flex h-full items-center px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold tracking-tight">Starter Kit</span>
        </Link>

        <Separator orientation="vertical" className="h-6" />

        {/* Search */}
        <div className="relative hidden sm:flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9 h-8 text-sm bg-muted/40"
            readOnly
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right stack */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <MessageCircle className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1 hidden md:block" />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.profilePicture || ""} alt={fullName} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {fullName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline-block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => router.push("/settings/profile")}
                className={pathname === "/settings/profile" ? "bg-accent" : ""}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push("/settings/profile")}
                className={pathname === "/settings/profile" ? "bg-accent" : ""}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // We'll wire logout in a later batch
                  router.push("/login");
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
