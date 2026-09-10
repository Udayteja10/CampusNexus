"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReactionButtonProps {
  emoji: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function ReactionButton({
  emoji,
  count,
  isActive,
  onClick,
  className,
}: ReactionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "h-8 gap-1.5 px-3 py-1 text-xs rounded-full border border-transparent transition-all",
        isActive
          ? "bg-[var(--cn-indigo)]/10 text-[var(--cn-indigo)] border-[var(--cn-indigo)]/20 hover:bg-[var(--cn-indigo)]/15"
          : "hover:bg-muted text-muted-foreground",
        className
      )}
    >
      <span className="text-sm select-none">{emoji}</span>
      <span className={cn("font-medium", isActive && "font-semibold")}>{count}</span>
    </Button>
  );
}
