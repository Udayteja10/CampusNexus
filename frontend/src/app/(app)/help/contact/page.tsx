"use client";

import Link from "next/link";
import { SupportRequestForm } from "@/components/help/SupportRequestForm";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, Send, ShieldCheck, Clock, FileCheck2 } from "lucide-react";

export default function ContactSupportPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-3">
        <Link
          href={ROUTES.HELP}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Help Center
        </Link>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Send className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Contact Campus Support
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Submit a support ticket and track its status from My Support Requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Request Form */}
        <div className="lg:col-span-2">
          <SupportRequestForm />
        </div>

        {/* Support Info Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>Response Process</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Support requests are triaged directly by student support coordinators and department moderators. You can monitor responses in your tickets timeline.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Private & Secure</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your inquiries and attached details are strictly confidential and will never be shared with other students or indexed in search.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <FileCheck2 className="h-4 w-4 text-indigo-500" />
              <span>Have Existing Tickets?</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check ongoing inquiries and status updates under My Support Requests.
            </p>
            <div className="pt-1">
              <Link
                href={ROUTES.HELP_REQUESTS}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View My Requests →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
