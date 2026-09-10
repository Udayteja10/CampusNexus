"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";

interface PublicRouteProps {
  children: React.ReactNode;
  /** Where to send authenticated users — defaults to /dashboard */
  redirectTo?: string;
}

/**
 * Wrap auth pages (login, register, etc.) so that already-authenticated
 * users are redirected away rather than seeing the form again.
 */
export function PublicRoute({
  children,
  redirectTo = ROUTES.DASHBOARD,
}: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  return <>{children}</>;
}
