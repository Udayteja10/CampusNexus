import { UserBadge } from "@/types/user.types";
import { Award, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileBadgesProps {
  badges?: UserBadge[];
}

export function ProfileBadges({ badges = [] }: ProfileBadgesProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Award className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No Badges Yet</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Participate in academic study groups, campus clubs, and community discussions to earn recognition badges.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {badges.map((ub) => (
        <div
          key={ub.id}
          className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground truncate">
                {ub.badge.name}
              </span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 uppercase">
                {ub.badge.rarity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {ub.badge.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
