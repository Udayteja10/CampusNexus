import { ReportStatus } from "@/types/moderation.types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function ReportStatusBadge({ status, className = "" }: ReportStatusBadgeProps) {
  switch (status) {
    case "OPEN":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <AlertCircle className="h-3 w-3" />
          Open
        </Badge>
      );
    case "UNDER_REVIEW":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <Clock className="h-3 w-3" />
          Under Review
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
    case "DISMISSED":
      return (
        <Badge
          variant="outline"
          className={`bg-muted text-muted-foreground border-border font-medium text-xs gap-1 py-0.5 px-2 ${className}`}
        >
          <XCircle className="h-3 w-3" />
          Dismissed
        </Badge>
      );
    default:
      return null;
  }
}
