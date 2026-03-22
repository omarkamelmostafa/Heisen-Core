"use client";

import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, MapPin, Camera } from "lucide-react";
import { ProfileField } from "@/features/settings/components/profile-field";

export function ProfileContent() {
  const user = useSelector((state) => state.auth?.user);

  const initials = `${(user?.firstname?.[0] || "").toUpperCase()}${(user?.lastname?.[0] || "").toUpperCase()}` || "U";
  const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "User";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar with camera overlay */}
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profilePicture || ""} alt={fullName} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
                  aria-label="Change avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight">{fullName}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {user?.role || "Member"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {user?.city || "Location not set"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold">Personal Details</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update your personal information and contact details.
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="First Name" value={user?.firstname} />
            <ProfileField label="Last Name" value={user?.lastname} />
            <ProfileField label="Email Address" value={user?.email} icon="mail" />
            <ProfileField label="Phone Number" value={user?.phone || "Not set"} icon="phone" />
          </div>

          <ProfileField
            label="Bio"
            value={user?.bio || "No bio added yet."}
            fullWidth
            multiline
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="Gender" value={user?.gender || "Not set"} />
            <ProfileField label="Date of Birth" value={user?.dateOfBirth || "Not set"} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
