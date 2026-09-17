import Link from "next/link";
import { SupportRequest } from "@/types/help.types";
import { HELP_CATEGORIES } from "@/services/help/help.seed";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { ROUTES } from "@/lib/constants";
import { format } from "date-fns";
import { MessageSquare, ArrowRight } from "lucide-react";

interface SupportRequestCardProps {
  request: SupportRequest;
}

export function SupportRequestCard({ request }: SupportRequestCardProps) {
  const categoryMeta = HELP_CATEGORIES.find((c) => c.id === request.category);

  let formattedDate = "";
  try {
    formattedDate = format(new Date(request.createdAt), "MMM d, yyyy • h:mm a");
  } catch {
    formattedDate = "Recently";
  }

  const messagesCount = request.messages?.length ?? 0;

  return (
    <Link
      href={ROUTES.HELP_REQUEST_DETAIL(request.id)}
      className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all group space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            #{request.id}
          </span>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-xs font-medium text-foreground/80">
            {categoryMeta?.label || request.category}
          </span>
          <PriorityBadge priority={request.priority} />
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {request.subject}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {request.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
        <span>Created {formattedDate}</span>
        <div className="flex items-center gap-3">
          {messagesCount > 0 && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              {messagesCount} {messagesCount === 1 ? "update" : "updates"}
            </span>
          )}
          <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
