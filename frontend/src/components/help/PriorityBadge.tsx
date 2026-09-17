import { SupportRequestPriority } from "@/types/help.types";
import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: SupportRequestPriority;
  className?: string;
}

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  switch (priority) {
    case "HIGH":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium text-[11px] py-0.5 px-2 ${className}`}
        >
          High Priority
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-[11px] py-0.5 px-2 ${className}`}
        >
          Medium Priority
        </Badge>
      );
    case "LOW":
      return (
        <Badge
          variant="outline"
          className={`bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 font-medium text-[11px] py-0.5 px-2 ${className}`}
        >
          Low Priority
        </Badge>
      );
    default:
      return null;
  }
}
