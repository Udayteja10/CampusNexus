"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Reads persisted auth state from localStorage/sessionStorage and
 * hydrates the Zustand store on first client render.
 *
 * Mount this once in the root layout or a top-level provider.
 */
export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
