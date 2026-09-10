"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";

// ─── Validation Schema ────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be under 80 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .refine(
        (v) => v.toLowerCase().endsWith("@mlrit.ac.in"),
        "Only @mlrit.ac.in institutional email addresses are allowed"
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
    { label: "Weak", color: "bg-[var(--cn-rose)]" },
    { label: "Fair", color: "bg-[var(--cn-amber)]" },
    { label: "Good", color: "bg-[var(--cn-emerald)]" },
    { label: "Strong", color: "bg-[var(--cn-indigo)]" },
  ];

  return { score, ...levels[score] };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, isAuthenticated, error, clearError } =
    useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeToTerms: undefined },
  });

  const password = watch("password") ?? "";
  const agreeToTerms = watch("agreeToTerms");
  const strength = password ? getPasswordStrength(password) : null;

  useEffect(() => {
    if (isAuthenticated && !registrationSuccess) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, registrationSuccess, router]);

  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: RegisterSchema) {
    clearError();
    await registerUser({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
    // If successful (no error thrown), navigate to verify-email
    setRegistrationSuccess(true);
    router.push(ROUTES.VERIFY_EMAIL);
  }

  return (
    <div className="w-full max-w-sm animate-slide-up space-y-7">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cn-indigo)]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Join CampusNexus with your MLRIT institutional email
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success (unlikely to show due to redirect, but just in case) */}
      {registrationSuccess && !error && (
        <Alert role="status" aria-live="polite" className="border-[var(--cn-emerald)]/40 bg-[var(--cn-emerald)]/10 text-[var(--cn-emerald)]">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Account created! Redirecting to email verification…
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        aria-label="Registration form"
      >
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-fullname">Full Name</Label>
          <Input
            id="reg-fullname"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
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

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Institutional Email</Label>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="you@mlrit.ac.in"
            aria-describedby={errors.email ? "reg-email-error" : undefined}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p id="reg-email-error" className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

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
              aria-describedby="reg-password-error reg-password-strength"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {strength && (
            <div id="reg-password-strength" aria-live="polite" className="space-y-1">
              <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength.score} aria-label={`Password strength: ${strength.label}`}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < strength.score ? strength.color : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{strength.label}</p>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
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
        <div className="space-y-1">
          <div className="flex items-start gap-2">
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
              className="text-sm font-normal leading-snug cursor-pointer"
            >
              I agree to the{" "}
              <Link
                href={ROUTES.TERMS}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--cn-indigo)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={ROUTES.PRIVACY}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--cn-indigo)] hover:underline"
                onClick={(e) => e.stopPropagation()}
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
          className="w-full bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-[var(--cn-indigo)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
