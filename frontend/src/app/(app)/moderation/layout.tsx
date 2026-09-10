"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * All /moderation/* pages require at least the MODERATOR role.
 * A student who manually types a /moderation URL will be
 * redirected to /dashboard.
 */
export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="MODERATOR">
      {children}
    </ProtectedRoute>
  );
}
