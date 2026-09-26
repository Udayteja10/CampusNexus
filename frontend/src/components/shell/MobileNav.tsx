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
      { href: ROUTES.ADMIN_CLUBS, label: "Club Management", icon: Building },
      { href: ROUTES.ADMIN_MODERATION, label: "Moderation Desk", icon: ShieldAlert },
      { href: ROUTES.ADMIN_REPORTS, label: "Reports", icon: Flag },
      { href: ROUTES.ADMIN_SUPPORT, label: "Support Desk", icon: HelpCircle },
      { href: ROUTES.ADMIN_AUDIT, label: "Audit Trail", icon: History },
      { href: ROUTES.ADMIN_CAREER_PLACEMENTS, label: "Placements Mgmt", icon: Briefcase },
      { href: ROUTES.ADMIN_CAREER_INTERNSHIPS, label: "Internships Mgmt", icon: GraduationCap },
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
