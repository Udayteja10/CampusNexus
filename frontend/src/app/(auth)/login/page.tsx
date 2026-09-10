"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, GraduationCap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine(
      (v) => v.toLowerCase().endsWith("@mlrit.ac.in"),
      "Only @mlrit.ac.in institutional email addresses are allowed"
    ),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginSchema = z.infer<typeof loginSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const rememberMe = watch("rememberMe");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, router]);

  // Clear store error when user starts typing
  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: LoginSchema) {
    clearError();
    await login(data.email, data.password, data.rememberMe);
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
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your CampusNexus account
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        aria-label="Sign in form"
      >
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Institutional Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@mlrit.ac.in"
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-[var(--cn-indigo)] hover:underline"
              tabIndex={0}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pr-10"
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) =>
              setValue("rememberMe", Boolean(checked))
            }
          />
          <Label
            htmlFor="remember-me"
            className="text-sm font-normal cursor-pointer"
          >
            Remember me
          </Label>
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
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Dev hint — shown only in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground/70">Development accounts</p>
          <p>student@mlrit.ac.in</p>
          <p>moderator@mlrit.ac.in</p>
          <p>admin@mlrit.ac.in</p>
          <p className="text-[10px] pt-1 text-muted-foreground/60">
            Use the shared dev password. Remove before production.
          </p>
        </div>
      )}

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="font-medium text-[var(--cn-indigo)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
