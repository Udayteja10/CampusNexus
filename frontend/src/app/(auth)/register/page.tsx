"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Mail,
  ArrowLeft,
  HelpCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import type { HtnoValidationResponse } from "@/types/user.types";

// ─── Validation Schema ────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-z0-9_]{3,20}$/,
        "Username can only contain lowercase letters, numbers, and underscores"
      ),
    htno: z
      .string()
      .min(1, "Hall Ticket Number (HTNO) is required")
      .regex(
        /^[0-9]{2}R[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z0-9]{2,}$/,
        "Format must match institutional pattern (e.g. 23R21A0501)"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms to continue" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

// ─── Password Strength ────────────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Too weak", color: "bg-destructive" },
    { label: "Weak", color: "bg-rose-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-emerald-500" },
    { label: "Strong", color: "bg-indigo-600" },
  ];

  return { score, ...levels[score] };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const {
    register: registerUser,
    verifyOtp: verifyOtpStore,
    resendOtp: resendOtpStore,
    checkUsernameAvailability,
    validateHtno,
    isLoading: storeLoading,
    isAuthenticated,
    error: storeError,
    clearError,
  } = useAuthStore();

  // Stage state: 1 = Form, 2 = OTP verification, 3 = Success
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  // Form password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Live validation states
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  const [htnoStatus, setHtnoStatus] = useState<{
    checking: boolean;
    data?: HtnoValidationResponse;
    error?: string;
  }>({ checking: false });

  // Registered info for OTP verification
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [, setRegisteredHtno] = useState("");

  // OTP inputs state (6 digits)
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  // OTP Timers
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(180); // 3 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown
  const [resendsRemaining, setResendsRemaining] = useState(3);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeToTerms: undefined },
    mode: "onChange",
  });

  const watchUsername = watch("username") ?? "";
  const watchHtno = watch("htno") ?? "";
  const watchPassword = watch("password") ?? "";
  const agreeToTerms = watch("agreeToTerms");
  const strength = watchPassword ? getPasswordStrength(watchPassword) : null;

  // If already authenticated and not in OTP flow, redirect
  useEffect(() => {
    clearError();
    if (isAuthenticated && stage === 1) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, stage, router, clearError]);

  // Debounced username availability check
  useEffect(() => {
    const trimmed = watchUsername.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "3-20 characters, lowercase letters, numbers, underscores only",
      });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailability(trimmed);
      setUsernameStatus({
        checking: false,
        available: res.available,
        message: res.message,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [watchUsername, checkUsernameAvailability]);

  // Debounced HTNO validation check
  useEffect(() => {
    const trimmed = watchHtno.trim().toUpperCase();
    if (!trimmed || trimmed.length < 5) {
      setHtnoStatus({ checking: false });
      return;
    }

    setHtnoStatus({ checking: true });
    const timer = setTimeout(async () => {
      const res = await validateHtno(trimmed);
      if (res.valid && res.available) {
        setHtnoStatus({ checking: false, data: res });
      } else {
        setHtnoStatus({
          checking: false,
          error: res.message || "Invalid or unavailable HTNO.",
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [watchHtno, validateHtno]);

  // OTP Expiry & Resend cooldown countdown interval
  useEffect(() => {
    if (stage !== 2) return;

    const interval = setInterval(() => {
      setOtpExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  // Handle registration submit
  async function onRegisterSubmit(data: RegisterSchema) {
    clearError();
    setOtpError(null);
    try {
      const res = await registerUser({
        fullName: data.fullName,
        username: data.username.toLowerCase(),
        htno: data.htno.toUpperCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      setRegisteredEmail(res.email);
      setRegisteredHtno(res.htno);
      setOtpExpirySeconds(180);
      setResendCooldown(60);
      setResendsRemaining(3);
      setOtpValues(["", "", "", "", "", ""]);
      setStage(2);

      // Auto-focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch {
      // Error handled by store
    }
  }

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    if (val && !/^\d+$/.test(val)) return;

    const newValues = [...otpValues];
    // If user pasted a string longer than 1
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newValues[i] = digits[i] || "";
      }
      setOtpValues(newValues);
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newValues[index] = val;
    setOtpValues(newValues);

    // Auto advance focus
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length > 0) {
      const newValues = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newValues[i] = digits[i] || "";
      }
      setOtpValues(newValues);
      const focusIndex = Math.min(digits.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Submit OTP Verification
  async function handleVerifyOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setOtpError(null);
    setOtpSubmitting(true);

    try {
      await verifyOtpStore(registeredEmail, otp);
      setStage(3);
      setTimeout(() => {
        startTransition(() => {
          router.push(ROUTES.LOGIN);
        });
      }, 2000);
    } catch (err: unknown) {
      setOtpError(
        err instanceof Error ? err.message : "Verification failed. Please check the code."
      );
    } finally {
      setOtpSubmitting(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (resendCooldown > 0 || resendsRemaining <= 0) return;

    setOtpError(null);
    setResendLoading(true);
    setResendSuccessMsg(null);

    try {
      const msg = await resendOtpStore(registeredEmail);
      setResendSuccessMsg(msg || "New 6-digit code dispatched to your email.");
      setResendsRemaining((prev) => Math.max(0, prev - 1));
      setResendCooldown(60);
      setOtpExpirySeconds(180);
      setOtpValues(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setOtpError(
        err instanceof Error ? err.message : "Could not resend OTP. Please try again later."
      );
    } finally {
      setResendLoading(false);
    }
  }

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="w-full max-w-md animate-slide-up space-y-6">
      {/* ── STAGE 1: REGISTRATION FORM ────────────────────────────────────────── */}
      {stage === 1 && (
        <>
          {/* Header */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2 mb-3 lg:hidden justify-center sm:justify-start">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">CampusNexus</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Student Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your institutional credentials to join the MLRIT academic community.
            </p>
          </div>

          {/* Global Error Banner */}
          {storeError && (
            <Alert variant="destructive" role="alert" aria-live="assertive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{storeError}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <form
            onSubmit={handleSubmit(onRegisterSubmit)}
            className="space-y-4"
            noValidate
            aria-label="Registration form"
          >
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-fullname">Full Name</Label>
              <Input
                id="reg-fullname"
                type="text"
                autoComplete="name"
                placeholder="e.g. Jane Doe"
                aria-describedby={errors.fullName ? "fullname-error" : undefined}
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p id="fullname-error" className="text-xs text-destructive" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reg-username">Username</Label>
                {usernameStatus.checking ? (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                  </span>
                ) : usernameStatus.available === true ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Available
                  </span>
                ) : usernameStatus.available === false ? (
                  <span className="text-[11px] text-rose-500 font-medium flex items-center gap-0.5">
                    <AlertCircle className="h-3 w-3" /> {usernameStatus.message || "Unavailable"}
                  </span>
                ) : null}
              </div>
              <Input
                id="reg-username"
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                placeholder="e.g. jane_doe_23"
                aria-describedby={errors.username ? "username-error" : undefined}
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <p id="username-error" className="text-xs text-destructive" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* HTNO */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reg-htno">Hall Ticket Number (HTNO)</Label>
                {htnoStatus.checking ? (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Validating...
                  </span>
                ) : htnoStatus.data?.valid ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Verified Pattern
                  </span>
                ) : null}
              </div>
              <Input
                id="reg-htno"
                type="text"
                className="uppercase tracking-wide font-mono"
                placeholder="e.g. 23R21A0501"
                aria-describedby={errors.htno ? "htno-error" : undefined}
                aria-invalid={!!errors.htno}
                {...register("htno")}
              />
              {errors.htno && (
                <p id="htno-error" className="text-xs text-destructive" role="alert">
                  {errors.htno.message}
                </p>
              )}
              {htnoStatus.error && !errors.htno && (
                <p className="text-xs text-rose-500" role="alert">
                  {htnoStatus.error}
                </p>
              )}
            </div>

            {/* Read-only Derived Academic Metadata Cards */}
            {htnoStatus.data?.valid && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Derived Academic Identity</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Department
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {htnoStatus.data.department}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" /> Year of Study
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {htnoStatus.data.yearOfStudy ? `${htnoStatus.data.yearOfStudy}th Year` : "—"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Regulation
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {htnoStatus.data.regulation}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Admission Year
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {htnoStatus.data.admissionYear}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div className="overflow-hidden truncate">
                    <span className="text-muted-foreground block text-[10px]">
                      Institutional Email
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {htnoStatus.data.email}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="pr-10"
                  aria-describedby="reg-password-error"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {strength && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1 h-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < strength.score ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Strength: <span className="font-medium text-foreground">{strength.label}</span>
                  </p>
                </div>
              )}

              {errors.password && (
                <p id="reg-password-error" className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="reg-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className="pr-10"
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-xs text-destructive" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-1 pt-1">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="agree-terms"
                  checked={!!agreeToTerms}
                  onCheckedChange={(checked) =>
                    setValue(
                      "agreeToTerms",
                      checked === true ? true : (undefined as unknown as true),
                      { shouldValidate: true }
                    )
                  }
                  aria-describedby={errors.agreeToTerms ? "terms-error" : undefined}
                />
                <Label
                  htmlFor="agree-terms"
                  className="text-xs font-normal leading-tight text-muted-foreground cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href={ROUTES.TERMS}
                    target="_blank"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={ROUTES.PRIVACY}
                    target="_blank"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p id="terms-error" className="text-xs text-destructive" role="alert">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20"
              disabled={storeLoading || (htnoStatus.data?.valid === false)}
            >
              {storeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground pt-2">
            Already registered?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </>
      )}

      {/* ── STAGE 2: IN-PAGE OTP VERIFICATION ─────────────────────────────────── */}
      {stage === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Verify Your Email
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We dispatched a 6-digit verification code to:
            </p>
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-foreground font-mono font-medium text-xs border border-slate-200 dark:border-slate-700">
              {registeredEmail}
            </div>
          </div>

          {/* Error Banner */}
          {otpError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{otpError}</AlertDescription>
            </Alert>
          )}

          {/* Success Banner (Resend) */}
          {resendSuccessMsg && (
            <Alert className="rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{resendSuccessMsg}</AlertDescription>
            </Alert>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="h-12 w-11 sm:h-14 sm:w-12 text-center text-xl font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-foreground shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Expiry timer */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {otpExpirySeconds > 0 ? (
                  <span>
                    Code expires in:{" "}
                    <strong className="text-foreground font-mono">
                      {formatTime(otpExpirySeconds)}
                    </strong>
                  </span>
                ) : (
                  <span className="text-rose-500 font-medium">
                    Code expired. Please request a new code.
                  </span>
                )}
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20"
              disabled={otpSubmitting || otpValues.join("").length !== 6 || otpExpirySeconds === 0}
            >
              {otpSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                "Verify Institutional Email"
              )}
            </Button>
          </form>

          {/* Resend Controls */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Resends remaining: <strong className="text-foreground">{resendsRemaining}</strong></span>
              {resendCooldown > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-mono">
                  Wait {resendCooldown}s
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleResendOtp}
              disabled={resendLoading || resendCooldown > 0 || resendsRemaining <= 0}
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Sending new code...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Resend Verification Code"}
                </>
              )}
            </Button>
          </div>

          {/* Change Details / Wrong Email */}
          <div className="space-y-3 pt-2 text-center text-xs">
            <button
              type="button"
              onClick={() => {
                setStage(1);
                setOtpError(null);
                setResendSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Wrong HTNO or details? Click to modify
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Contact Help & Support
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 3: SUCCESS STATE ────────────────────────────────────────────── */}
      {stage === 3 && (
        <div className="text-center space-y-6 py-6 animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Email Verified Successfully!
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your institutional student account is activated. Redirecting you to sign in...
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Redirecting to login in a moment...</span>
          </div>

          <Button
            onClick={() => router.push(ROUTES.LOGIN)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20"
          >
            Go to Login Now
          </Button>
        </div>
      )}

      {/* Security Note Footer */}
      <div className="text-center">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Institutional verification strictly derives student identity from MLRIT HTNO.
        </p>
      </div>
    </div>
  );
}
