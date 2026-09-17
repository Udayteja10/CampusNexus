"use client";

import { useState } from "react";
import Link from "next/link";
import { User, UserRole } from "@/types/user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditProfileDialog } from "./EditProfileDialog";
import { ROUTES } from "@/lib/constants";
import {
  CalendarDays,
  GraduationCap,
  Shield,
  CheckCircle2,
  Edit3,
  Settings,
  Award,
  Building,
} from "lucide-react";
import { format } from "date-fns";

const ROLE_CONFIG: Record<UserRole, { label: string; className: string; icon: typeof Shield | typeof GraduationCap | null }> = {
  STUDENT: {
    label: "Student",
    className: "bg-[var(--cn-indigo)]/10 text-[var(--cn-indigo)] border-[var(--cn-indigo)]/20",
    icon: null,
  },
  MODERATOR: {
    label: "Moderator",
    className: "bg-[var(--cn-emerald)]/10 text-[var(--cn-emerald)] border-[var(--cn-emerald)]/20",
    icon: Shield,
  },
  ADMIN: {
    label: "Admin",
    className: "bg-[var(--cn-rose)]/10 text-[var(--cn-rose)] border-[var(--cn-rose)]/20",
    icon: GraduationCap,
  },
};

interface ProfileHeaderProps {
  user: User;
  isOwner: boolean;
  onUserUpdated?: (user: User) => void;
}

export function ProfileHeader({ user, isOwner, onUserUpdated }: ProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);

  const roleMeta = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.STUDENT;
  const RoleIcon = roleMeta.icon;

  let formattedDate = "";
  try {
    if (user.createdAt) {
      formattedDate = format(new Date(user.createdAt), "MMMM yyyy");
    }
  } catch {
    formattedDate = "2024";
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Decorative gradient banner */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[var(--cn-indigo)]/15 via-purple-500/10 to-[var(--cn-rose)]/15 -z-0" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6">
        {/* Left: Avatar + Identity */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border-4 border-card shadow-md bg-background shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "CN"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {user.fullName}
              </h1>
              {user.isVerified && (
                <span title="Verified Student" className="inline-flex">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                </span>
              )}
              <Badge variant="outline" className={`gap-1 rounded-full text-xs font-semibold px-2.5 py-0.5 ${roleMeta.className}`}>
                {RoleIcon && <RoleIcon className="h-3 w-3" />}
                {roleMeta.label}
              </Badge>
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              @{user.username}
            </p>

            {(user.department || user.batch) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5">
                {user.department && (
                  <span className="flex items-center gap-1 font-medium text-foreground/80">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.department}
                  </span>
                )}
                {user.department && user.batch && <span>•</span>}
                {user.batch && <span>Batch of {user.batch}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right: Owner Controls or Follow Stats */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {isOwner ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-1.5 rounded-xl border-border hover:border-primary/40 font-semibold"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
              <Link
                href={ROUTES.SETTINGS}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5 rounded-xl font-semibold text-muted-foreground hover:text-foreground"
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-bold text-foreground">{user.followersCount ?? 0}</span> Followers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-foreground">{user.followingCount ?? 0}</span> Following
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bio & Details Section */}
      <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="md:col-span-2 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h3>
          <p className="text-foreground/90 text-sm leading-relaxed">
            {user.bio ? (
              user.bio
            ) : (
              <span className="italic text-muted-foreground">No bio added yet.</span>
            )}
          </p>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h3>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Joined {formattedDate}</span>
              </div>
            )}
            {user.clubLeaderOf && user.clubLeaderOf.length > 0 && (
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Club Leader: {user.clubLeaderOf.map((c) => c.clubName).join(", ")}</span>
              </div>
            )}
            {user.deptCoordinatorOf && user.deptCoordinatorOf.length > 0 && (
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                <span>Coordinator: {user.deptCoordinatorOf.map((d) => d.departmentName).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner edit dialog */}
      {isOwner && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          user={user}
          onUpdated={onUserUpdated}
        />
      )}
    </div>
  );
}
