"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * All /admin/* pages require at least the MODERATOR role.
 * A student who manually types an /admin URL
 * will be redirected to /dashboard.
 * Privileged actions (such as role assignment) check for ADMIN in service/UI.
 */
export default function AdminLayout({
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
