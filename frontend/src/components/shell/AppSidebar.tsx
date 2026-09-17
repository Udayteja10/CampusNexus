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
  Building,
  CalendarDays,
  ShoppingBag,
  SearchIcon,
  Flag,
  Settings,
  ShieldAlert,
  History,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Star,
  Compass,
  Trophy,
  Bus,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, selectIsModerator, selectIsAdmin } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// ─── Nav item types ───────────────────────────────────────────────────────────

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

// ─── Navigation definition ────────────────────────────────────────────────────

const studentNav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: ROUTES.COMMUNITY, label: "Community", icon: MessageSquare },
      { href: ROUTES.SEARCH, label: "Search", icon: SearchIcon },
    ],
  },
  {
    label: "Academic",
    items: [
      { href: ROUTES.ACADEMIC, label: "Academic Hub", icon: GraduationCap, exact: true },
      { href: ROUTES.ACADEMIC_RESOURCES, label: "Resources & PYQs", icon: BookOpen },
      { href: ROUTES.ACADEMIC_SUBJECTS, label: "Subjects", icon: FileText },
      { href: ROUTES.ACADEMIC_STUDY_GROUPS, label: "Study Groups", icon: Users },
      { href: ROUTES.ACADEMIC_FACULTY, label: "Faculty Directory", icon: Building2 },
      { href: ROUTES.ACADEMIC_CALENDAR, label: "Academic Calendar", icon: CalendarDays },
      { href: ROUTES.ACADEMIC_WIKI, label: "Campus Wiki", icon: Star },
    ],
  },
  {
    label: "Career",
    items: [
      { href: ROUTES.CAREER, label: "Career Hub", icon: Briefcase, exact: true },
      { href: ROUTES.CAREER_PLACEMENTS, label: "Placements", icon: Building2 },
      { href: ROUTES.CAREER_INTERNSHIPS, label: "Internships", icon: GraduationCap },
      { href: ROUTES.CAREER_APPLICATIONS, label: "My Applications", icon: Star },
      { href: ROUTES.CAREER_COLLECTIONS, label: "Collections", icon: BookOpen },
      { href: ROUTES.CAREER_RESUME_REVIEW, label: "Resume Review", icon: FileText },
    ],
  },
  {
    label: "Campus Life",
    items: [
      { href: ROUTES.CAMPUS_LIFE, label: "Campus Life Hub", icon: Compass, exact: true },
      { href: ROUTES.CAMPUS_LIFE_CLUBS, label: "Clubs", icon: Users },
      { href: ROUTES.CAMPUS_LIFE_EVENTS, label: "Events", icon: CalendarDays },
      { href: ROUTES.CAMPUS_LIFE_SPORTS, label: "Sports", icon: Trophy },
      { href: ROUTES.CAMPUS_LIFE_FACILITIES, label: "Facilities", icon: Building },
      { href: ROUTES.CAMPUS_LIFE_LOST_FOUND, label: "Lost & Found", icon: SearchIcon },
      { href: ROUTES.CAMPUS_LIFE_MARKETPLACE, label: "Marketplace", icon: ShoppingBag },
      { href: ROUTES.CAMPUS_LIFE_TRANSPORT, label: "Transport", icon: Bus },
      { href: ROUTES.CAMPUS_LIFE_HOSTEL, label: "Hostel", icon: Home },
      { href: ROUTES.CAMPUS_LIFE_DIRECTORY, label: "Campus Directory", icon: BookOpen },
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
      { href: ROUTES.ADMIN_MODERATION, label: "Moderation Desk", icon: ShieldAlert },
      { href: ROUTES.ADMIN_REPORTS, label: "Content Reports", icon: Flag },
      { href: ROUTES.ADMIN_SUPPORT, label: "Support Queue", icon: HelpCircle },
      { href: ROUTES.ADMIN_AUDIT, label: "Audit Trail", icon: History },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    label: "Administration",
    items: [
      { href: ROUTES.ADMIN_DASHBOARD, label: "Admin Console", icon: UserCog, exact: true },
      { href: ROUTES.ADMIN_USERS, label: "User Management", icon: Users },
      { href: ROUTES.ADMIN_MODERATION, label: "Moderation Desk", icon: ShieldAlert },
      { href: ROUTES.ADMIN_REPORTS, label: "Reports", icon: Flag },
      { href: ROUTES.ADMIN_SUPPORT, label: "Support Desk", icon: HelpCircle },
      { href: ROUTES.ADMIN_AUDIT, label: "Audit Trail", icon: History },
      { href: ROUTES.ADMIN_CAREER_PLACEMENTS, label: "Placements Mgmt", icon: Briefcase },
      { href: ROUTES.ADMIN_CAREER_INTERNSHIPS, label: "Internships Mgmt", icon: GraduationCap },
    ],
  },
];

// ─── Helper: is route active? ─────────────────────────────────────────────────

function isActive(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── Single nav item (supports collapsed icon-only) ───────────────────────────

function NavItemLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href, item.exact);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed ? "justify-center" : "",
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
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm transition-all duration-150",
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
            </Link>
          }
        />
        <TooltipContent side="right" sideOffset={4}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AppSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
}

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const isModerator = useAuthStore(selectIsModerator);
  const isAdmin = useAuthStore(selectIsAdmin);

  const navGroups: NavGroup[] = [
    ...studentNav,
    ...(isModerator ? moderatorNav : []),
    ...(isAdmin ? adminNav : []),
  ];

  function handleLogout() {
    logout();
    router.push(ROUTES.LOGIN);
  }

  return (
    <aside
      className={cn(
        "sidebar-transition flex h-full flex-col border-r border-sidebar-border bg-sidebar",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-3",
          collapsed ? "justify-center" : "gap-2.5 px-4"
        )}
      >
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg" aria-label="CampusNexus home">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--cn-indigo)]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              Campus<span className="text-[var(--cn-indigo)]">Nexus</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4" aria-label="Sidebar navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <ul role="list" className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItemLink item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
            {collapsed && <Separator className="my-2 opacity-30" />}
          </div>
        ))}
      </nav>

      {/* Bottom: collapse toggle + logout */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* Logout */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        )}

        {/* Collapse toggle (desktop only) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="w-full text-muted-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
