"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  MailOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants";

// ─── Validation Schema ────────────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine(
      (v) => v.toLowerCase().endsWith("@mlrit.ac.in"),
      "Only @mlrit.ac.in institutional email addresses are allowed"
    ),
});

type ForgotSchema = z.infer<typeof forgotSchema>;

// ─── Mock submit ──────────────────────────────────────────────────────────────

async function mockForgotPassword(email: string): Promise<void> {
  void email; // Intentionally unused — replace with real API call later
  // Simulate API delay — replace with real Axios call later
  await new Promise((r) => setTimeout(r, 900));
  // Always succeeds in mock (don't leak whether email exists)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotSchema) {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await mockForgotPassword(data.email);
      setSent(true);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-slide-up space-y-7">
      {/* Back link */}
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Back to sign in"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Sign In
      </Link>

      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your institutional email and we&apos;ll send a reset link.
        </p>
      </div>

      {/* Success state */}
      {sent ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--cn-emerald)]/30 bg-[var(--cn-emerald)]/10 px-6 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cn-emerald)]/20">
              <MailOpen className="h-7 w-7 text-[var(--cn-emerald)]" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Check your email</p>
              <p className="text-sm text-muted-foreground">
                If <span className="font-medium text-foreground">{getValues("email")}</span>{" "}
                is registered, you will receive a password reset link shortly.
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-medium text-[var(--cn-indigo)] hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      ) : (
        <>
          {/* Error */}
          {apiError && (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
            aria-label="Password reset form"
          >
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Institutional Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@mlrit.ac.in"
                aria-describedby={errors.email ? "forgot-email-error" : undefined}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="forgot-email-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-[var(--cn-indigo)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
