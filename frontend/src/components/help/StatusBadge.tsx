import { SupportRequestStatus } from "@/types/help.types";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: SupportRequestStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  switch (status) {
    case "OPEN":
      return (
        <Badge
          variant="outline"
          className={`bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <AlertCircle className="h-3 w-3" />
          Open
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <CheckCircle2 className="h-3 w-3" />
          Resolved
        </Badge>
      );
    case "CLOSED":
      return (
        <Badge
          variant="outline"
          className={`bg-muted text-muted-foreground border-border font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <XCircle className="h-3 w-3" />
          Closed
        </Badge>
      );
    default:
      return null;
  }
}
