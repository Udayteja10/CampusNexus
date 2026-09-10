"use client";

import Link from "next/link";
import {
  MessageSquare,
  BookOpen,
  Briefcase,
  Building2,
  Bell,
  CalendarDays,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types/user.types";
import { cn } from "@/lib/utils";

// ─── Quick navigation tiles ───────────────────────────────────────────────────

const quickNav = [
  {
    href: ROUTES.COMMUNITY,
    label: "Community",
    description: "Connect with your campus",
    icon: MessageSquare,
    color: "text-[var(--cn-indigo)]",
    bg: "bg-[var(--cn-indigo)]/10 hover:bg-[var(--cn-indigo)]/15",
    border: "border-[var(--cn-indigo)]/20",
  },
  {
    href: ROUTES.RESOURCES,
    label: "Resources",
    description: "Notes, papers & more",
    icon: BookOpen,
    color: "text-[var(--cn-emerald)]",
    bg: "bg-[var(--cn-emerald)]/10 hover:bg-[var(--cn-emerald)]/15",
    border: "border-[var(--cn-emerald)]/20",
  },
  {
    href: ROUTES.PLACEMENTS,
    label: "Career",
    description: "Placements & internships",
    icon: Briefcase,
    color: "text-[var(--cn-amber)]",
    bg: "bg-[var(--cn-amber)]/10 hover:bg-[var(--cn-amber)]/15",
    border: "border-[var(--cn-amber)]/20",
  },
  {
    href: ROUTES.CLUBS,
    label: "Campus Life",
    description: "Clubs, events & more",
    icon: Building2,
    color: "text-[var(--cn-rose)]",
    bg: "bg-[var(--cn-rose)]/10 hover:bg-[var(--cn-rose)]/15",
    border: "border-[var(--cn-rose)]/20",
  },
];

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_WELCOME: Record<UserRole, { greeting: string; className: string }> = {
  STUDENT: {
    greeting: "Welcome back",
    className: "text-[var(--cn-indigo)]",
  },
  MODERATOR: {
    greeting: "Moderator Dashboard",
    className: "text-[var(--cn-emerald)]",
  },
  ADMIN: {
    greeting: "Admin Dashboard",
    className: "text-[var(--cn-rose)]",
  },
};

// ─── Placeholder card ─────────────────────────────────────────────────────────

function PlaceholderCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="h-4 w-4 text-[var(--cn-indigo)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const roleConfig = ROLE_WELCOME[user.role];
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--cn-indigo)]/20 bg-gradient-to-br from-[var(--cn-indigo)]/8 via-background to-[var(--cn-violet)]/8 p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--cn-indigo)]/8 blur-3xl"
        />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {roleConfig.greeting}
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.department
                ? `${user.department}${user.batch ? ` · ${user.batch}` : ""}`
                : user.email}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "self-start sm:self-auto text-sm px-3 py-1.5 font-medium border",
              user.role === "STUDENT" &&
                "bg-[var(--cn-indigo)]/10 text-[var(--cn-indigo)] border-[var(--cn-indigo)]/20",
              user.role === "MODERATOR" &&
                "bg-[var(--cn-emerald)]/10 text-[var(--cn-emerald)] border-[var(--cn-emerald)]/20",
              user.role === "ADMIN" &&
                "bg-[var(--cn-rose)]/10 text-[var(--cn-rose)] border-[var(--cn-rose)]/20"
            )}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          </Badge>
        </div>
      </div>

      {/* ── Quick navigation ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickNav.map(({ href, label, description, icon: Icon, color, bg, border }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-md",
                bg,
                border
              )}
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-background/60", border)}>
                <Icon className={cn("h-4.5 w-4.5", color)} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", color)}>{label}</p>
                <p className="text-xs text-muted-foreground leading-snug">{description}</p>
              </div>
              <ArrowRight className={cn("h-3.5 w-3.5 self-end opacity-0 transition-opacity group-hover:opacity-100", color)} />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Placeholder cards ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <PlaceholderCard title="Recent Activity" icon={Activity}>
          <div className="space-y-2.5">
            {["Community discussions", "Resource uploads", "Event registrations"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--cn-indigo)]/50 shrink-0" />
                {item}
              </div>
            ))}
            <p className="pt-1 text-xs text-center text-muted-foreground/60">
              Activity feed coming in Phase 3
            </p>
          </div>
        </PlaceholderCard>

        <PlaceholderCard title="Upcoming Events" icon={CalendarDays}>
          <div className="space-y-2.5">
            {["Technical Symposium", "Resume Workshop", "Club Recruitment"].map((event) => (
              <div
                key={event}
                className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--cn-amber)]/60 shrink-0" />
                {event}
              </div>
            ))}
            <p className="pt-1 text-xs text-center text-muted-foreground/60">
              Event module coming in Phase 5
            </p>
          </div>
        </PlaceholderCard>

        <PlaceholderCard title="Notifications" icon={Bell}>
          <div className="space-y-2.5">
            {["Welcome to CampusNexus!", "Profile is incomplete", "Explore the community"].map((note) => (
              <div
                key={note}
                className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--cn-rose)]/60 shrink-0" />
                {note}
              </div>
            ))}
            <p className="pt-1 text-xs text-center text-muted-foreground/60">
              Notification system coming in Phase 6
            </p>
          </div>
        </PlaceholderCard>
      </div>

    </div>
  );
}
