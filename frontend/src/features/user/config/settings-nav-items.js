import { User, Lock, MessageSquare, Settings2, BellRing } from "lucide-react";

export const SETTINGS_NAV_ITEMS = [
  { id: "profile", label: "My Profile", icon: User, disabled: false },
  { id: "security", label: "Security Options", icon: Lock, disabled: false },
  { id: "chat", label: "Chat", icon: MessageSquare, disabled: true },
  { id: "preferences", label: "Preferences", icon: Settings2, disabled: true },
  { id: "notifications", label: "Notifications", icon: BellRing, disabled: true },
];
