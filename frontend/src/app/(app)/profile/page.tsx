"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { ProfileView } from "@/components/profile/ProfileView";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || (!user && isAuthenticated)) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-12 w-80 rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ProfileView user={user} isOwner={true} />;
}
