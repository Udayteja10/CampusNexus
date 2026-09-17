import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  count: number | string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClassName: string;
  href?: string;
}

export function AdminStatCard({
  title,
  count,
  description,
  icon: Icon,
  colorClassName,
  href,
}: AdminStatCardProps) {
  const content = (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all space-y-3 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          {count}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {href && (
        <div className="flex items-center gap-1 text-xs font-semibold text-primary pt-1 group-hover:translate-x-0.5 transition-transform">
          <span>Manage</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
