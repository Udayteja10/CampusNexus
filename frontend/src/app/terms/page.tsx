import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: "Terms of Service — CampusNexus",
  description:
    "Read the Terms of Service for CampusNexus, the integrated academic and campus community platform for MLRIT students.",
};

const LAST_UPDATED = "September 2026";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using CampusNexus (&ldquo;the Platform&rdquo;), you agree to
              be bound by these Terms of Service. CampusNexus is an integrated
              academic and campus community platform operated for students, faculty,
              and staff of Mahatma Gandhi Institute of Technology (MLRIT).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you do not agree with any part of these terms, you may not access
              the Platform.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              Access to CampusNexus is restricted to individuals with a valid MLRIT
              institutional email address (<code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">@mlrit.ac.in</code>).
              You must be a current student, faculty member, or authorised staff
              member to create and maintain an account.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. User Accounts</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li className="flex gap-2"><span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>You may not share your account with others or impersonate another person.</li>
              <li className="flex gap-2"><span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>You must notify the platform administrators immediately if you suspect any unauthorised use of your account.</li>
              <li className="flex gap-2"><span className="text-[var(--cn-indigo)] font-bold shrink-0">·</span>Accounts that violate these terms may be suspended or permanently removed.</li>
            </ul>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use CampusNexus only for lawful purposes and in ways
              that do not infringe the rights of others. You must not:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-[var(--cn-rose)] font-bold shrink-0">·</span>Post content that is abusive, harassing, defamatory, or discriminatory.</li>
              <li className="flex gap-2"><span className="text-[var(--cn-rose)] font-bold shrink-0">·</span>Share copyrighted material without proper authorisation.</li>
              <li className="flex gap-2"><span className="text-[var(--cn-rose)] font-bold shrink-0">·</span>Attempt to gain unauthorised access to any part of the Platform.</li>
              <li className="flex gap-2"><span className="text-[var(--cn-rose)] font-bold shrink-0">·</span>Use the Platform to distribute spam, phishing, or malicious content.</li>
              <li className="flex gap-2"><span className="text-[var(--cn-rose)] font-bold shrink-0">·</span>Scrape, crawl, or otherwise harvest data from the Platform without permission.</li>
            </ul>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Content Ownership</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of content you post on CampusNexus. By posting,
              you grant CampusNexus a non-exclusive, royalty-free licence to display
              and distribute your content within the Platform for the purpose of
              operating the service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              CampusNexus reserves the right to remove any content that violates
              these Terms or is otherwise objectionable, without prior notice.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Moderation</h2>
            <p className="text-muted-foreground leading-relaxed">
              CampusNexus employs moderators to help maintain a safe and respectful
              environment. Moderators may remove content, issue warnings, or suspend
              accounts for violations of these Terms. Decisions made by moderators
              are final unless escalated to the platform administrators.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed">
              CampusNexus is provided &ldquo;as is&rdquo; without warranties of any kind.
              We do not guarantee uninterrupted availability, accuracy of
              information, or fitness for a particular purpose. Use of the Platform
              is at your own risk.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              CampusNexus may update these Terms of Service from time to time.
              Continued use of the Platform after any changes constitutes acceptance
              of the revised Terms. We will notify users of significant changes via
              an in-platform announcement.
            </p>
          </section>

          <div className="border-t border-border/50" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms, please contact the platform
              administrators through the{" "}
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
            By using CampusNexus you confirm that you have read and agreed to these Terms of Service.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-[var(--cn-indigo)] hover:underline">
              Privacy Policy
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
