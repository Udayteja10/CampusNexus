"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  GraduationCap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types/user.types";

// ─── Role badge config ────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  STUDENT: {
    label: "Student",
    className:
      "bg-[var(--cn-indigo)]/10 text-[var(--cn-indigo)] border-[var(--cn-indigo)]/20",
  },
  MODERATOR: {
    label: "Moderator",
    className:
      "bg-[var(--cn-emerald)]/10 text-[var(--cn-emerald)] border-[var(--cn-emerald)]/20",
  },
  ADMIN: {
    label: "Admin",
    className:
      "bg-[var(--cn-rose)]/10 text-[var(--cn-rose)] border-[var(--cn-rose)]/20",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const roleConfig = ROLE_CONFIG[user.role];
  const initials = getInitials(user.fullName);
  const profileHref = ROUTES.PROFILE(user.username);

  function handleLogout() {
    logout();
    router.push(ROUTES.LOGIN);
  }

  return (
    <DropdownMenu>
      {/* Trigger: renders as a plain button — base-ui uses render prop for custom elements */}
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Profile menu for ${user.fullName}`}
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[var(--cn-indigo)]/15 text-[var(--cn-indigo)] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-28 truncate sm:block">
              {user.fullName.split(" ")[0]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        }
      />

      <DropdownMenuContent align="end" className="w-56" sideOffset={6}>
        {/* User info header — DropdownMenuLabel must live inside a DropdownMenuGroup
            because it maps to MenuPrimitive.GroupLabel which requires MenuGroupContext */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-3 px-1 py-2">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-[var(--cn-indigo)]/15 text-[var(--cn-indigo)] text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground leading-tight">
                  {user.email}
                </p>
                <Badge
                  variant="outline"
                  className={`mt-1 text-[10px] px-1.5 py-0 ${roleConfig.className}`}
                >
                  {user.role === "MODERATOR" && (
                    <Shield className="mr-0.5 h-2.5 w-2.5" />
                  )}
                  {user.role === "ADMIN" && (
                    <GraduationCap className="mr-0.5 h-2.5 w-2.5" />
                  )}
                  {roleConfig.label}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Profile link — render as an anchor tag */}
          <DropdownMenuItem
            render={
              <Link href={profileHref} className="flex w-full items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            }
          />
          {/* Settings link */}
          <DropdownMenuItem
            render={
              <Link href={ROUTES.SETTINGS} className="flex w-full items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            }
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign Out — standalone item also requires MenuGroupContext */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
