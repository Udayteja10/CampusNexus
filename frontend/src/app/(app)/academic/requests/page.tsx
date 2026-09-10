"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService } from "@/services/academic";
import {
  AcademicRequest,
  Subject,
  ResourceType,
  Semester,
  RequestStatus,
} from "@/types/academic.types";
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
import { RequestCard } from "@/components/academic/RequestCard";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";
import { toast } from "@/lib/toast";

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "NOTE", label: "Lecture Notes" },
  { value: "PYQ", label: "Previous Year Question Paper" },
  { value: "LAB_MANUAL", label: "Lab Manual" },
  { value: "CHEATSHEET", label: "Cheatsheet / Formulas" },
  { value: "ASSIGNMENT_SOLUTION", label: "Assignment Solution" },
  { value: "SYLLABUS", label: "Syllabus Copy" },
  { value: "REFERENCE_BOOK", label: "Reference Guide" },
];

export default function AcademicRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<AcademicRequest[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSem, setSelectedSem] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [reqTitle, setReqTitle] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [reqSem, setReqSem] = useState<Semester>(5);
  const [reqSubjectCode, setReqSubjectCode] = useState("");
  const [reqType, setReqType] = useState<ResourceType>("NOTE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deptLabel = getDepartmentLabel(user?.department);
  const deptId = getDepartmentId(user?.department) || "cse";

  const loadData = async () => {
    setLoading(true);
    try {
      const [rList, sList] = await Promise.all([
        academicService.getAcademicRequests({
          status: selectedStatus !== "ALL" ? (selectedStatus as RequestStatus) : undefined,
          semester: selectedSem !== "ALL" ? (Number(selectedSem) as Semester) : undefined,
          search: search.trim() || undefined,
        }),
        academicService.getSubjects(),
      ]);
      setRequests(rList);
      setSubjects(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedSem, search, user?.department]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqSubjectCode) {
      toast.error("Please enter a request title and subject.");
      return;
    }

    const sub = subjects.find((s) => s.code === reqSubjectCode);
    if (!sub) {
      toast.error("Invalid subject selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      await academicService.createAcademicRequest({
        title: reqTitle.trim(),
        description: reqDesc.trim(),
        subjectCode: sub.code,
        subjectName: sub.name,
        semester: reqSem,
        resourceType: reqType,
      });

      toast.success("Request submitted to your department feed!");
      setCreateDialogOpen(false);
      setReqTitle("");
      setReqDesc("");
      setReqSubjectCode("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formAvailableSubjects = subjects.filter((s) => s.semester === reqSem);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DeptBadge departmentIdOrName={deptId} size="md" />
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Peer Resource Requests
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Looking for specific notes, formula sheets, or lab programs? Ask your classmates and coordinators in {deptLabel}.
          </p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Request Study Material</span>
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests by topic, subject code, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status select */}
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "ALL")}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open Requests</SelectItem>
              <SelectItem value="FULFILLED">Fulfilled</SelectItem>
            </SelectContent>
          </Select>

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
        </div>
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : requests.length === 0 ? (
        <AcademicEmptyState
          icon={HelpCircle}
          title="No resource requests found"
          description="Can't find a study material in the repository? Create a request and notify your department peers."
          actionLabel="Request Material"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} onUpdate={loadData} />
          ))}
        </div>
      )}

      {/* Create Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span>Request Study Material</span>
            </DialogTitle>
            <DialogDescription>
              Ask your department peers or student coordinators for notes or solved question papers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-title" className="text-xs font-semibold">
                What are you looking for? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-title"
                placeholder="e.g. Unit 4 & 5 Handwritten Notes for OS Virtual Memory"
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Semester</Label>
                <Select
                  value={String(reqSem)}
                  onValueChange={(val) => {
                    setReqSem(Number(val) as Semester);
                    setReqSubjectCode("");
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
                <Label className="text-xs font-semibold">Material Type</Label>
                <Select
                  value={reqType}
                  onValueChange={(val: any) => setReqType(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Course / Subject <span className="text-destructive">*</span>
              </Label>
              <Select value={reqSubjectCode} onValueChange={(val) => setReqSubjectCode(val || "")}>
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
              <Label htmlFor="req-desc" className="text-xs font-semibold">
                Additional Context / Specific Topics
              </Label>
              <Textarea
                id="req-desc"
                placeholder="Details on what questions, chapters, or format you need..."
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
                rows={3}
                className="resize-none text-xs"
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
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
