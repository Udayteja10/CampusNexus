"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  Building2,
  CalendarDays,
  ShoppingBag,
  SearchIcon,
  Flag,
  Settings,
  Shield,
  UserCog,
  LogOut,
  Bell,
  HelpCircle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, selectIsModerator, selectIsAdmin } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// ─── Same nav structure as AppSidebar (single source of truth candidate) ─────

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const studentNav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: ROUTES.SEARCH, label: "Search", icon: SearchIcon },
      { href: ROUTES.NOTIFICATIONS, label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Community",
    items: [
      { href: ROUTES.COMMUNITY, label: "Community", icon: MessageSquare },
    ],
  },
  {
    label: "Academic",
    items: [
      { href: ROUTES.RESOURCES, label: "Resources", icon: BookOpen },
      { href: ROUTES.FACULTY, label: "Faculty", icon: Users },
    ],
  },
  {
    label: "Career",
    items: [
      { href: ROUTES.PLACEMENTS, label: "Placements", icon: Briefcase },
      { href: ROUTES.INTERNSHIPS, label: "Internships", icon: Star },
      { href: ROUTES.RESUME_REVIEW, label: "Resume Review", icon: FileText },
    ],
  },
  {
    label: "Campus Life",
    items: [
      { href: ROUTES.CLUBS, label: "Clubs", icon: Building2 },
      { href: ROUTES.EVENTS, label: "Events", icon: CalendarDays },
      { href: ROUTES.MARKETPLACE, label: "Marketplace", icon: ShoppingBag },
      { href: ROUTES.LOST_FOUND, label: "Lost & Found", icon: SearchIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: ROUTES.SETTINGS, label: "Settings", icon: Settings },
      { href: ROUTES.HELP, label: "Help & Support", icon: HelpCircle },
    ],
  },
];

const moderatorNav: NavGroup[] = [
  {
    label: "Moderation",
    items: [
      { href: ROUTES.MOD_REPORTS, label: "Reports", icon: Flag },
      { href: ROUTES.MOD_ACTIONS, label: "Actions", icon: Shield },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    label: "Administration",
    items: [
      { href: ROUTES.ADMIN_DASHBOARD, label: "Admin Panel", icon: UserCog },
      { href: ROUTES.ADMIN_USERS, label: "Users", icon: Users },
      { href: ROUTES.ADMIN_REPORTS, label: "Reports", icon: Flag },
    ],
  },
];

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MobileNavProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const isModerator = useAuthStore(selectIsModerator);
  const isAdmin = useAuthStore(selectIsAdmin);

  const navGroups: NavGroup[] = [
    ...studentNav,
    ...(isModerator ? moderatorNav : []),
    ...(isAdmin ? adminNav : []),
  ];

  function handleNavClick() {
    onOpenChange(false);
  }

  function handleLogout() {
    logout();
    onOpenChange(false);
    router.push(ROUTES.LOGIN);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar">
        <SheetHeader className="flex h-14 flex-row items-center justify-between border-b border-sidebar-border px-4 space-y-0">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cn-indigo)]">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              Campus<span className="text-[var(--cn-indigo)]">Nexus</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4" aria-label="Mobile navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
              <ul role="list" className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleNavClick}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          active
                            ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                            : "text-sidebar-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-sidebar-primary" : "text-muted-foreground"
                          )}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Separator className="mt-3 opacity-30" />
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
