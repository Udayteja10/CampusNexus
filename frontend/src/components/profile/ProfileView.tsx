"use client";

import { useState } from "react";
import { User } from "@/types/user.types";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileBadges } from "./ProfileBadges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Award, GraduationCap, Shield, Users } from "lucide-react";

interface ProfileViewProps {
  user: User;
  isOwner: boolean;
}

export function ProfileView({ user: initialUser, isOwner }: ProfileViewProps) {
  const [user, setUser] = useState<User>(initialUser);

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
      {/* Profile Header Card */}
      <ProfileHeader
        user={user}
        isOwner={isOwner}
        onUserUpdated={(updated) => setUser(updated)}
      />

      {/* Profile Tabs */}
      <Tabs defaultValue="activity" className="w-full space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-2xl w-fit">
          <TabsTrigger value="activity" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold px-4 py-2">
            <MessageSquare className="h-4 w-4 text-[var(--cn-indigo)]" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold px-4 py-2">
            <Award className="h-4 w-4 text-amber-500" />
            Badges ({user.badges?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="academic" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold px-4 py-2">
            <GraduationCap className="h-4 w-4 text-emerald-500" />
            Campus & Roles
          </TabsTrigger>
        </TabsList>

        {/* Tab: Activity */}
        <TabsContent value="activity" className="space-y-4 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Community Activity</h2>
            <span className="text-xs text-muted-foreground">Public posts only</span>
          </div>
          <ProfileActivity userId={user.id} />
        </TabsContent>

        {/* Tab: Badges */}
        <TabsContent value="badges" className="space-y-4 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Earned Recognition</h2>
            <span className="text-xs text-muted-foreground">Campus achievements</span>
          </div>
          <ProfileBadges badges={user.badges} />
        </TabsContent>

        {/* Tab: Campus & Roles */}
        <TabsContent value="academic" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Academic Information */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Academic Department</h3>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>HTNO</span>
                  <span className="font-mono font-semibold text-foreground">{user.htno || "Not specified"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Institutional Email</span>
                  <span className="font-medium text-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Department</span>
                  <span className="font-semibold text-foreground">{user.department || "Not specified"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Year of Study</span>
                  <span className="font-semibold text-foreground">{user.yearOfStudy ? `Year ${user.yearOfStudy}` : "Not specified"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Regulation</span>
                  <span className="font-semibold text-foreground">{user.regulation || "Not specified"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Admission Year</span>
                  <span className="font-semibold text-foreground">{user.admissionYear || "Not specified"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Email Verification</span>
                  <span className={`font-semibold ${user.emailVerified ? "text-emerald-600" : "text-amber-600"}`}>
                    {user.emailVerified ? "Verified (Institutional OTP)" : "Pending Verification"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Account Role</span>
                  <span className="font-bold text-foreground">{user.role}</span>
                </div>
              </div>
            </div>

            {/* Campus Roles & Leadership */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Leadership & Roles</h3>
              </div>
              <div className="space-y-2 text-xs">
                {user.clubLeaderOf && user.clubLeaderOf.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Club Leadership:</span>
                    {user.clubLeaderOf.map((club) => (
                      <div key={club.clubId} className="flex items-center gap-1.5 font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-amber-500" />
                        <span>Leader of {club.clubName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No club leadership assigned.</p>
                )}

                {user.deptCoordinatorOf && user.deptCoordinatorOf.length > 0 ? (
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">Department Coordination:</span>
                    {user.deptCoordinatorOf.map((dept) => (
                      <div key={dept.departmentId} className="flex items-center gap-1.5 font-medium text-foreground">
                        <Shield className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Coordinator for {dept.departmentName}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
