"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * All /admin/* pages require the ADMIN role.
 * A student or moderator who manually types an /admin URL
 * will be redirected to /dashboard.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      {children}
    </ProtectedRoute>
  );
}
