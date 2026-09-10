"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Calendar,
  Sparkles,
  Lock,
  Globe,
  Tag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService } from "@/services/academic";
import { StudyGroup, Subject, Semester } from "@/types/academic.types";
import { getDepartmentLabel, getDepartmentId } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { StudyGroupCard } from "@/components/academic/StudyGroupCard";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";
import { toast } from "@/lib/toast";

export default function AcademicStudyGroupsPage() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSem, setSelectedSem] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get("subjectCode") || "ALL"
  );
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formSem, setFormSem] = useState<Semester>(5);
  const [formSubjectCode, setFormSubjectCode] = useState("");
  const [maxMembers, setMaxMembers] = useState(10);
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deptLabel = getDepartmentLabel(user?.department);
  const deptId = getDepartmentId(user?.department) || "cse";

  const loadData = async () => {
    setLoading(true);
    try {
      const [gList, sList] = await Promise.all([
        academicService.getStudyGroups({
          subjectCode: selectedSubject !== "ALL" ? selectedSubject : undefined,
          semester: selectedSem !== "ALL" ? (Number(selectedSem) as Semester) : undefined,
          search: search.trim() || undefined,
        }),
        academicService.getSubjects(),
      ]);
      setGroups(gList);
      setSubjects(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubject, selectedSem, search, user?.department]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !formSubjectCode) {
      toast.error("Please provide group name and subject.");
      return;
    }

    const sub = subjects.find((s) => s.code === formSubjectCode);
    if (!sub) {
      toast.error("Invalid subject selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await academicService.createStudyGroup({
        name: name.trim(),
        description: description.trim(),
        subjectCode: sub.code,
        subjectName: sub.name,
        semester: formSem,
        maxMembers,
        meetingSchedule: meetingSchedule.trim() || undefined,
        meetingLink: meetingLink.trim() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : [sub.code, "Prep Squad"],
      });

      toast.success("Study group created successfully!");
      setCreateDialogOpen(false);
      // Reset form
      setName("");
      setDescription("");
      setFormSubjectCode("");
      setMeetingSchedule("");
      setMeetingLink("");
      setTags("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create study group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formAvailableSubjects = subjects.filter((s) => s.semester === formSem);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DeptBadge departmentIdOrName={deptId} size="md" />
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Peer Study Squads & Cohorts
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Form collaborative exam revision groups, practice problem sets, and sync study schedules with classmates in {deptLabel}.
          </p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Create Study Squad</span>
        </Button>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search squads by name, topic, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Semester select */}
          <Select value={selectedSem} onValueChange={(val) => setSelectedSem(val || "ALL")}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Semesters</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  Semester {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject select */}
          <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val || "ALL")}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-card truncate">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Study Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <AcademicEmptyState
          icon={Users}
          title="No study groups found"
          description="Be the initiator! Create a study squad for your subject and invite your classmates to join."
          actionLabel="Create Study Squad"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <StudyGroupCard key={group.id} group={group} onUpdate={loadData} />
          ))}
        </div>
      )}

      {/* Create Study Group Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Create New Study Squad</span>
            </DialogTitle>
            <DialogDescription>
              Set up a collaborative study circle for midterm preparation or problem solving.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sg-name" className="text-xs font-semibold">
                Squad Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sg-name"
                placeholder="e.g. DBMS & OS Mid-Term Prep Squad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Semester</Label>
                <Select
                  value={String(formSem)}
                  onValueChange={(val) => {
                    setFormSem(Number(val) as Semester);
                    setFormSubjectCode("");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Max Members Limit</Label>
                <Select
                  value={String(maxMembers)}
                  onValueChange={(val) => setMaxMembers(Number(val))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 8, 10, 12, 15, 20, 30].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} Students
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Associated Subject <span className="text-destructive">*</span>
              </Label>
              <Select value={formSubjectCode} onValueChange={(val) => setFormSubjectCode(val || "")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {(formAvailableSubjects.length > 0 ? formAvailableSubjects : subjects).map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sg-desc" className="text-xs font-semibold">
                Squad Goals & Description
              </Label>
              <Textarea
                id="sg-desc"
                placeholder="What will this group focus on? (e.g. Solving past 5 years question papers, discussing weekly assignments)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sg-sched" className="text-xs font-semibold">
                  Meeting Schedule
                </Label>
                <Input
                  id="sg-sched"
                  placeholder="e.g. Every Tue & Thu @ 6:00 PM"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sg-link" className="text-xs font-semibold">
                  Google Meet / Virtual Link
                </Label>
                <Input
                  id="sg-link"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sg-tags" className="text-xs font-semibold">
                Tags (comma separated)
              </Label>
              <Input
                id="sg-tags"
                placeholder="e.g. Midterm, Revision, PYQ, Coding"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Squad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
