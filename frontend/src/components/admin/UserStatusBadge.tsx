import { UserAccountStatus } from "@/types/moderation.types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldAlert, Ban } from "lucide-react";

interface UserStatusBadgeProps {
  status: UserAccountStatus;
  className?: string;
}

export function UserStatusBadge({ status, className = "" }: UserStatusBadgeProps) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <Ban className="h-3 w-3" />
          Suspended
        </Badge>
      );
    case "RESTRICTED":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <ShieldAlert className="h-3 w-3" />
          Restricted
        </Badge>
      );
    default:
      return null;
  }
}
