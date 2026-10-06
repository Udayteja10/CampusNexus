"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants";
import { authApi } from "@/lib/api";

// ─── Validation Schemas ────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Institutional email or username is required")
    .trim(),
});

const resetSchema = z
  .object({
    code: z
      .string()
      .min(6, "Verification code must be 6 digits")
      .max(6, "Verification code must be 6 digits")
      .regex(/^\d{6}$/, "Code must contain only 6 digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify_and_reset" | "success">("request");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  async function onSendCode(data: EmailForm) {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const trimmedEmail = data.email.trim();
      setEmail(trimmedEmail);
      await authApi.forgotPassword(trimmedEmail);
      setStep("verify_and_reset");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setApiError(error.response?.data?.message || error.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResetPassword(data: ResetForm) {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await authApi.resetPassword(
        email,
        data.code.trim(),
        data.newPassword,
        data.confirmPassword
      );
      setStep("success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setApiError(error.response?.data?.message || error.message || "Failed to reset password. Please check your verification code.");
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
        <h1 className="text-2xl font-bold tracking-tight">
          {step === "request" && "Forgot password?"}
          {step === "verify_and_reset" && "Reset your password"}
          {step === "success" && "Password Reset Successful"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === "request" && "Enter your institutional email or username to receive a 6-digit reset code."}
          {step === "verify_and_reset" && `Enter the 6-digit code sent to your account and choose a new password.`}
          {step === "success" && "Your password has been securely updated. You can now log in."}
        </p>
      </div>

      {/* Alert Error */}
      {apiError && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* STEP 1: REQUEST CODE */}
      {step === "request" && (
        <form
          onSubmit={emailForm.handleSubmit(onSendCode)}
          className="space-y-4"
          noValidate
          aria-label="Password reset request form"
        >
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">Institutional Email / Username</Label>
            <Input
              id="forgot-email"
              type="text"
              autoComplete="email"
              placeholder="student@mlrit.ac.in or username"
              aria-describedby={emailForm.formState.errors.email ? "forgot-email-error" : undefined}
              aria-invalid={!!emailForm.formState.errors.email}
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p
                id="forgot-email-error"
                className="text-xs text-destructive"
                role="alert"
              >
                {emailForm.formState.errors.email.message}
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
                Sending code…
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-[var(--cn-indigo)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}

      {/* STEP 2: ENTER CODE & NEW PASSWORD */}
      {step === "verify_and_reset" && (
        <form
          onSubmit={resetForm.handleSubmit(onResetPassword)}
          className="space-y-4"
          noValidate
          aria-label="Set new password form"
        >
          <div className="space-y-1.5">
            <Label htmlFor="reset-code">6-Digit Verification Code</Label>
            <Input
              id="reset-code"
              type="text"
              maxLength={6}
              placeholder="123456"
              className="font-mono text-center tracking-widest text-lg"
              {...resetForm.register("code")}
            />
            {resetForm.formState.errors.code && (
              <p className="text-xs text-destructive">
                {resetForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                aria-describedby={resetForm.formState.errors.newPassword ? "new-password-error" : undefined}
                aria-invalid={!!resetForm.formState.errors.newPassword}
                {...resetForm.register("newPassword")}
              />
              <button
                type="button"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {resetForm.formState.errors.newPassword && (
              <p id="new-password-error" className="text-xs text-destructive" role="alert">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                aria-describedby={resetForm.formState.errors.confirmPassword ? "confirm-password-error" : undefined}
                aria-invalid={!!resetForm.formState.errors.confirmPassword}
                {...resetForm.register("confirmPassword")}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {resetForm.formState.errors.confirmPassword && (
              <p id="confirm-password-error" className="text-xs text-destructive" role="alert">
                {resetForm.formState.errors.confirmPassword.message}
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
                Resetting password…
              </>
            ) : (
              "Update Password"
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-1">
            Didn&apos;t get a code?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setApiError(null);
              }}
              className="font-medium text-[var(--cn-indigo)] hover:underline"
            >
              Request again
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: SUCCESS */}
      {step === "success" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--cn-emerald)]/30 bg-[var(--cn-emerald)]/10 px-6 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cn-emerald)]/20">
              <CheckCircle2 className="h-7 w-7 text-[var(--cn-emerald)]" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Password Changed</p>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => router.push(ROUTES.LOGIN)}
            className="w-full bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white font-semibold"
          >
            Go to Sign In
          </Button>
        </div>
      )}
    </div>
  );
}
