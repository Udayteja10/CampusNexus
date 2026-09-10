"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore, selectIsAdmin, selectIsModerator } from "@/store/auth.store";
import type { UserRole } from "@/types/user.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If specified, the user must have at least this role.
   * Role hierarchy: STUDENT < MODERATOR < ADMIN
   */
  requiredRole?: UserRole;
  /** Where to redirect if not authenticated */
  redirectTo?: string;
}

/**
 * Wrap any page that requires authentication.
 * Redirects to /login if the user is not authenticated.
 * Optionally checks for a minimum required role.
 *
 * IMPORTANT: We gate on `isHydrated` (not `isLoading`) so that a page
 * refresh never causes a premature redirect before the persisted session
 * has been restored from localStorage / sessionStorage.
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, isHydrated } = useAuthStore();
  const isModerator = useAuthStore(selectIsModerator);
  const isAdmin = useAuthStore(selectIsAdmin);

  useEffect(() => {
    // Wait until hydration is complete before making any routing decisions.
    if (!isHydrated) return;

    if (!isAuthenticated) {
      // Preserve the intended destination so login can redirect back
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    if (requiredRole) {
      const hasAccess =
        requiredRole === "STUDENT" ||
        (requiredRole === "MODERATOR" && isModerator) ||
        (requiredRole === "ADMIN" && isAdmin);

      if (!hasAccess) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isHydrated, isModerator, isAdmin, requiredRole, router, pathname, redirectTo]);

  // Show loading spinner while waiting for hydration from storage
  if (!isHydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        aria-label="Loading…"
        role="status"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-indigo)]" />
      </div>
    );
  }

  // Unauthenticated — redirect is happening via useEffect above, render nothing
  if (!isAuthenticated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        aria-label="Redirecting to sign in…"
        role="status"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-indigo)]" />
      </div>
    );
  }

  // Role check: if user lacks the required role, redirect is already queued
  if (requiredRole) {
    const hasAccess =
      requiredRole === "STUDENT" ||
      (requiredRole === "MODERATOR" && isModerator) ||
      (requiredRole === "ADMIN" && isAdmin);
    if (!hasAccess) return null;
  }

  return <>{children}</>;
}
