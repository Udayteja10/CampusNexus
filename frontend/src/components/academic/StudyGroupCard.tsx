"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Video,
  Lock,
  Globe,
  Tag,
  ChevronRight,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { StudyGroup } from "@/types/academic.types";
import { academicService } from "@/services/academic";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeptBadge } from "./DeptBadge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface StudyGroupCardProps {
  group: StudyGroup;
  onUpdate?: () => void;
  className?: string;
}

export function StudyGroupCard({ group, onUpdate, className }: StudyGroupCardProps) {
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState(group.membersCount);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    academicService.isMemberOfStudyGroup(group.id).then((m) => mounted && setIsMember(m));
    return () => {
      mounted = false;
    };
  }, [group.id]);

  const handleToggleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (isMember) {
        await academicService.leaveStudyGroup(group.id);
        setIsMember(false);
        setMembersCount((prev) => Math.max(1, prev - 1));
        toast.success("Left the study group.");
      } else {
        await academicService.joinStudyGroup(group.id);
        setIsMember(true);
        setMembersCount((prev) => prev + 1);
        toast.success("Successfully joined the study group!");
      }
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update membership");
    } finally {
      setLoading(false);
    }
  };

  const isFull = membersCount >= group.maxMembers;
  const capacityPercent = Math.min(100, Math.round((membersCount / group.maxMembers) * 100));

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <div>
        {/* Top badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <DeptBadge departmentIdOrName={group.departmentId} size="sm" />
            <Badge variant="secondary" className="text-[10px] font-medium">
              Sem {group.semester}
            </Badge>
            {group.isPrivate ? (
              <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                <Lock className="h-2.5 w-2.5" /> Invite Only
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                <Globe className="h-2.5 w-2.5" /> Open
              </Badge>
            )}
          </div>
          <span className="font-mono text-xs text-primary font-semibold">
            {group.subjectCode}
          </span>
        </div>

        {/* Title */}
        <Link
          href={ROUTES.ACADEMIC_STUDY_GROUP_DETAIL(group.id)}
          className="group-hover:text-primary transition-colors text-base font-bold text-foreground block mb-1.5"
        >
          {group.name}
        </Link>

        {/* Subject */}
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {group.subjectName}
        </p>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {group.description}
        </p>

        {/* Schedule & Meeting info */}
        {group.meetingSchedule && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{group.meetingSchedule}</span>
          </div>
        )}

        {group.meetingLink && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mb-4">
            <Video className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-mono text-[11px]">Virtual Room Available</span>
          </div>
        )}

        {/* Members capacity progress */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Members
            </span>
            <span className="font-semibold text-foreground">
              {membersCount} / {group.maxMembers}
            </span>
          </div>
          <Progress value={capacityPercent} className="h-1.5" />
        </div>

        {/* Tags */}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {group.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border/60 pt-3 mt-auto flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground truncate">
          Lead: <span className="font-medium text-foreground">{group.leaderName}</span>
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant={isMember ? "outline" : "default"}
            size="sm"
            onClick={handleToggleJoin}
            disabled={loading || (!isMember && isFull)}
            className="h-8 text-xs gap-1"
          >
            {isMember ? (
              <>
                <UserMinus className="h-3.5 w-3.5 text-destructive" />
                <span>Leave</span>
              </>
            ) : isFull ? (
              <span>Full</span>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Join</span>
              </>
            )}
          </Button>

          <Link href={ROUTES.ACADEMIC_STUDY_GROUP_DETAIL(group.id)}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
