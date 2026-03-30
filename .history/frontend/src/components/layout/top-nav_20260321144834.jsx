"use client"

import * as React from "react"
import { 
  Search, 
  Bell, 
  MessageSquare, 
  ChevronDown, 
  LogOut,
  Settings,
  CreditCard
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./theme-toggle"

export function TopNav({ initials, displayName, onLogout }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center px-7 gap-5">
        {/* Logo area */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-sm font-bold tracking-wider uppercase text-foreground">
            Core
          </span>
        </div>

        <Separator orientation="vertical" className="h-3.5 " /> {/* TODO: I need to lower its height */}

        {/* Search area */}
        <div className="flex-1 max-w-[480px] mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input 
            placeholder="Search" 
            className="w-full pl-9 h-9 bg-muted border-border focus-visible:ring-1" 
          />
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
              4
            </span>
          </Button>

          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <MessageSquare className="h-[18px] w-[18px]" />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
              1
            </span>
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2.5 py-1.5 h-auto">
                <Avatar className="h-[30px] w-[30px]">
                  <AvatarFallback className="text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13.5px] font-medium whitespace-nowrap">
                  {displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-60">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 font-normal">Soon</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-60">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 font-normal">Soon</Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
