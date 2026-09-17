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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase } from "lucide-react";
import {
  PlacementOpportunity,
  WorkMode,
  OpportunityStatus,
  ApplicationMethod,
} from "@/types/career.types";
import { careerService } from "@/services/career";
import { toast } from "@/lib/toast";

interface PlacementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: PlacementOpportunity | null;
  onSuccess?: () => void;
}

const DEPARTMENTS = [
  { id: "all", label: "All Departments" },
  { id: "cse", label: "Computer Science (CSE)" },
  { id: "it", label: "Information Technology (IT)" },
  { id: "ece", label: "Electronics & Communication (ECE)" },
  { id: "eee", label: "Electrical & Electronics (EEE)" },
  { id: "mech", label: "Mechanical Engineering (MECH)" },
  { id: "civil", label: "Civil Engineering (CIVIL)" },
];

interface PlacementFormInnerProps {
  placement?: PlacementOpportunity | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

function PlacementFormInner({ placement, onCancel, onSuccess }: PlacementFormInnerProps) {
  const isEditing = Boolean(placement);

  const [companyName, setCompanyName] = useState(placement?.companyName ?? "");
  const [companyWebsite, setCompanyWebsite] = useState(placement?.companyWebsite ?? "");
  const [role, setRole] = useState(placement?.role ?? "");
  const [domain, setDomain] = useState(placement?.domain ?? "Software Engineering");
  const [packageLpa, setPackageLpa] = useState<number>(placement?.packageLpa ?? 12.0);
  const [packageDetails, setPackageDetails] = useState(placement?.packageDetails ?? "");
  const [location, setLocation] = useState(placement?.location ?? "Hyderabad, Telangana");
  const [workMode, setWorkMode] = useState<WorkMode>(placement?.workMode ?? "HYBRID");
  const [description, setDescription] = useState(placement?.description ?? "");
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    placement?.responsibilities?.join("\n") ?? ""
  );
  const [skillsText, setSkillsText] = useState(
    placement?.requiredSkills?.join(", ") ?? "Java, Data Structures, SQL"
  );
  const [selectedDepts, setSelectedDepts] = useState<string[]>(
    placement?.eligibility?.eligibleDepartments ?? ["cse", "it"]
  );
  const [minCgpa, setMinCgpa] = useState<number>(placement?.eligibility?.minCgpa ?? 7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(placement?.eligibility?.maxBacklogs ?? 0);
  const [deadline, setDeadline] = useState(() => {
    if (placement?.applicationDeadline) return placement.applicationDeadline.split("T")[0];
    return "2025-10-30";
  });
  const [driveDate, setDriveDate] = useState(() => {
    if (placement?.driveDate) return placement.driveDate.split("T")[0];
    return "2025-11-15";
  });
  const [status, setStatus] = useState<OpportunityStatus>(placement?.status ?? "DRAFT");
  const [applicationMethod, setApplicationMethod] = useState<ApplicationMethod>(
    placement?.applicationMethod ?? "DIRECT"
  );
  const [applicationUrl, setApplicationUrl] = useState(placement?.applicationUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDept = (deptId: string) => {
    if (deptId === "all") {
      if (selectedDepts.includes("all")) {
        setSelectedDepts(["cse"]);
      } else {
        setSelectedDepts(["all"]);
      }
      return;
    }

    let next = selectedDepts.filter((d) => d !== "all");
    if (next.includes(deptId)) {
      next = next.filter((d) => d !== deptId);
    } else {
      next.push(deptId);
    }
    if (next.length === 0) next = ["all"];
    setSelectedDepts(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim() || !description.trim()) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedResponsibilities = responsibilitiesText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const parsedSkills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim() || undefined,
        role: role.trim(),
        domain: domain.trim(),
        description: description.trim(),
        responsibilities: parsedResponsibilities.length > 0 ? parsedResponsibilities : [description.trim()],
        packageLpa: Number(packageLpa),
        packageDetails: packageDetails.trim() || `₹${Number(packageLpa).toFixed(1)} LPA`,
        location: location.trim(),
        workMode,
        requiredSkills: parsedSkills,
        eligibility: {
          eligibleDepartments: selectedDepts,
          eligibleYears: [4], // Platform hard restriction
          minCgpa: Number(minCgpa),
          maxBacklogs: Number(maxBacklogs),
          graduationYear: "2025",
        },
        applicationDeadline: new Date(deadline).toISOString(),
        driveDate: driveDate ? new Date(driveDate).toISOString() : undefined,
        applicationMethod,
        applicationUrl: applicationUrl.trim() || undefined,
        status,
      };

      if (isEditing && placement) {
        await careerService.updatePlacement(placement.id, payload);
        toast.success(`Placement opening for ${companyName} updated.`);
      } else {
        await careerService.createPlacement(payload);
        toast.success(`Placement opening for ${companyName} created.`);
      }

      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save placement opening.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Basic details: Company & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pl-comp" className="text-xs font-semibold">
            Company Name *
          </Label>
          <Input
            id="pl-comp"
            placeholder="e.g. Google, Qualcomm, Amazon"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-9 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pl-role" className="text-xs font-semibold">
            Job Role / Title *
          </Label>
          <Input
            id="pl-role"
            placeholder="e.g. Software Development Engineer (SDE-1)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-9 text-xs"
            required
          />
        </div>
      </div>

      {/* Package & Domain */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pl-pkg" className="text-xs font-semibold">
            CTC Package (LPA) *
          </Label>
          <Input
            id="pl-pkg"
            type="number"
            step="0.5"
            min="1"
            max="150"
            value={packageLpa}
            onChange={(e) => setPackageLpa(Number(e.target.value))}
            className="h-9 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pl-pkg-det" className="text-xs font-semibold">
            Package Details / Breakdown
          </Label>
          <Input
            id="pl-pkg-det"
            placeholder="e.g. ₹12 LPA (Fixed: 10 + Perf: 2)"
            value={packageDetails}
            onChange={(e) => setPackageDetails(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pl-dom" className="text-xs font-semibold">
            Domain / Category *
          </Label>
          <Input
            id="pl-dom"
            placeholder="e.g. Software Engineering"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="h-9 text-xs"
            required
          />
        </div>
      </div>

      {/* Location, Website, Work Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pl-loc" className="text-xs font-semibold">
            Location
          </Label>
          <Input
            id="pl-loc"
            placeholder="e.g. Hyderabad, Telangana"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pl-web" className="text-xs font-semibold">
            Company Website
          </Label>
          <Input
            id="pl-web"
            placeholder="https://careers.company.com"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Work Mode</Label>
          <Select value={workMode} onValueChange={(val) => setWorkMode(val as WorkMode)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Work Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
              <SelectItem value="ONSITE">On-Site</SelectItem>
              <SelectItem value="REMOTE">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Department Eligibility */}
      <div className="space-y-1.5 p-3 rounded-xl border border-border/80 bg-muted/20">
        <Label className="text-xs font-bold text-foreground">
          Eligible Departments (Campus-Wide Discovery Maintained)
        </Label>
        <p className="text-[11px] text-muted-foreground mb-2">
          Note: Platform rule strictly applies placements to 4th-year students only.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEPARTMENTS.map((dept) => {
            const isChecked = selectedDepts.includes(dept.id);
            return (
              <div key={dept.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`dept-${dept.id}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleDept(dept.id)}
                />
                <label
                  htmlFor={`dept-${dept.id}`}
                  className="text-xs font-medium leading-none cursor-pointer text-foreground"
                >
                  {dept.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic Cutoffs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pl-cgpa" className="text-xs font-semibold">
            Minimum CGPA Cutoff
          </Label>
          <Input
            id="pl-cgpa"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={minCgpa}
            onChange={(e) => setMinCgpa(Number(e.target.value))}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pl-backlogs" className="text-xs font-semibold">
            Maximum Active Backlogs Allowed
          </Label>
          <Input
            id="pl-backlogs"
            type="number"
            min="0"
            max="10"
            value={maxBacklogs}
            onChange={(e) => setMaxBacklogs(Number(e.target.value))}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Required Skills */}
      <div className="space-y-1">
        <Label htmlFor="pl-skills" className="text-xs font-semibold">
          Required Skills (Comma separated)
        </Label>
        <Input
          id="pl-skills"
          placeholder="Java, Data Structures, Algorithms, SQL, Git"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="pl-desc" className="text-xs font-semibold">
          Job Description *
        </Label>
        <Textarea
          id="pl-desc"
          placeholder="Overview of the company team, day-to-day challenges, and technology stack..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="text-xs resize-none"
          required
        />
      </div>

      {/* Responsibilities */}
      <div className="space-y-1">
        <Label htmlFor="pl-resp" className="text-xs font-semibold">
          Key Responsibilities (One per line)
        </Label>
        <Textarea
          id="pl-resp"
          placeholder="Design and implement backend APIs in Java&#10;Optimize SQL queries and caching tiers&#10;Write automated unit and integration tests"
          value={responsibilitiesText}
          onChange={(e) => setResponsibilitiesText(e.target.value)}
          rows={3}
          className="text-xs resize-none"
        />
      </div>

      {/* Dates & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pl-deadline" className="text-xs font-semibold">
            Application Deadline *
          </Label>
          <Input
            id="pl-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="h-9 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pl-drive" className="text-xs font-semibold">
            Drive Date
          </Label>
          <Input
            id="pl-drive"
            type="date"
            value={driveDate}
            onChange={(e) => setDriveDate(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Publishing Status *</Label>
          <Select value={status} onValueChange={(val) => setStatus(val as OpportunityStatus)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft (Admin Only)</SelectItem>
              <SelectItem value="PUBLISHED">Published (Campus-Wide)</SelectItem>
              <SelectItem value="CLOSED">Closed (Archived)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Application Method & URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Application Method</Label>
          <Select
            value={applicationMethod}
            onValueChange={(val) => setApplicationMethod(val as ApplicationMethod)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIRECT">Direct Platform Application</SelectItem>
              <SelectItem value="PORTAL">On-Campus T&P Portal</SelectItem>
              <SelectItem value="EXTERNAL">External Careers Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {applicationMethod === "EXTERNAL" && (
          <div className="space-y-1">
            <Label htmlFor="pl-appurl" className="text-xs font-semibold">
              External Application URL
            </Label>
            <Input
              id="pl-appurl"
              placeholder="https://company.com/careers/job-123"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="font-semibold">
          {isSubmitting ? "Saving..." : isEditing ? "Update Placement" : "Create Placement Opening"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PlacementFormDialog({
  open,
  onOpenChange,
  placement,
  onSuccess,
}: PlacementFormDialogProps) {
  const isEditing = Boolean(placement);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>{isEditing ? `Edit Placement: ${placement?.companyName}` : "Create Placement Opening"}</span>
          </DialogTitle>
          <DialogDescription>
            Admin management console for campus placement drives (4th-year application eligible).
          </DialogDescription>
        </DialogHeader>

        {open && (
          <PlacementFormInner
            key={placement?.id || "create"}
            placement={placement}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
