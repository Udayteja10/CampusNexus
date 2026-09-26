"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
  Suspense,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, MailCheck, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(initial: number) {
  const [seconds, setSeconds] = useState(0);

  const start = useCallback(() => {
    setSeconds(initial);
  }, [initial]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  return { seconds, start, canResend: seconds === 0 };
}

// ─── Inner Form Component ─────────────────────────────────────────────────────

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const { verifyOtp, resendOtp, isLoading: storeLoading } = useAuthStore();

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { seconds, start, canResend } = useCountdown(RESEND_COOLDOWN_SECONDS);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const code = digits.join("");

  // ── Digit handlers ──────────────────────────────────────────────────────────

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    setError(null);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    setError(null);
  }

  // ── Submit Verification ─────────────────────────────────────────────────────

  async function handleVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please provide your institutional email address.");
      return;
    }

    if (code.length < CODE_LENGTH) {
      setError(`Please enter all ${CODE_LENGTH} digits of the verification code.`);
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await verifyOtp(cleanEmail, code);
      setSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code. Please check and try again."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  // ── Resend Code ─────────────────────────────────────────────────────────────

  async function handleResend() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please provide your institutional email to resend code.");
      return;
    }
    if (!canResend) return;

    setIsResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const msg = await resendOtp(cleanEmail);
      setSuccessMsg(msg || "A new 6-digit verification code has been dispatched.");
      setDigits(Array(CODE_LENGTH).fill(""));
      start();
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to resend code. Please try again later."
      );
    } finally {
      setIsResending(false);
    }
  }

  // ── Render Success View ─────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="w-full max-w-sm animate-slide-up space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 animate-bounce" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Email Verified!</h1>
            <p className="text-sm text-muted-foreground">
              Your institutional student account is activated. Redirecting you to sign in...
            </p>
          </div>
          <Button
            onClick={() => router.push(ROUTES.LOGIN)}
            className="w-full bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white"
          >
            Sign In to CampusNexus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-slide-up space-y-7">
      {/* Back */}
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Back to sign in"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Sign In
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cn-indigo)]/10 text-[var(--cn-indigo)]">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to your MLRIT institutional email.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert (Resend) */}
      {successMsg && (
        <Alert className="rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="verify-email-input">Institutional Email</Label>
          <Input
            id="verify-email-input"
            type="email"
            placeholder="e.g. 23r21a3344@mlrit.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isVerifying || storeLoading}
            className="font-mono text-sm"
            required
          />
        </div>

        {/* OTP inputs */}
        <div className="space-y-2">
          <Label>6-Digit Verification Code</Label>
          <fieldset>
            <legend className="sr-only">Verification code — enter each digit</legend>
            <div
              className="flex gap-2"
              role="group"
              aria-label="6-digit verification code"
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  id={`otp-digit-${i + 1}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className={`h-12 w-full rounded-xl border text-center font-mono text-lg font-bold transition-all
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-indigo)]
                    ${digit ? "border-[var(--cn-indigo)] bg-[var(--cn-indigo)]/5" : "border-border bg-background"}
                    ${error ? "border-destructive" : ""}
                  `}
                  disabled={isVerifying || storeLoading}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </fieldset>
        </div>

        <Button
          type="submit"
          className="w-full bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white font-medium shadow-sm"
          disabled={isVerifying || storeLoading || code.length < CODE_LENGTH || !email.trim()}
          aria-busy={isVerifying || storeLoading}
        >
          {isVerifying || storeLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Code…
            </>
          ) : (
            "Verify Institutional Email"
          )}
        </Button>
      </form>

      {/* Resend */}
      <div className="p-3.5 rounded-xl bg-muted/40 border text-center text-sm text-muted-foreground space-y-2">
        <p className="text-xs">Didn&apos;t receive the email code?</p>
        {canResend ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isResending || !email.trim()}
            className="w-full text-xs font-medium"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Sending new code...
              </>
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Resend Verification Code
              </>
            )}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground font-mono">
            Resend available in{" "}
            <strong className="text-foreground">
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </strong>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page with Suspense ──────────────────────────────────────────────────

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--cn-indigo)]" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
