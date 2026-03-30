"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// I need to make this compon







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