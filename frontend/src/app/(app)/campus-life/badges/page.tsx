"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Star,
  Users,
  Plus,
  ShieldCheck,
  X,
  Flame,
  Medal,
  Crown,
} from "lucide-react";
import type { Badge as BadgeType, UserBadge } from "@/types/campusLife.types";
import { badgesApi } from "@/lib/campusLifeApi";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function BadgesPage() {
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");

  // Award Modal (Staff only)
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | "">("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [all, my] = await Promise.all([
        badgesApi.getAllBadges(),
        badgesApi.getMyBadges(),
      ]);
      setAllBadges(all);
      setMyBadges(my);
    } catch (err: any) {
      console.error("Failed to load badges:", err);
      toast.error(err.response?.data?.message || "Failed to load badges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const earnedBadgeIds = new Set(myBadges.map((mb) => mb.badgeId));

  const totalPoints = myBadges.length * 100;

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    const userIdNum = parseInt(targetUserId, 10);
    if (isNaN(userIdNum) || !selectedBadgeId) {
      toast.error("Please enter a valid numeric User ID and select a badge");
      return;
    }
    try {
      await badgesApi.awardBadge({
        userId: userIdNum,
        badgeId: Number(selectedBadgeId),
      });
      toast.success("Badge awarded successfully!");
      setIsAwardModalOpen(false);
      setTargetUserId("");
      setSelectedBadgeId("");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to award badge");
    }
  };

  const getBadgeIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "trophy":
        return <Trophy className="w-8 h-8 text-amber-500" />;
      case "star":
        return <Star className="w-8 h-8 text-yellow-500" />;
      case "crown":
        return <Crown className="w-8 h-8 text-purple-500" />;
      case "flame":
        return <Flame className="w-8 h-8 text-rose-500" />;
      case "medal":
        return <Medal className="w-8 h-8 text-blue-500" />;
      default:
        return <Award className="w-8 h-8 text-indigo-500" />;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-600/15 via-primary/10 to-yellow-500/10 border border-border/60 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Trophy className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Campus Recognition & Achievements
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Achievement Badges
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Earn recognition for helping peers, publishing wiki articles, actively participating in club events, and contributing to campus life.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isStaff && (
              <Button
                onClick={() => setIsAwardModalOpen(true)}
                className="gap-2 shadow-md bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="w-4 h-4" /> Award Badge
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Medal className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Badges Earned</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {myBadges.length} <span className="text-xs text-muted-foreground font-normal">/ {allBadges.length}</span>
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Achievement Points</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalPoints} PTS</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Current Standing</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {myBadges.length >= 4 ? "Campus Legend" : myBadges.length >= 2 ? "Active Contributor" : "Rising Member"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60 w-fit">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "my"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Badges ({myBadges.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "all"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Badges ({allBadges.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === "my" ? (
        myBadges.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-bold text-lg text-foreground">No Badges Earned Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Contribute to the campus wiki, participate in club events, or assist peers to unlock your first achievement badge!
            </p>
            <Button onClick={() => setActiveTab("all")} className="mt-4 gap-2">
              View Available Badges
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {myBadges.map((userBadge) => {
              const fullBadge = allBadges.find((b) => b.id === userBadge.badgeId);
              return (
                <Card
                  key={userBadge.id}
                  className="border-border/60 bg-gradient-to-br from-card via-card to-amber-500/5 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
                        {getBadgeIcon(userBadge.badgeIcon || fullBadge?.icon)}
                      </div>
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
                        100 PTS
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-lg">{userBadge.badgeName}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {userBadge.badgeDescription || fullBadge?.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Earned
                      </span>
                      <span>{new Date(userBadge.awardedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* All Badges */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <Card
                key={badge.id}
                className={`border-border/60 transition-all ${
                  isEarned
                    ? "bg-gradient-to-br from-card via-card to-amber-500/5 hover:shadow-md"
                    : "opacity-75 hover:opacity-100 bg-muted/20"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        isEarned
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-muted border-border/60 grayscale"
                      }`}
                    >
                      {getBadgeIcon(badge.icon)}
                    </div>
                    <Badge variant={isEarned ? "default" : "outline"} className="text-xs">
                      100 PTS
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground text-lg">{badge.name}</h4>
                      {isEarned ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {badge.criteria && (
                    <div className="pt-3 border-t border-border/40 text-xs">
                      <span className="font-semibold text-foreground">How to earn:</span>{" "}
                      <span className="text-muted-foreground">{badge.criteria}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AWARD BADGE MODAL (Staff only) */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Award Achievement Badge</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsAwardModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleAwardBadge} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground">User ID (Numeric) *</label>
                <input
                  type="number"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="e.g. 1"
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Select Badge *</label>
                <select
                  value={selectedBadgeId}
                  onChange={(e) => setSelectedBadgeId(e.target.value ? Number(e.target.value) : "")}
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                >
                  <option value="">-- Choose Badge --</option>
                  {allBadges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAwardModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Award Badge
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
