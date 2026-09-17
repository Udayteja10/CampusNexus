"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@/types/user.types";
import { useAuthStore } from "@/store/auth.store";
import { userService } from "@/services/user";
import { ProfileView } from "@/components/profile/ProfileView";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { UserX, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: Props) {
  const { username } = use(params);
  const currentUser = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    userService
      .getUserByUsername(username)
      .then((user) => {
        if (isMounted) {
          setProfileUser(user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfileUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [username, currentUser]);

  if (loading || !isHydrated) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-12 w-80 rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto max-w-2xl py-16 px-4 text-center">
        <div className="rounded-3xl border border-border bg-card p-10 space-y-4 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <UserX className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-foreground">User Not Found</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The profile for <span className="font-semibold text-foreground">@{username}</span> could not be found or may have been removed.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.DASHBOARD}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "gap-2 rounded-xl"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner =
    Boolean(currentUser && (
      currentUser.id === profileUser.id ||
      currentUser.username.toLowerCase() === profileUser.username.toLowerCase()
    ));

  return <ProfileView user={profileUser} isOwner={isOwner} />;
}
