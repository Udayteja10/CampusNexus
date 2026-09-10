import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: "Privacy Policy — CampusNexus",
  description:
    "Learn how CampusNexus collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "September 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          aria-label="CampusNexus home"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cn-indigo)]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Campus<span className="text-[var(--cn-indigo)]">Nexus</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Back link */}
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="space-y-2 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="space-y-8 text-foreground">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              CampusNexus (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting the
              privacy of its users. This Privacy Policy explains what information
              we collect, how we use it, and the choices you have regarding your
              information when you use the CampusNexus platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This platform is operated for the MLRIT campus community and is
              accessible only to individuals with valid institutional credentials.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect the following categories of information:
            </p>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1">
                <p className="text-sm font-semibold">Account Information</p>
                <p className="text-sm text-muted-foreground">
                  Your full name, institutional email address, department, batch year,
                  and profile information you provide during registration or profile setup.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1">
                <p className="text-sm font-semibold">User-Generated Content</p>
                <p className="text-sm text-muted-foreground">
                  Posts, comments, resources, marketplace listings, and other content
                  you create or share on the Platform.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1">
                <p className="text-sm font-semibold">Usage Data</p>
                <p className="text-sm text-muted-foreground">
                  Information about how you interact with the Platform, including pages
                  visited, features used, and time spent. This data is used solely to
                  improve the Platform experience.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>
                To provide, maintain, and improve the CampusNexus platform.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>
                To authenticate your identity and enforce access controls.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>
                To communicate important platform updates and announcements.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>
                To moderate content and ensure compliance with the Terms of Service.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>
                To analyse aggregate usage patterns and improve platform features.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information is visible to other authenticated CampusNexus users
              to the extent determined by your privacy settings and the nature of
              the content (e.g., public posts in the community feed are visible to
              all logged-in users).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Platform administrators and moderators may access your account
              information and content for the purposes of moderation and support.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement reasonable technical and organisational measures to
              protect your information against unauthorised access, alteration,
              disclosure, or destruction. Passwords are stored using industry-standard
              hashing and are never stored in plaintext.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              No method of transmission over the internet or electronic storage is
              100% secure. While we strive to protect your information, we cannot
              guarantee its absolute security.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-[var(--cn-emerald)] font-bold shrink-0">·</span>
                Access the personal information we hold about you.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--cn-emerald)] font-bold shrink-0">·</span>
                Request correction of inaccurate information.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--cn-emerald)] font-bold shrink-0">·</span>
                Request deletion of your account and associated data.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--cn-emerald)] font-bold shrink-0">·</span>
                Object to processing of your data in certain circumstances.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              To exercise any of these rights, please contact us through the{" "}
              <Link
                href="/help-support"
                className="text-[var(--cn-indigo)] hover:underline font-medium"
              >
                Help &amp; Support
              </Link>{" "}
              section.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Cookies and Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              CampusNexus uses browser localStorage and sessionStorage to persist
              your authentication session. No third-party tracking cookies are used.
              Theme preferences are stored locally in your browser.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you
              of significant changes via an in-platform announcement. Continued use
              of the Platform after changes are posted constitutes your acceptance
              of the revised policy.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy, please reach out through the{" "}
              <Link
                href="/help-support"
                className="text-[var(--cn-indigo)] hover:underline font-medium"
              >
                Help &amp; Support
              </Link>{" "}
              section of CampusNexus.
            </p>
          </section>

        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Your privacy matters to us. CampusNexus is committed to handling your data responsibly.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <Link href="/terms" className="text-[var(--cn-indigo)] hover:underline">
              Terms of Service
            </Link>
            <span className="text-border">·</span>
            <Link href="/register" className="text-[var(--cn-indigo)] hover:underline">
              Create Account
            </Link>
            <span className="text-border">·</span>
            <Link href="/login" className="text-[var(--cn-indigo)] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
