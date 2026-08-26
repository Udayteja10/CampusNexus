import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ROUTES, APP_DESCRIPTION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Users,
  BookOpen,
  Briefcase,
  Building2,
  ArrowRight,
  MessageSquare,
  Trophy,
  CalendarDays,
} from "lucide-react";

// ─── Feature card data ────────────────────────────────────────────────────────
const features = [
  {
    icon: MessageSquare,
    title: "Community",
    description:
      "Connect through channels, posts, and real-time direct messages. Anonymous posting supported.",
    color: "text-[var(--cn-indigo)]",
    bg: "bg-[var(--cn-indigo)]/10",
  },
  {
    icon: BookOpen,
    title: "Academic Hub",
    description:
      "Share notes, papers, lab manuals and e-books. Request resources and collaborate in study groups.",
    color: "text-[var(--cn-emerald)]",
    bg: "bg-[var(--cn-emerald)]/10",
  },
  {
    icon: Briefcase,
    title: "Career Centre",
    description:
      "Explore placement and internship experiences, review resumes, and access smart collections.",
    color: "text-[var(--cn-amber)]",
    bg: "bg-[var(--cn-amber)]/10",
  },
  {
    icon: Building2,
    title: "Campus Life",
    description:
      "Discover clubs, events, marketplace listings, lost & found, and the academic calendar.",
    color: "text-[var(--cn-rose)]",
    bg: "bg-[var(--cn-rose)]/10",
  },
  {
    icon: Users,
    title: "Faculty Profiles",
    description:
      "Browse department faculty, view their subjects, and submit anonymous professor reviews.",
    color: "text-[var(--cn-sky)]",
    bg: "bg-[var(--cn-sky)]/10",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description:
      "Earn badges for contributions, mentorship, and campus engagement milestones.",
    color: "text-[var(--cn-violet)]",
    bg: "bg-[var(--cn-violet)]/10",
  },
];

const capabilities = [
  { label: "Academic Resources", icon: BookOpen },
  { label: "Campus Community", icon: Users },
  { label: "Career Opportunities", icon: Briefcase },
  { label: "Campus Life", icon: Building2 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cn-indigo)]">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Campus<span className="text-[var(--cn-indigo)]">Nexus</span>
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={ROUTES.LOGIN}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-[var(--cn-indigo)] text-white hover:bg-[var(--cn-indigo)]/90"
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-6 lg:px-8">
          {/* Background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center"
          >
            <div className="h-[500px] w-[900px] rounded-full bg-[var(--cn-indigo)]/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--cn-indigo)]/30 bg-[var(--cn-indigo)]/10 px-4 py-1.5 text-sm font-medium text-[var(--cn-indigo)]">
              <GraduationCap className="h-3.5 w-3.5" />
              Built for your campus
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-gradient">Campus</span>
              <span className="text-foreground">Nexus</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {APP_DESCRIPTION}. Everything your campus community needs —
              academics, career, clubs, and more — in one platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={ROUTES.REGISTER}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-2 bg-[var(--cn-indigo)] px-8 text-base text-white hover:bg-[var(--cn-indigo)]/90"
                )}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-8 text-base"
                )}
              >
                Sign In to Your Account
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {capabilities.map(({ label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cn-indigo)]/10 ring-1 ring-[var(--cn-indigo)]/20">
                  <Icon className="h-5 w-5 text-[var(--cn-indigo)]" />
                </div>
                <p className="text-sm font-medium leading-tight text-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything your campus needs
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                CampusNexus integrates academics, community, career and campus
                life into a single, unified platform.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description, color, bg }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--cn-indigo)]/40 hover:shadow-md"
                >
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-[var(--cn-indigo)] p-10 text-center shadow-xl">
            <div className="mb-2 flex justify-center">
              <CalendarDays className="h-8 w-8 text-white/70" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-white">
              Join your campus community
            </h2>
            <p className="mb-8 text-white/75">
              Sign up with your institutional email and start connecting with
              peers, resources and opportunities today.
            </p>
            <Link
              href={ROUTES.REGISTER}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 gap-2 bg-white px-8 text-base font-semibold text-[var(--cn-indigo)] hover:bg-white/90"
              )}
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cn-indigo)]">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">
              Campus<span className="text-[var(--cn-indigo)]">Nexus</span>
            </span>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} CampusNexus. Built for students, by students.
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
