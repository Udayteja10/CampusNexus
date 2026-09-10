"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Upload, FileUp, Sparkles, CheckCircle2 } from "lucide-react";
import { academicService } from "@/services/academic";
import { ResourceType, Semester, Subject } from "@/types/academic.types";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/lib/toast";

interface ResourceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onSuccess?: () => void;
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "NOTE", label: "Lecture Notes" },
  { value: "PYQ", label: "Previous Year Question Paper" },
  { value: "LAB_MANUAL", label: "Lab Manual" },
  { value: "CHEATSHEET", label: "Cheatsheet / Formulas" },
  { value: "ASSIGNMENT_SOLUTION", label: "Assignment Solution" },
  { value: "SYLLABUS", label: "Syllabus Copy" },
  { value: "REFERENCE_BOOK", label: "Reference Guide / Book" },
];

export function ResourceUploadDialog({
  open,
  onOpenChange,
  subjects,
  onSuccess,
}: ResourceUploadDialogProps) {
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState<Semester>(5);
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [resourceType, setResourceType] = useState<ResourceType>("NOTE");
  const [tags, setTags] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available subjects for the selected semester
  const availableSubjects = subjects.filter((s) => s.semester === semester);

  const isCoordinator = academicService.isDeptCoordinator();

  const handleSimulatedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for this resource.");
      return;
    }
    if (!subjectCode) {
      toast.error("Please select a subject.");
      return;
    }

    const selectedSubject = subjects.find((s) => s.code === subjectCode);
    if (!selectedSubject) {
      toast.error("Invalid subject selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await academicService.createResource({
        title: title.trim(),
        description: description.trim(),
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        semester,
        academicYear: "2024-2025",
        resourceType,
        fileUrl: `/mock/docs/${fileName || "academic_doc.pdf"}`,
        fileType: fileName ? fileName.split(".").pop() || "pdf" : "pdf",
        fileSize: fileSize || 1024 * 1024 * 2.5,
        tags: parsedTags.length > 0 ? parsedTags : ["Notes", selectedSubject.code],
      });

      toast.success(
        isCoordinator
          ? "Resource uploaded and verified by coordinator!"
          : "Resource uploaded successfully!"
      );
      onOpenChange(false);
      // Reset form
      setTitle("");
      setDescription("");
      setSubjectCode("");
      setTags("");
      setFileName("");
      setFileSize(0);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            <span>Upload Academic Resource</span>
          </DialogTitle>
          <DialogDescription>
            Share high-quality notes, question papers, and manuals with your department.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Department badge / notification */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              Publishing to{" "}
              <span className="font-semibold text-foreground">
                {user?.department || "Your Department"}
              </span>
              . Resources are organized by semester and subject code.
              {isCoordinator && (
                <div className="text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Your coordinator badge will automatically mark this resource verified.
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="res-title" className="text-xs font-semibold">
              Resource Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="res-title"
              placeholder="e.g. Complete DBMS Revision Notes (Units 1-5)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
              required
            />
          </div>

          {/* Semester & Resource Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Semester <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(semester)}
                onValueChange={(val) => {
                  setSemester(Number(val) as Semester);
                  setSubjectCode(""); // reset subject when semester changes
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Semester" />
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
              <Label className="text-xs font-semibold">
                Resource Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={resourceType}
                onValueChange={(val) => val && setResourceType(val as ResourceType)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Resource Type" />
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

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Select value={subjectCode} onValueChange={(val) => setSubjectCode(val || "")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {(availableSubjects.length > 0 ? availableSubjects : subjects).map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.code} — {s.name} (Sem {s.semester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="res-desc" className="text-xs font-semibold">
              Description & Topics Covered
            </Label>
            <Textarea
              id="res-desc"
              placeholder="Brief summary of units, topics, or key highlights covered in this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none text-xs"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="res-tags" className="text-xs font-semibold">
              Tags (comma separated)
            </Label>
            <Input
              id="res-tags"
              placeholder="e.g. Handwritten, Solved, Mid-Term, BCNF"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* File Upload Simulation */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Document File (PDF, DOCX, ZIP)
            </Label>
            <div className="border border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/40 transition-colors">
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                accept=".pdf,.docx,.doc,.zip,.pptx,.txt"
                onChange={handleSimulatedFileSelect}
              />
              <label
                htmlFor="file-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {fileName ? fileName : "Click to select or drop your file here"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Supported formats: PDF, DOCX, ZIP (Max 50MB)
                </span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Publish Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
