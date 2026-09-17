import Link from "next/link";
import { HELP_CATEGORIES } from "@/services/help/help.seed";
import { HelpCategory } from "@/types/help.types";
import { ROUTES } from "@/lib/constants";
import {
  UserCheck,
  BookOpen,
  MessagesSquare,
  Briefcase,
  Sparkles,
  Search,
  ShieldCheck,
  Cpu,
  HelpCircle,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  BookOpen,
  MessagesSquare,
  Briefcase,
  Sparkles,
  Search,
  ShieldCheck,
  Cpu,
  HelpCircle,
};

interface HelpCategoryGridProps {
  onSelectCategory?: (category: HelpCategory) => void;
  activeCategory?: HelpCategory | "ALL";
}

export function HelpCategoryGrid({ onSelectCategory, activeCategory }: HelpCategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {HELP_CATEGORIES.map((cat) => {
        const IconComponent = ICON_MAP[cat.iconName] || HelpCircle;
        const isSelected = activeCategory === cat.id;

        if (onSelectCategory) {
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{cat.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cat.description}
              </p>
            </button>
          );
        }

        return (
          <Link
            key={cat.id}
            href={`${ROUTES.HELP_FAQ}?category=${cat.id}`}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <IconComponent className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                {cat.label}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {cat.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
