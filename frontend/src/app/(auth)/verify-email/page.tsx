"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, MailCheck, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const MOCK_VALID_CODE = "123456"; // dev-only, remove when backend is ready

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { seconds, start, canResend } = useCountdown(RESEND_COOLDOWN_SECONDS);

  // Start countdown immediately on mount (simulates code just sent)
  useEffect(() => {
    start();
  }, [start]);

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

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleVerify() {
    if (code.length < CODE_LENGTH) {
      setError(`Please enter all ${CODE_LENGTH} digits.`);
      return;
    }
    setIsVerifying(true);
    setError(null);

    await new Promise((r) => setTimeout(r, 900)); // mock delay

    if (code === MOCK_VALID_CODE) {
      setSuccess(true);
      setTimeout(() => router.push(ROUTES.DASHBOARD), 1800);
    } else {
      setError("Invalid verification code. Please check and try again.");
      setIsVerifying(false);
    }
  }

  // ── Resend ──────────────────────────────────────────────────────────────────

  async function handleResend() {
    if (!canResend) return;
    setIsResending(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 700)); // mock delay
    setDigits(Array(CODE_LENGTH).fill(""));
    setIsResending(false);
    start();
    inputRefs.current[0]?.focus();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="w-full max-w-sm animate-slide-up space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cn-emerald)]/15">
            <CheckCircle2 className="h-8 w-8 text-[var(--cn-emerald)]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Email verified!</h1>
            <p className="text-sm text-muted-foreground">
              Your account is now active. Redirecting to your dashboard…
            </p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cn-indigo)]/10">
          <MailCheck className="h-6 w-6 text-[var(--cn-indigo)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {user?.email ?? "your email"}
            </span>
            . Enter it below to activate your account.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* OTP inputs */}
      <div className="space-y-4">
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
                ref={(el) => { inputRefs.current[i] = el; }}
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
                className={`h-12 w-full rounded-xl border text-center text-lg font-semibold transition-all
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-indigo)]
                  ${digit ? "border-[var(--cn-indigo)] bg-[var(--cn-indigo)]/5" : "border-border bg-background"}
                  ${error ? "border-destructive" : ""}
                `}
                disabled={isVerifying}
                autoComplete="one-time-code"
              />
            ))}
          </div>
        </fieldset>

        <Button
          type="button"
          className="w-full bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white"
          onClick={handleVerify}
          disabled={isVerifying || code.length < CODE_LENGTH}
          aria-busy={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </div>

      {/* Resend */}
      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-[var(--cn-indigo)] hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending…" : "Resend code"}
          </button>
        ) : (
          <span>
            Resend in{" "}
            <span
              className="tabular-nums font-medium text-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </span>
          </span>
        )}
      </div>

      {/* Dev hint */}
      {process.env.NODE_ENV === "development" && (
        <p className="text-center text-xs text-muted-foreground/50">
          Dev: use code <span className="font-mono font-medium">123456</span>
        </p>
      )}
    </div>
  );
}
