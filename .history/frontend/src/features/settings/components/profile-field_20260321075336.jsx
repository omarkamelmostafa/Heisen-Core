import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone } from "lucide-react";

const ICON_MAP = {
  mail: Mail,
  phone: Phone,
};

export function ProfileField({
  label,
  value,
  icon,
  fullWidth = false,
  multiline = false,
}) {
  const Icon = icon ? ICON_MAP[icon] : null;

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "col-span-full" : ""}`}>
      <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </Label>
      {multiline ? (
        <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm min-h-[80px]">
          {value || "—"}
        </div>
      ) : (
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            value={value || "—"}
            readOnly
            className={`bg-muted/40 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0 ${Icon ? "pl-10" : ""
              }`}
          />
        </div>
      )}
    </div>
  );
}
