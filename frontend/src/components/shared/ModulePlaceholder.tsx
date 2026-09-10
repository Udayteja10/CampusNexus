import type { ReactNode } from "react";
import { Construction } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  phase?: string;
}

/**
 * Reusable placeholder for unimplemented module pages.
 */
export function ModulePlaceholder({
  title,
  description = "This module is coming in a future phase.",
  icon,
  phase,
}: ModulePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--cn-indigo)]/10 mb-5">
        {icon ?? <Construction className="h-8 w-8 text-[var(--cn-indigo)]" />}
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-sm">{description}</p>
      {phase && (
        <span className="mt-4 inline-block rounded-full border border-[var(--cn-indigo)]/20 bg-[var(--cn-indigo)]/8 px-3 py-1 text-xs font-medium text-[var(--cn-indigo)]">
          {phase}
        </span>
      )}
    </div>
  );
}
