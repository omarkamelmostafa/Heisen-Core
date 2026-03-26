// frontend/src/features/user/config/settings-nav-items.js
import { User, Lock, MessageSquare, Settings2, BellRing } from "lucide-react";

export const SETTINGS_NAV_ITEMS = [
  { id: "profile", label: "My Profile", icon: User, disabled: false, href: "/settings/profile" },
  { id: "security", label: "Security Options", icon: Lock, disabled: false, href: "/settings/security" },
  { id: "chat", label: "Chat", icon: MessageSquare, disabled: true, href: "#" },
  { id: "preferences", label: "Preferences", icon: Settings2, disabled: true, href: "#" },
  { id: "notifications", label: "Notifications", icon: BellRing, disabled: true, href: "#" },
];
