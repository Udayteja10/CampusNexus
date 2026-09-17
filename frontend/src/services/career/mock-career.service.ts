import {
  PlacementOpportunity,
  InternshipOpportunity,
  CareerOpportunity,
  CareerApplication,
  ResumeReviewRequest,
  SmartCollection,
  StudentCareerProfile,
  EligibilityResult,
  EligibilityCriterionResult,
  OpportunityFilters,
  OpportunityType,
} from "@/types/career.types";
import { User } from "@/types/user.types";
import { useAuthStore } from "@/store/auth.store";
import { getDepartmentId } from "@/lib/departments";
import {
  ICareerService,
  CreatePlacementInput,
  UpdatePlacementInput,
  CreateInternshipInput,
  UpdateInternshipInput,
  ApplyOpportunityInput,
  CreateResumeReviewInput,
  CreateSmartCollectionInput,
  CareerDashboardStats,
} from "./career.types";
import {
  SEED_PLACEMENTS,
  SEED_INTERNSHIPS,
  SEED_RESUME_REVIEWS,
  SEED_COLLECTIONS,
  DEFAULT_STUDENT_PROFILES,
} from "./career.seed";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  PLACEMENTS: "cn_career_placements",
  INTERNSHIPS: "cn_career_internships",
  APPLICATIONS: "cn_career_applications",
  RESUME_REVIEWS: "cn_career_resume_reviews",
  COLLECTIONS: "cn_career_collections",
  SAVED: "cn_career_saved_opportunities",
  PROFILES: "cn_career_student_profile",
  SEEDED: "cn_career_seeded",
} as const;

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to set storage for key "${key}":`, err);
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

const sleep = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockCareerService implements ICareerService {
  private ensureSeeded(): void {
    if (typeof window === "undefined") return;
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      setStorage(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
      setStorage(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);
      setStorage(STORAGE_KEYS.RESUME_REVIEWS, SEED_RESUME_REVIEWS);
      setStorage(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
      setStorage(STORAGE_KEYS.PROFILES, DEFAULT_STUDENT_PROFILES);
      setStorage(STORAGE_KEYS.APPLICATIONS, []);
      setStorage(STORAGE_KEYS.SAVED, []);
      localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
    }
  }

  private getCurrentUser(): User | null {
    return useAuthStore.getState().user;
  }

  // ─── Placements ────────────────────────────────────────────────────────────

  async getPlacements(filters?: OpportunityFilters): Promise<PlacementOpportunity[]> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    let list = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);

    // Students only see PUBLISHED or CLOSED (not DRAFT/ARCHIVED)
    if (!isAdmin) {
      list = list.filter((p) => p.status === "PUBLISHED" || p.status === "CLOSED");
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.companyName.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          p.requiredSkills.some((s) => s.toLowerCase().includes(q)) ||
          p.location.toLowerCase().includes(q)
      );
    }

    if (filters?.domain && filters.domain !== "ALL") {
      list = list.filter((p) => p.domain.toLowerCase() === filters.domain!.toLowerCase());
    }

    if (filters?.workMode && (filters.workMode as string) !== "ALL") {
      list = list.filter((p) => p.workMode === filters.workMode);
    }

    if (filters?.status && (filters.status as string) !== "ALL") {
      list = list.filter((p) => p.status === filters.status);
    }

    if (filters?.minCompensation) {
      list = list.filter((p) => p.packageLpa >= Number(filters.minCompensation));
    }

    // Optional "Eligible for me" filter
    if (filters?.eligibleOnly && user) {
      const profile = await this.getStudentCareerProfile();
      const eligibleList: PlacementOpportunity[] = [];
      for (const p of list) {
        const res = this.evaluateEligibilitySync(p, profile);
        if (res.isEligible) {
          eligibleList.push(p);
        }
      }
      list = eligibleList;
    }

    return list;
  }

  async getPlacementById(id: string): Promise<PlacementOpportunity | null> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    const list = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
    const item = list.find((p) => p.id === id);
    if (!item) return null;

    if (!isAdmin && item.status === "DRAFT") {
      return null;
    }

    return item;
  }

  async createPlacement(input: CreatePlacementInput): Promise<PlacementOpportunity> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Administrators can create placement openings.");
    }

    const newPlacement: PlacementOpportunity = {
      id: generateId("place"),
      type: "PLACEMENT",
      companyName: input.companyName.trim(),
      companyLogo: input.companyLogo,
      companyWebsite: input.companyWebsite,
      role: input.role.trim(),
      domain: input.domain || "Software Engineering",
      description: input.description.trim(),
      responsibilities: input.responsibilities || [],
      packageLpa: input.packageLpa,
      packageDetails: input.packageDetails,
      location: input.location.trim(),
      workMode: input.workMode || "HYBRID",
      requiredSkills: input.requiredSkills || [],
      eligibility: {
        ...input.eligibility,
        eligibleYears: [4], // Platform hard rule
      },
      applicationDeadline: input.applicationDeadline,
      driveDate: input.driveDate,
      selectionRounds: input.selectionRounds,
      applicationMethod: input.applicationMethod || "DIRECT",
      applicationUrl: input.applicationUrl,
      status: input.status || "DRAFT",
      applicantsCount: 0,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
    list.unshift(newPlacement);
    setStorage(STORAGE_KEYS.PLACEMENTS, list);
    return newPlacement;
  }

  async updatePlacement(id: string, input: UpdatePlacementInput): Promise<PlacementOpportunity> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Administrators can update placement openings.");
    }

    const list = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Placement opening not found.");

    const updated: PlacementOpportunity = {
      ...list[index],
      ...input,
      eligibility: input.eligibility
        ? { ...input.eligibility, eligibleYears: [4] }
        : list[index].eligibility,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    setStorage(STORAGE_KEYS.PLACEMENTS, list);
    return updated;
  }

  async publishPlacement(id: string): Promise<PlacementOpportunity> {
    return this.updatePlacement(id, { status: "PUBLISHED" });
  }

  async unpublishPlacement(id: string): Promise<PlacementOpportunity> {
    return this.updatePlacement(id, { status: "DRAFT" });
  }

  async closePlacement(id: string): Promise<PlacementOpportunity> {
    return this.updatePlacement(id, { status: "CLOSED" });
  }

  async deletePlacement(id: string): Promise<boolean> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Administrators can delete placement openings.");
    }

    let list = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
    list = list.filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PLACEMENTS, list);
    return true;
  }

  // ─── Internships ───────────────────────────────────────────────────────────

  async getInternships(filters?: OpportunityFilters): Promise<InternshipOpportunity[]> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    let list = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);

    if (!isAdmin) {
      list = list.filter((i) => i.status === "PUBLISHED" || i.status === "CLOSED");
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.companyName.toLowerCase().includes(q) ||
          i.role.toLowerCase().includes(q) ||
          i.domain.toLowerCase().includes(q) ||
          i.requiredSkills.some((s) => s.toLowerCase().includes(q)) ||
          i.location.toLowerCase().includes(q)
      );
    }

    if (filters?.domain && filters.domain !== "ALL") {
      list = list.filter((i) => i.domain.toLowerCase() === filters.domain!.toLowerCase());
    }

    if (filters?.workMode && (filters.workMode as string) !== "ALL") {
      list = list.filter((i) => i.workMode === filters.workMode);
    }

    if (filters?.status && (filters.status as string) !== "ALL") {
      list = list.filter((i) => i.status === filters.status);
    }

    if (filters?.minCompensation) {
      list = list.filter((i) => i.stipendMonthly >= Number(filters.minCompensation));
    }

    // Optional "Eligible for me" filter
    if (filters?.eligibleOnly && user) {
      const profile = await this.getStudentCareerProfile();
      const eligibleList: InternshipOpportunity[] = [];
      for (const item of list) {
        const res = this.evaluateEligibilitySync(item, profile);
        if (res.isEligible) {
          eligibleList.push(item);
        }
      }
      list = eligibleList;
    }

    return list;
  }

  async getInternshipById(id: string): Promise<InternshipOpportunity | null> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    const list = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);
    const item = list.find((i) => i.id === id);
    if (!item) return null;

    if (!isAdmin && item.status === "DRAFT") {
      return null;
    }

    return item;
  }

  async createInternship(input: CreateInternshipInput): Promise<InternshipOpportunity> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Administrators can create internship openings.");
    }

    const newInternship: InternshipOpportunity = {
      id: generateId("intern"),
      type: "INTERNSHIP",
      companyName: input.companyName.trim(),
      companyLogo: input.companyLogo,
      companyWebsite: input.companyWebsite,
      role: input.role.trim(),
      domain: input.domain || "Software Engineering",
      description: input.description.trim(),
      responsibilities: input.responsibilities || [],
      stipendMonthly: input.stipendMonthly,
      stipendDetails: input.stipendDetails,
      durationMonths: input.durationMonths || 3,
      location: input.location.trim(),
      workMode: input.workMode || "HYBRID",
      requiredSkills: input.requiredSkills || [],
      eligibility: {
        ...input.eligibility,
        eligibleYears: [3], // Platform hard rule
      },
      applicationDeadline: input.applicationDeadline,
      startDate: input.startDate,
      applicationMethod: input.applicationMethod || "DIRECT",
      applicationUrl: input.applicationUrl,
      status: input.status || "DRAFT",
      applicantsCount: 0,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);
    list.unshift(newInternship);
    setStorage(STORAGE_KEYS.INTERNSHIPS, list);
    return newInternship;
  }

  async updateInternship(id: string, input: UpdateInternshipInput): Promise<InternshipOpportunity> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Administrators can update internship openings.");
    }

    const list = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Internship opening not found.");

    const updated: InternshipOpportunity = {
      ...list[index],
      ...input,
      eligibility: input.eligibility
        ? { ...input.eligibility, eligibleYears: [3] }
        : list[index].eligibility,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    setStorage(STORAGE_KEYS.INTERNSHIPS, list);
    return updated;
  }

  async publishInternship(id: string): Promise<InternshipOpportunity> {
    return this.updateInternship(id, { status: "PUBLISHED" });
  }

  async unpublishInternship(id: string): Promise<InternshipOpportunity> {
    return this.updateInternship(id, { status: "DRAFT" });
  }

  async closeInternship(id: string): Promise<InternshipOpportunity> {
    return this.updateInternship(id, { status: "CLOSED" });
  }

  async deleteInternship(id: string): Promise<boolean> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Administrators can delete internship openings.");
    }

    let list = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);
    list = list.filter((i) => i.id !== id);
    setStorage(STORAGE_KEYS.INTERNSHIPS, list);
    return true;
  }

  // ─── Eligibility Engine ────────────────────────────────────────────────────

  public evaluateEligibilitySync(
    opportunity: CareerOpportunity,
    profile: StudentCareerProfile
  ): EligibilityResult {
    const reasons: string[] = [];
    const criteria: EligibilityCriterionResult[] = [];

    // 1. Mandatory Platform-Level Academic Year Rule
    if (opportunity.type === "PLACEMENT") {
      const isFourthYear = profile.currentYear === 4;
      criteria.push({
        key: "platform_year",
        label: "Academic Year (Platform Rule)",
        passed: isFourthYear,
        required: "4th Year Students Only",
        actual: `${profile.currentYear}${profile.currentYear === 1 ? "st" : profile.currentYear === 2 ? "nd" : profile.currentYear === 3 ? "rd" : "th"} Year`,
      });
      if (!isFourthYear) {
        reasons.push(
          `Placements are strictly for 4th-year students (Your current year: Year ${profile.currentYear}).`
        );
      }
    } else if (opportunity.type === "INTERNSHIP") {
      const isThirdYear = profile.currentYear === 3;
      criteria.push({
        key: "platform_year",
        label: "Academic Year (Platform Rule)",
        passed: isThirdYear,
        required: "3rd Year Students Only",
        actual: `${profile.currentYear}${profile.currentYear === 1 ? "st" : profile.currentYear === 2 ? "nd" : profile.currentYear === 3 ? "rd" : "th"} Year`,
      });
      if (!isThirdYear) {
        reasons.push(
          `Internships are strictly for 3rd-year students (Your current year: Year ${profile.currentYear}).`
        );
      }
    }

    // 2. Department Criteria
    const deptResolved = getDepartmentId(profile.department);
    const studentDeptId = (deptResolved || "cse").toLowerCase();
    const eligibleDepts = opportunity.eligibility.eligibleDepartments.map((d) => d.toLowerCase());
    const isDeptAllowed =
      eligibleDepts.includes("all") || eligibleDepts.includes(studentDeptId);

    criteria.push({
      key: "department",
      label: "Department / Branch",
      passed: isDeptAllowed,
      required: eligibleDepts.includes("all")
        ? "All Departments Eligible"
        : opportunity.eligibility.eligibleDepartments.map((d) => d.toUpperCase()).join(", "),
      actual: profile.department,
    });

    if (!isDeptAllowed) {
      reasons.push(
        `Department restriction: Requires ${opportunity.eligibility.eligibleDepartments.map((d) => d.toUpperCase()).join(" or ")}; your branch is ${profile.department}.`
      );
    }

    // 3. Minimum CGPA Criteria
    if (opportunity.eligibility.minCgpa !== undefined && opportunity.eligibility.minCgpa > 0) {
      const meetsCgpa = profile.cgpa >= opportunity.eligibility.minCgpa;
      criteria.push({
        key: "cgpa",
        label: "Minimum CGPA Cutoff",
        passed: meetsCgpa,
        required: `≥ ${opportunity.eligibility.minCgpa.toFixed(1)}`,
        actual: profile.cgpa.toFixed(2),
      });
      if (!meetsCgpa) {
        reasons.push(
          `Minimum CGPA requirement: Requires ≥ ${opportunity.eligibility.minCgpa.toFixed(1)}; your current CGPA is ${profile.cgpa.toFixed(2)}.`
        );
      }
    }

    // 4. Maximum Backlogs Criteria
    if (opportunity.eligibility.maxBacklogs !== undefined) {
      const meetsBacklogs = profile.backlogsCount <= opportunity.eligibility.maxBacklogs;
      criteria.push({
        key: "backlogs",
        label: "Active Backlogs",
        passed: meetsBacklogs,
        required: `≤ ${opportunity.eligibility.maxBacklogs} backlogs`,
        actual: `${profile.backlogsCount} active`,
      });
      if (!meetsBacklogs) {
        reasons.push(
          `Backlog limit exceeded: Maximum ${opportunity.eligibility.maxBacklogs} active backlogs allowed; you have ${profile.backlogsCount}.`
        );
      }
    }

    // 5. Opportunity Status & Deadline
    const isPublished = opportunity.status === "PUBLISHED";
    const isDeadlineActive = new Date(opportunity.applicationDeadline) > new Date();
    if (!isPublished) {
      criteria.push({
        key: "status",
        label: "Opportunity Status",
        passed: false,
        required: "PUBLISHED",
        actual: opportunity.status,
      });
      reasons.push(`This opportunity is currently ${opportunity.status} and not accepting applications.`);
    } else if (!isDeadlineActive) {
      criteria.push({
        key: "deadline",
        label: "Application Window",
        passed: false,
        required: "Active Deadline",
        actual: "Expired",
      });
      reasons.push("The application deadline has passed.");
    }

    const isEligible = reasons.length === 0;

    return {
      status: isEligible ? "ELIGIBLE" : "NOT_ELIGIBLE",
      isEligible,
      reasons,
      criteria,
    };
  }

  async evaluateEligibility(opportunity: CareerOpportunity): Promise<EligibilityResult> {
    const profile = await this.getStudentCareerProfile();
    return this.evaluateEligibilitySync(opportunity, profile);
  }

  // ─── Applications ──────────────────────────────────────────────────────────

  async getMyApplications(): Promise<CareerApplication[]> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return [];

    const applications = getStorage<CareerApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    return applications.filter((app) => app.studentId === user.id);
  }

  async getApplicationForOpportunity(opportunityId: string): Promise<CareerApplication | null> {
    await sleep(100);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return null;

    const applications = getStorage<CareerApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    return (
      applications.find((app) => app.opportunityId === opportunityId && app.studentId === user.id) || null
    );
  }

  async applyToOpportunity(input: ApplyOpportunityInput): Promise<CareerApplication> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please log in to submit an application.");

    // Fetch opportunity
    let opportunity: CareerOpportunity | null = null;
    if (input.opportunityType === "PLACEMENT") {
      opportunity = await this.getPlacementById(input.opportunityId);
    } else {
      opportunity = await this.getInternshipById(input.opportunityId);
    }

    if (!opportunity) throw new Error("Opportunity not found.");

    // Evaluate eligibility
    const profile = await this.getStudentCareerProfile();
    const eligibility = this.evaluateEligibilitySync(opportunity, profile);
    if (!eligibility.isEligible) {
      throw new Error(`Cannot apply: ${eligibility.reasons.join(" ")}`);
    }

    // Check duplicate
    const applications = getStorage<CareerApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const existing = applications.find(
      (a) => a.opportunityId === input.opportunityId && a.studentId === user.id
    );
    if (existing) {
      throw new Error("You have already submitted an application for this opportunity.");
    }

    const newApp: CareerApplication = {
      id: generateId("app"),
      opportunityId: opportunity.id,
      opportunityType: opportunity.type,
      companyName: opportunity.companyName,
      role: opportunity.role,
      studentId: user.id,
      studentName: user.fullName || user.username,
      studentEmail: user.email,
      studentDepartment: profile.department,
      studentYear: profile.currentYear,
      studentCgpa: profile.cgpa,
      resumeTitle: input.resumeTitle.trim() || profile.resumeTitle || "Student_Resume.pdf",
      notes: input.notes?.trim(),
      status: "APPLIED",
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    applications.unshift(newApp);
    setStorage(STORAGE_KEYS.APPLICATIONS, applications);

    // Increment applicant count on opportunity
    if (opportunity.type === "PLACEMENT") {
      const placements = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
      const idx = placements.findIndex((p) => p.id === opportunity!.id);
      if (idx !== -1) {
        placements[idx].applicantsCount += 1;
        setStorage(STORAGE_KEYS.PLACEMENTS, placements);
      }
    } else {
      const internships = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);
      const idx = internships.findIndex((i) => i.id === opportunity!.id);
      if (idx !== -1) {
        internships[idx].applicantsCount += 1;
        setStorage(STORAGE_KEYS.INTERNSHIPS, internships);
      }
    }

    return newApp;
  }

  async withdrawApplication(applicationId: string): Promise<boolean> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const applications = getStorage<CareerApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const index = applications.findIndex((a) => a.id === applicationId);
    if (index === -1) throw new Error("Application not found.");

    if (applications[index].studentId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized: You can only withdraw your own applications.");
    }

    applications[index].status = "WITHDRAWN";
    applications[index].updatedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.APPLICATIONS, applications);
    return true;
  }

  // ─── Bookmarks & Saved ─────────────────────────────────────────────────────

  async getSavedOpportunityIds(): Promise<string[]> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return [];
    const map = getStorage<Record<string, string[]>>(STORAGE_KEYS.SAVED, {});
    return map[user.id] || [];
  }

  async toggleBookmark(opportunityId: string): Promise<{ saved: boolean }> {
    await sleep(100);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please log in to save opportunities.");

    const map = getStorage<Record<string, string[]>>(STORAGE_KEYS.SAVED, {});
    const userSaved = new Set(map[user.id] || []);

    let saved = false;
    if (userSaved.has(opportunityId)) {
      userSaved.delete(opportunityId);
      saved = false;
    } else {
      userSaved.add(opportunityId);
      saved = true;
    }

    map[user.id] = Array.from(userSaved);
    setStorage(STORAGE_KEYS.SAVED, map);
    return { saved };
  }

  async isBookmarked(opportunityId: string): Promise<boolean> {
    const ids = await this.getSavedOpportunityIds();
    return ids.includes(opportunityId);
  }

  async getSavedOpportunities(): Promise<CareerOpportunity[]> {
    await sleep(150);
    const savedIds = await this.getSavedOpportunityIds();
    if (savedIds.length === 0) return [];

    const placements = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
    const internships = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);

    const all: CareerOpportunity[] = [...placements, ...internships];
    return all.filter((o) => savedIds.includes(o.id));
  }

  // ─── Smart Collections ─────────────────────────────────────────────────────

  async getCollections(): Promise<SmartCollection[]> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return [];

    const collections = getStorage<SmartCollection[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    return collections.filter((c) => c.studentId === user.id);
  }

  async getCollectionById(id: string): Promise<SmartCollection | null> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return null;

    const collections = getStorage<SmartCollection[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    const col = collections.find((c) => c.id === id);
    if (!col || col.studentId !== user.id) return null;
    return col;
  }

  async createCollection(input: CreateSmartCollectionInput): Promise<SmartCollection> {
    await sleep(200);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please log in to create a collection.");

    const newCol: SmartCollection = {
      id: generateId("col"),
      studentId: user.id,
      name: input.name.trim(),
      description: input.description?.trim(),
      color: input.color || "#6366f1",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const collections = getStorage<SmartCollection[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    collections.unshift(newCol);
    setStorage(STORAGE_KEYS.COLLECTIONS, collections);
    return newCol;
  }

  async updateCollection(id: string, input: Partial<CreateSmartCollectionInput>): Promise<SmartCollection> {
    await sleep(200);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const collections = getStorage<SmartCollection[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    const index = collections.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Collection not found.");

    if (collections[index].studentId !== user.id) {
      throw new Error("Unauthorized: You can only edit your own collections.");
    }

    const updated: SmartCollection = {
      ...collections[index],
      name: input.name !== undefined ? input.name.trim() : collections[index].name,
      description: input.description !== undefined ? input.description?.trim() : collections[index].description,
      color: input.color || collections[index].color,
      updatedAt: new Date().toISOString(),
    };

    collections[index] = updated;
    setStorage(STORAGE_KEYS.COLLECTIONS, collections);
    return updated;
  }

  async deleteCollection(id: string): Promise<boolean> {
    await sleep(200);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    let collections = getStorage<SmartCollection[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    const col = collections.find((c) => c.id === id);
    if (!col) throw new Error("Collection not found.");

    if (col.studentId !== user.id) {
      throw new Error("Unauthorized: You can only delete your own collections.");
    }

    collections = collections.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.COLLECTIONS, collections);
    return true;
  }

  async addOpportunityToCollection(
    collectionId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
    note?: string
  ): Promise<SmartCollection> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const collections = getStorage<SmartCollection[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    const colIndex = collections.findIndex((c) => c.id === collectionId);
    if (colIndex === -1) throw new Error("Collection not found.");

    const col = collections[colIndex];
    if (col.studentId !== user.id) {
      throw new Error("Unauthorized: You can only modify your own collections.");
    }

    // Check if already in collection
    if (col.items.some((i) => i.opportunityId === opportunityId)) {
      throw new Error("This opportunity is already in the collection.");
    }

    // Fetch opportunity summary
    let opp: CareerOpportunity | null = null;
    if (opportunityType === "PLACEMENT") {
      opp = await this.getPlacementById(opportunityId);
    } else {
      opp = await this.getInternshipById(opportunityId);
    }

    if (!opp) throw new Error("Opportunity not found.");

    const compensationDisplay =
      opp.type === "PLACEMENT"
        ? `₹${opp.packageLpa.toFixed(1)} LPA`
        : `₹${opp.stipendMonthly.toLocaleString("en-IN")}/mo`;

    col.items.unshift({
      id: generateId("item"),
      opportunityId: opp.id,
      opportunityType: opp.type,
      companyName: opp.companyName,
      role: opp.role,
      location: opp.location,
      compensationDisplay,
      addedAt: new Date().toISOString(),
      note: note?.trim(),
    });

    col.updatedAt = new Date().toISOString();
    collections[colIndex] = col;
    setStorage(STORAGE_KEYS.COLLECTIONS, collections);
    return col;
  }

  async removeOpportunityFromCollection(
    collectionId: string,
    opportunityId: string
  ): Promise<SmartCollection> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const collections = getStorage<SmartCollection[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    const colIndex = collections.findIndex((c) => c.id === collectionId);
    if (colIndex === -1) throw new Error("Collection not found.");

    const col = collections[colIndex];
    if (col.studentId !== user.id) {
      throw new Error("Unauthorized: You can only modify your own collections.");
    }

    col.items = col.items.filter((i) => i.opportunityId !== opportunityId);
    col.updatedAt = new Date().toISOString();
    collections[colIndex] = col;
    setStorage(STORAGE_KEYS.COLLECTIONS, collections);
    return col;
  }

  // ─── Resume Review ─────────────────────────────────────────────────────────

  async getMyResumeReviews(): Promise<ResumeReviewRequest[]> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return [];

    const list = getStorage<ResumeReviewRequest[]>(STORAGE_KEYS.RESUME_REVIEWS, SEED_RESUME_REVIEWS);
    return list.filter((r) => r.studentId === user.id);
  }

  async getResumeReviewById(id: string): Promise<ResumeReviewRequest | null> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return null;

    const list = getStorage<ResumeReviewRequest[]>(STORAGE_KEYS.RESUME_REVIEWS, SEED_RESUME_REVIEWS);
    const req = list.find((r) => r.id === id);
    if (!req) return null;

    if (req.studentId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized: Resume review requests are private.");
    }

    return req;
  }

  async createResumeReview(input: CreateResumeReviewInput): Promise<ResumeReviewRequest> {
    await sleep(250);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please log in to submit a resume review request.");

    const profile = await this.getStudentCareerProfile();

    const newReq: ResumeReviewRequest = {
      id: generateId("rev-req"),
      studentId: user.id,
      studentName: user.fullName || user.username,
      studentEmail: user.email,
      studentDepartment: profile.department,
      targetRole: input.targetRole.trim(),
      targetCompany: input.targetCompany?.trim(),
      resumeTitle: input.resumeTitle.trim() || profile.resumeTitle || "Student_Resume.pdf",
      resumeFileName: input.resumeFileName.trim() || "Resume.pdf",
      notes: input.notes?.trim(),
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = getStorage<ResumeReviewRequest[]>(STORAGE_KEYS.RESUME_REVIEWS, SEED_RESUME_REVIEWS);
    list.unshift(newReq);
    setStorage(STORAGE_KEYS.RESUME_REVIEWS, list);
    return newReq;
  }

  async deleteResumeReview(id: string): Promise<boolean> {
    await sleep(200);
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    let list = getStorage<ResumeReviewRequest[]>(STORAGE_KEYS.RESUME_REVIEWS, SEED_RESUME_REVIEWS);
    const req = list.find((r) => r.id === id);
    if (!req) throw new Error("Resume review request not found.");

    if (req.studentId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized: You can only delete your own review requests.");
    }

    list = list.filter((r) => r.id !== id);
    setStorage(STORAGE_KEYS.RESUME_REVIEWS, list);
    return true;
  }

  // ─── Student Profile ───────────────────────────────────────────────────────

  async getStudentCareerProfile(): Promise<StudentCareerProfile> {
    this.ensureSeeded();
    const user = this.getCurrentUser();

    const profilesMap = getStorage<Record<string, StudentCareerProfile>>(
      STORAGE_KEYS.PROFILES,
      DEFAULT_STUDENT_PROFILES
    );

    if (user && profilesMap[user.id]) {
      return profilesMap[user.id];
    }

    // Default fallback constructed from current user
    const defaultProfile: StudentCareerProfile = {
      studentId: user?.id || "guest",
      studentName: user?.fullName || user?.username || "Student",
      department: user?.department || "Computer Science & Engineering",
      currentYear: 4, // default 4th year for testing
      cgpa: 8.2,
      backlogsCount: 0,
      skills: ["Java", "Python", "Data Structures", "Algorithms", "React", "SQL"],
      resumeTitle: "Student_Resume_2025.pdf",
      preferredDomains: ["Software Engineering", "Cloud"],
      graduationYear: "2025",
    };

    return defaultProfile;
  }

  async updateStudentCareerProfile(
    profile: Partial<StudentCareerProfile>
  ): Promise<StudentCareerProfile> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const profilesMap = getStorage<Record<string, StudentCareerProfile>>(
      STORAGE_KEYS.PROFILES,
      DEFAULT_STUDENT_PROFILES
    );

    const existing = await this.getStudentCareerProfile();
    const updated: StudentCareerProfile = {
      ...existing,
      ...profile,
      studentId: user.id,
      studentName: user.fullName || user.username,
      department: user.department || existing.department,
    };

    profilesMap[user.id] = updated;
    setStorage(STORAGE_KEYS.PROFILES, profilesMap);
    return updated;
  }

  // ─── Dashboard Stats ───────────────────────────────────────────────────────

  async getCareerStats(): Promise<CareerDashboardStats> {
    await sleep(150);
    this.ensureSeeded();
    const user = this.getCurrentUser();

    const placements = getStorage<PlacementOpportunity[]>(STORAGE_KEYS.PLACEMENTS, SEED_PLACEMENTS);
    const internships = getStorage<InternshipOpportunity[]>(STORAGE_KEYS.INTERNSHIPS, SEED_INTERNSHIPS);
    const applications = getStorage<CareerApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const reviews = getStorage<ResumeReviewRequest[]>(STORAGE_KEYS.RESUME_REVIEWS, SEED_RESUME_REVIEWS);
    const savedIds = await this.getSavedOpportunityIds();

    const activePlacements = placements.filter((p) => p.status === "PUBLISHED");
    const activeInternships = internships.filter((i) => i.status === "PUBLISHED");

    let eligibleCount = 0;
    if (user) {
      const profile = await this.getStudentCareerProfile();
      for (const p of activePlacements) {
        if (this.evaluateEligibilitySync(p, profile).isEligible) eligibleCount++;
      }
      for (const i of activeInternships) {
        if (this.evaluateEligibilitySync(i, profile).isEligible) eligibleCount++;
      }
    }

    const myApps = user ? applications.filter((a) => a.studentId === user.id) : [];
    const myReviews = user ? reviews.filter((r) => r.studentId === user.id) : [];

    return {
      activePlacementsCount: activePlacements.length,
      activeInternshipsCount: activeInternships.length,
      myApplicationsCount: myApps.length,
      savedOpportunitiesCount: savedIds.length,
      pendingResumeReviewsCount: myReviews.filter((r) => r.status === "SUBMITTED" || r.status === "IN_REVIEW").length,
      eligibleOpportunitiesCount: eligibleCount,
    };
  }
}

export const careerService = new MockCareerService();
export const mockCareerService = careerService;
