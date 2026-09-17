// ─── Career Types ─────────────────────────────────────────────────────────────

export type OpportunityType = "PLACEMENT" | "INTERNSHIP";

export type OpportunityStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export type WorkMode = "ONSITE" | "HYBRID" | "REMOTE";

export type ApplicationMethod = "DIRECT" | "EXTERNAL" | "PORTAL";

export type EligibilityStatus = "ELIGIBLE" | "NOT_ELIGIBLE" | "MISSING_PROFILE_DATA";

export interface EligibilityCriterionResult {
  key: string;
  label: string;
  passed: boolean;
  required: string;
  actual: string;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  isEligible: boolean;
  reasons: string[];
  criteria: EligibilityCriterionResult[];
}

export interface EligibilityCriteria {
  /** Department slugs (e.g. "cse", "ece") or ["all"] */
  eligibleDepartments: string[];
  /** Allowed academic years e.g. [4] for placements, [3] for internships */
  eligibleYears?: number[];
  /** Minimum CGPA required (0 - 10) */
  minCgpa?: number;
  /** Maximum active backlogs allowed (default 0) */
  maxBacklogs?: number;
  /** Mandatory or preferred skills */
  requiredSkills?: string[];
  /** Expected graduation batch/year e.g. "2025" */
  graduationYear?: string;
}

export interface PlacementOpportunity {
  id: string;
  type: "PLACEMENT";
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  role: string;
  domain: string; // e.g. "Software Engineering", "AI/ML", "Embedded Systems", "Product"
  description: string;
  responsibilities: string[];
  packageLpa: number; // in Lakhs Per Annum
  packageDetails?: string; // e.g. "₹12 LPA (Fixed: ₹10 LPA + Performance: ₹2 LPA)"
  location: string;
  workMode: WorkMode;
  requiredSkills: string[];
  eligibility: EligibilityCriteria;
  applicationDeadline: string; // ISO string
  driveDate?: string; // ISO string
  selectionRounds?: string[];
  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  status: OpportunityStatus;
  applicantsCount: number;
  createdBy: string; // Admin userId
  createdAt: string;
  updatedAt: string;
}

export interface InternshipOpportunity {
  id: string;
  type: "INTERNSHIP";
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  role: string;
  domain: string;
  description: string;
  responsibilities: string[];
  stipendMonthly: number; // in INR per month
  stipendDetails?: string; // e.g. "₹45,000 / month + Pre-placement Offer"
  durationMonths: number;
  location: string;
  workMode: WorkMode;
  requiredSkills: string[];
  eligibility: EligibilityCriteria;
  applicationDeadline: string; // ISO string
  startDate?: string; // ISO string
  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  status: OpportunityStatus;
  applicantsCount: number;
  createdBy: string; // Admin userId
  createdAt: string;
  updatedAt: string;
}

export type CareerOpportunity = PlacementOpportunity | InternshipOpportunity;

// ─── Applications ────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface CareerApplication {
  id: string;
  opportunityId: string;
  opportunityType: OpportunityType;
  companyName: string;
  role: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentYear: number;
  studentCgpa: number;
  resumeTitle: string;
  notes?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

// ─── Resume Review ───────────────────────────────────────────────────────────

export type ResumeReviewStatus = "SUBMITTED" | "IN_REVIEW" | "REVIEWED" | "COMPLETED";

export interface ResumeReviewScoreBreakdown {
  formatting: number; // 0 - 100
  content: number; // 0 - 100
  skillsImpact: number; // 0 - 100
  brevity: number; // 0 - 100
}

export interface ResumeReviewFeedback {
  id: string;
  reviewerName: string;
  overallScore: number; // 0 - 100
  sectionScores: ResumeReviewScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  reviewedAt: string;
}

export interface ResumeReviewRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  targetRole: string;
  targetCompany?: string;
  resumeTitle: string;
  resumeFileName: string;
  notes?: string;
  status: ResumeReviewStatus;
  feedback?: ResumeReviewFeedback;
  createdAt: string;
  updatedAt: string;
}

// ─── Smart Collections ───────────────────────────────────────────────────────

export interface SmartCollectionItem {
  id: string;
  opportunityId: string;
  opportunityType: OpportunityType;
  companyName: string;
  role: string;
  location: string;
  compensationDisplay: string;
  addedAt: string;
  note?: string;
}

export interface SmartCollection {
  id: string;
  studentId: string;
  name: string;
  description?: string;
  color?: string; // hex or tailwind color token
  items: SmartCollectionItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Student Career Profile ──────────────────────────────────────────────────

export interface StudentCareerProfile {
  studentId: string;
  studentName: string;
  department: string;
  currentYear: number; // 1, 2, 3, or 4
  cgpa: number;
  backlogsCount: number;
  skills: string[];
  resumeTitle?: string;
  preferredDomains?: string[];
  graduationYear?: string;
}

// ─── Filters & Search ────────────────────────────────────────────────────────

export interface OpportunityFilters {
  search?: string;
  domain?: string;
  workMode?: WorkMode;
  status?: OpportunityStatus;
  eligibleOnly?: boolean;
  minCgpa?: number;
  minCompensation?: number;
  department?: string;
  includeDrafts?: boolean;
}
