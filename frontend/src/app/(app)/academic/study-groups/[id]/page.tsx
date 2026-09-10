"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  Video,
  Share2,
  Lock,
  Globe,
  UserPlus,
  UserMinus,
  MessageSquare,
  Send,
  AlertTriangle,
  Crown,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService, AcademicAccessError } from "@/services/academic";
import { StudyGroup, StudyGroupMember } from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function StudyGroupDetailPage() {
  const params = useParams();
  const groupId = params?.id as string;
  const user = useAuthStore((s) => s.user);

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<StudyGroupMember[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string; time: string; isSelf: boolean }[]
  >([
    {
      id: "m1",
      sender: "K. Rohit Reddy",
      text: "Welcome everyone! We will be solving Units 1 & 2 PYQ questions tomorrow.",
      time: "Yesterday @ 6:30 PM",
      isSelf: false,
    },
    {
      id: "m2",
      sender: "Sneha Varma",
      text: "I have shared the BCNF decomposition examples in the resources tab.",
      time: "Today @ 11:15 AM",
      isSelf: false,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  const loadData = async () => {
    if (!groupId) return;
    setLoading(true);
    setAccessError(null);
    try {
      const g = await academicService.getStudyGroupById(groupId);
      if (!g) {
        setAccessError("Study group not found.");
        return;
      }
      setGroup(g);
      const [mList, joined] = await Promise.all([
        academicService.getStudyGroupMembers(groupId),
        academicService.isMemberOfStudyGroup(groupId),
      ]);
      setMembers(mList);
      setIsMember(joined);
    } catch (err: any) {
      if (err instanceof AcademicAccessError) {
        setAccessError(err.message);
      } else {
        setAccessError(err.message || "Failed to load study group.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId, user?.department]);

  const handleToggleJoin = async () => {
    if (!group) return;
    try {
      if (isMember) {
        await academicService.leaveStudyGroup(group.id);
        setIsMember(false);
        setMembers((prev) => prev.filter((m) => m.userId !== user?.id));
        setGroup((prev) =>
          prev ? { ...prev, membersCount: Math.max(1, prev.membersCount - 1) } : null
        );
        toast.success("Left the study group.");
      } else {
        await academicService.joinStudyGroup(group.id);
        setIsMember(true);
        if (user) {
          setMembers((prev) => [
            ...prev,
            {
              userId: user.id,
              userName: user.fullName || user.username,
              userAvatar: user.avatarUrl,
              joinedAt: new Date().toISOString(),
              role: "MEMBER",
            },
          ]);
        }
        setGroup((prev) =>
          prev ? { ...prev, membersCount: prev.membersCount + 1 } : null
        );
        toast.success("Joined study group!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update membership");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: user?.fullName || user?.username || "You",
        text: chatMessage.trim(),
        time: "Just now",
        isSelf: true,
      },
    ]);
    setChatMessage("");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Study squad link copied!");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (accessError || !group) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {accessError || "Study group not found."}
        </p>
        <div className="pt-2">
          <Link href={ROUTES.ACADEMIC_STUDY_GROUPS}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Study Squads</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isFull = group.membersCount >= group.maxMembers;
  const capacityPercent = Math.min(100, Math.round((group.membersCount / group.maxMembers) * 100));

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back link */}
      <Link
        href={ROUTES.ACADEMIC_STUDY_GROUPS}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Study Squads</span>
      </Link>

      {/* Group Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DeptBadge departmentIdOrName={group.departmentId} size="md" />
            <Badge variant="secondary" className="text-xs">
              Semester {group.semester}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {group.subjectCode}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8 text-xs gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </Button>

            <Button
              variant={isMember ? "outline" : "default"}
              size="sm"
              onClick={handleToggleJoin}
              disabled={!isMember && isFull}
              className="h-8 text-xs gap-1.5"
            >
              {isMember ? (
                <>
                  <UserMinus className="h-3.5 w-3.5 text-destructive" />
                  <span>Leave Squad</span>
                </>
              ) : isFull ? (
                <span>Squad Full</span>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Join Squad</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
            {group.name}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {group.description}
          </p>
        </div>

        {/* Schedule and Virtual Room Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {group.meetingSchedule && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-foreground block">Meeting Schedule</span>
                <span>{group.meetingSchedule}</span>
              </div>
            </div>
          )}

          {group.meetingLink && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-900 text-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Video className="h-4 w-4 shrink-0" />
                <span className="font-semibold">Virtual Study Room</span>
              </div>
              <a
                href={group.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Join Room
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid: Members Roster & Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Members Roster */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Roster ({group.membersCount} / {group.maxMembers})
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {capacityPercent}%
            </span>
          </div>

          <Progress value={capacityPercent} className="h-1.5" />

          <div className="space-y-2 pt-2">
            {members.length > 0 ? (
              members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                      {m.userName.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{m.userName}</span>
                  </div>
                  {m.role === "LEADER" && (
                    <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                      <Crown className="h-2.5 w-2.5" /> Lead
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No members listed.
              </p>
            )}
          </div>
        </div>

        {/* Right: Squad Discussion Board (Mock / Realtime ready) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">Squad Room Chat</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Visible to joined squad members
            </span>
          </div>

          {/* Messages list */}
          <div className="space-y-3 min-h-[220px] max-h-[350px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-3 rounded-xl text-xs space-y-1 max-w-[85%]",
                  msg.isSelf
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted/40 text-foreground border border-border/50"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-between text-[10px] font-semibold gap-2",
                    msg.isSelf ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  <span>{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-border/60">
            <Input
              placeholder={
                isMember
                  ? "Share a doubt, schedule update, or resource link..."
                  : "Join this study squad to participate in discussions"
              }
              disabled={!isMember}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="text-xs h-9 bg-background"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!isMember || !chatMessage.trim()}
              className="h-9 px-3 gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
