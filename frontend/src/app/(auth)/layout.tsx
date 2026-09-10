import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, BookOpen, Users, Briefcase, Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PublicRoute } from "@/components/auth/PublicRoute";

export const metadata: Metadata = {
  title: {
    default: "Sign In — CampusNexus",
    template: "%s — CampusNexus",
  },
};

const highlights = [
  { icon: BookOpen, text: "Academic Resources" },
  { icon: Users, text: "Campus Community" },
  { icon: Briefcase, text: "Career Opportunities" },
  { icon: Building2, text: "Campus Life" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Brand panel (hidden on mobile) ── */}
      <div className="relative hidden w-[480px] shrink-0 flex-col justify-between overflow-hidden bg-[var(--cn-indigo)] p-10 lg:flex">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-[var(--cn-violet)]/40 blur-3xl"
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Campus<span className="text-white/70">Nexus</span>
          </span>
        </Link>

        {/* Centre copy */}
        <div className="z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold leading-tight text-white">
              Your campus,<br />all in one place.
            </h1>
            <p className="text-base text-white/70 leading-relaxed">
              Connect with peers, access academic resources, explore
              career opportunities and discover campus life — together.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="z-10 text-xs text-white/40">
          MLRIT Institutional Platform — for students, by students.
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-1 flex-col">
        {/* Top bar for form panel */}
        <header className="flex h-14 items-center justify-between border-b border-border/50 px-4 sm:px-8">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cn-indigo)]">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              Campus<span className="text-[var(--cn-indigo)]">Nexus</span>
            </span>
          </Link>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </header>

        {/* Page content — PublicRoute redirects authenticated users to /dashboard */}
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <PublicRoute>{children}</PublicRoute>
        </main>
      </div>
    </div>
  );
}
