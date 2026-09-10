"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewPostsIndicatorProps {
  count: number;
  onClick: () => void;
}

export function NewPostsIndicator({ count, onClick }: NewPostsIndicatorProps) {
  if (count <= 0) return null;

  return (
    <div className="sticky top-16 z-30 flex justify-center w-full my-2 animate-bounce">
      <Button
        onClick={onClick}
        size="sm"
        className="shadow-md bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white rounded-full text-xs font-semibold px-4 py-2 flex items-center gap-1.5 border border-white/10"
      >
        <ArrowUp className="h-3.5 w-3.5" />
        <span>
          {count} {count === 1 ? "new post" : "new posts"} available
        </span>
      </Button>
    </div>
  );
}
