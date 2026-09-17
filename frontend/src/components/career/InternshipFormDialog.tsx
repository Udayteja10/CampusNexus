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
import { GraduationCap } from "lucide-react";
import {
  InternshipOpportunity,
  WorkMode,
  OpportunityStatus,
  ApplicationMethod,
} from "@/types/career.types";
import { careerService } from "@/services/career";
import { toast } from "@/lib/toast";

interface InternshipFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  internship?: InternshipOpportunity | null;
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

interface InternshipFormInnerProps {
  internship?: InternshipOpportunity | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

function InternshipFormInner({ internship, onCancel, onSuccess }: InternshipFormInnerProps) {
  const isEditing = Boolean(internship);

  const [companyName, setCompanyName] = useState(internship?.companyName ?? "");
  const [companyWebsite, setCompanyWebsite] = useState(internship?.companyWebsite ?? "");
  const [role, setRole] = useState(internship?.role ?? "");
  const [domain, setDomain] = useState(internship?.domain ?? "Software Engineering");
  const [stipendMonthly, setStipendMonthly] = useState<number>(internship?.stipendMonthly ?? 40000);
  const [stipendDetails, setStipendDetails] = useState(internship?.stipendDetails ?? "");
  const [durationMonths, setDurationMonths] = useState<number>(internship?.durationMonths ?? 3);
  const [location, setLocation] = useState(internship?.location ?? "Hyderabad, Telangana");
  const [workMode, setWorkMode] = useState<WorkMode>(internship?.workMode ?? "HYBRID");
  const [description, setDescription] = useState(internship?.description ?? "");
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    internship?.responsibilities?.join("\n") ?? ""
  );
  const [skillsText, setSkillsText] = useState(
    internship?.requiredSkills?.join(", ") ?? "React, JavaScript, Data Structures"
  );
  const [selectedDepts, setSelectedDepts] = useState<string[]>(
    internship?.eligibility?.eligibleDepartments ?? ["cse", "it"]
  );
  const [minCgpa, setMinCgpa] = useState<number>(internship?.eligibility?.minCgpa ?? 7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(internship?.eligibility?.maxBacklogs ?? 0);
  const [deadline, setDeadline] = useState(() => {
    if (internship?.applicationDeadline) return internship.applicationDeadline.split("T")[0];
    return "2025-10-30";
  });
  const [startDate, setStartDate] = useState(() => {
    if (internship?.startDate) return internship.startDate.split("T")[0];
    return "2025-12-01";
  });
  const [status, setStatus] = useState<OpportunityStatus>(internship?.status ?? "DRAFT");
  const [applicationMethod, setApplicationMethod] = useState<ApplicationMethod>(
    internship?.applicationMethod ?? "DIRECT"
  );
  const [applicationUrl, setApplicationUrl] = useState(internship?.applicationUrl ?? "");
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
        stipendMonthly: Number(stipendMonthly),
        stipendDetails: stipendDetails.trim() || `₹${Number(stipendMonthly).toLocaleString("en-IN")}/mo`,
        durationMonths: Number(durationMonths),
        location: location.trim(),
        workMode,
        requiredSkills: parsedSkills,
        eligibility: {
          eligibleDepartments: selectedDepts,
          eligibleYears: [3], // Platform hard restriction
          minCgpa: Number(minCgpa),
          maxBacklogs: Number(maxBacklogs),
          graduationYear: "2026",
        },
        applicationDeadline: new Date(deadline).toISOString(),
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        applicationMethod,
        applicationUrl: applicationUrl.trim() || undefined,
        status,
      };

      if (isEditing && internship) {
        await careerService.updateInternship(internship.id, payload);
        toast.success(`Internship opening for ${companyName} updated.`);
      } else {
        await careerService.createInternship(payload);
        toast.success(`Internship opening for ${companyName} created.`);
      }

      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save internship opening.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Company & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="int-comp" className="text-xs font-semibold">
            Company Name *
          </Label>
          <Input
            id="int-comp"
            placeholder="e.g. Microsoft, Qualcomm, Adobe"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-9 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="int-role" className="text-xs font-semibold">
            Internship Role / Title *
          </Label>
          <Input
            id="int-role"
            placeholder="e.g. Software Engineering Summer Intern"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-9 text-xs"
            required
          />
        </div>
      </div>

      {/* Stipend, Duration, Domain */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="int-stipend" className="text-xs font-semibold">
            Monthly Stipend (₹) *
          </Label>
          <Input
            id="int-stipend"
            type="number"
            step="1000"
            min="0"
            value={stipendMonthly}
            onChange={(e) => setStipendMonthly(Number(e.target.value))}
            className="h-9 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="int-stipend-det" className="text-xs font-semibold">
            Stipend Details
          </Label>
          <Input
            id="int-stipend-det"
            placeholder="e.g. ₹40,000/month + ₹10,000 Relocation"
            value={stipendDetails}
            onChange={(e) => setStipendDetails(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="int-dur" className="text-xs font-semibold">
            Duration (Months) *
          </Label>
          <Input
            id="int-dur"
            type="number"
            min="1"
            max="12"
            value={durationMonths}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
            className="h-9 text-xs"
            required
          />
        </div>
      </div>

      {/* Domain, Work Mode & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="int-dom" className="text-xs font-semibold">
            Domain / Category *
          </Label>
          <Input
            id="int-dom"
            placeholder="e.g. Software Engineering"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="h-9 text-xs"
            required
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

        <div className="space-y-1">
          <Label htmlFor="int-loc" className="text-xs font-semibold">
            Location
          </Label>
          <Input
            id="int-loc"
            placeholder="e.g. Hyderabad, Telangana"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Company Website */}
      <div className="space-y-1">
        <Label htmlFor="int-web" className="text-xs font-semibold">
          Company Website / Careers Link
        </Label>
        <Input
          id="int-web"
          placeholder="https://company.com/careers"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      {/* Department Eligibility */}
      <div className="space-y-1.5 p-3 rounded-xl border border-border/80 bg-muted/20">
        <Label className="text-xs font-bold text-foreground">
          Eligible Departments (Campus-Wide Discovery Maintained)
        </Label>
        <p className="text-[11px] text-muted-foreground mb-2">
          Note: Platform rule strictly applies internships to 3rd-year students only.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEPARTMENTS.map((dept) => {
            const isChecked = selectedDepts.includes(dept.id);
            return (
              <div key={dept.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`int-dept-${dept.id}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleDept(dept.id)}
                />
                <label
                  htmlFor={`int-dept-${dept.id}`}
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
          <Label htmlFor="int-cgpa" className="text-xs font-semibold">
            Minimum CGPA Cutoff
          </Label>
          <Input
            id="int-cgpa"
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
          <Label htmlFor="int-backlogs" className="text-xs font-semibold">
            Maximum Active Backlogs Allowed
          </Label>
          <Input
            id="int-backlogs"
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
        <Label htmlFor="int-skills" className="text-xs font-semibold">
          Required Skills (Comma separated)
        </Label>
        <Input
          id="int-skills"
          placeholder="React, JavaScript, Data Structures, Git"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="int-desc" className="text-xs font-semibold">
          Internship Description *
        </Label>
        <Textarea
          id="int-desc"
          placeholder="Overview of the summer project, mentorship structure, and learning outcomes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="text-xs resize-none"
          required
        />
      </div>

      {/* Responsibilities */}
      <div className="space-y-1">
        <Label htmlFor="int-resp" className="text-xs font-semibold">
          Key Responsibilities (One per line)
        </Label>
        <Textarea
          id="int-resp"
          placeholder="Build web components using React&#10;Write clean unit tests&#10;Participate in sprint demos and presentations"
          value={responsibilitiesText}
          onChange={(e) => setResponsibilitiesText(e.target.value)}
          rows={3}
          className="text-xs resize-none"
        />
      </div>

      {/* Dates & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="int-deadline" className="text-xs font-semibold">
            Application Deadline *
          </Label>
          <Input
            id="int-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="h-9 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="int-start" className="text-xs font-semibold">
            Internship Start Date
          </Label>
          <Input
            id="int-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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
            <Label htmlFor="int-appurl" className="text-xs font-semibold">
              External Application URL
            </Label>
            <Input
              id="int-appurl"
              placeholder="https://company.com/careers/intern-123"
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
          {isSubmitting ? "Saving..." : isEditing ? "Update Internship" : "Create Internship Opening"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function InternshipFormDialog({
  open,
  onOpenChange,
  internship,
  onSuccess,
}: InternshipFormDialogProps) {
  const isEditing = Boolean(internship);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>{isEditing ? `Edit Internship: ${internship?.companyName}` : "Create Internship Opening"}</span>
          </DialogTitle>
          <DialogDescription>
            Admin management console for campus summer internships (3rd-year application eligible).
          </DialogDescription>
        </DialogHeader>

        {open && (
          <InternshipFormInner
            key={internship?.id || "create"}
            internship={internship}
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
