import {
  PlacementOpportunity,
  InternshipOpportunity,
  CareerOpportunity,
  CareerApplication,
  ResumeReviewRequest,
  SmartCollection,
  StudentCareerProfile,
  EligibilityResult,
  OpportunityFilters,
  OpportunityType,
  WorkMode,
  ApplicationMethod,
  OpportunityStatus,
  EligibilityCriteria,
} from "@/types/career.types";

export interface CreatePlacementInput {
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  role: string;
  domain: string;
  description: string;
  responsibilities: string[];
  packageLpa: number;
  packageDetails?: string;
  location: string;
  workMode: WorkMode;
  requiredSkills: string[];
  eligibility: EligibilityCriteria;
  applicationDeadline: string;
  driveDate?: string;
  selectionRounds?: string[];
  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  status?: OpportunityStatus;
}

export type UpdatePlacementInput = Partial<CreatePlacementInput>;

export interface CreateInternshipInput {
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  role: string;
  domain: string;
  description: string;
  responsibilities: string[];
  stipendMonthly: number;
  stipendDetails?: string;
  durationMonths: number;
  location: string;
  workMode: WorkMode;
  requiredSkills: string[];
  eligibility: EligibilityCriteria;
  applicationDeadline: string;
  startDate?: string;
  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  status?: OpportunityStatus;
}

export type UpdateInternshipInput = Partial<CreateInternshipInput>;

export interface ApplyOpportunityInput {
  opportunityId: string;
  opportunityType: OpportunityType;
  resumeTitle: string;
  notes?: string;
}

export interface CreateResumeReviewInput {
  targetRole: string;
  targetCompany?: string;
  resumeTitle: string;
  resumeFileName: string;
  notes?: string;
}

export interface CreateSmartCollectionInput {
  name: string;
  description?: string;
  color?: string;
}

export interface CareerDashboardStats {
  activePlacementsCount: number;
  activeInternshipsCount: number;
  myApplicationsCount: number;
  savedOpportunitiesCount: number;
  pendingResumeReviewsCount: number;
  eligibleOpportunitiesCount: number;
}

export interface ICareerService {
  // ─── Placements ───
  getPlacements(filters?: OpportunityFilters): Promise<PlacementOpportunity[]>;
  getPlacementById(id: string): Promise<PlacementOpportunity | null>;
  createPlacement(input: CreatePlacementInput): Promise<PlacementOpportunity>;
  updatePlacement(id: string, input: UpdatePlacementInput): Promise<PlacementOpportunity>;
  publishPlacement(id: string): Promise<PlacementOpportunity>;
  unpublishPlacement(id: string): Promise<PlacementOpportunity>;
  closePlacement(id: string): Promise<PlacementOpportunity>;
  deletePlacement(id: string): Promise<boolean>;

  // ─── Internships ───
  getInternships(filters?: OpportunityFilters): Promise<InternshipOpportunity[]>;
  getInternshipById(id: string): Promise<InternshipOpportunity | null>;
  createInternship(input: CreateInternshipInput): Promise<InternshipOpportunity>;
  updateInternship(id: string, input: UpdateInternshipInput): Promise<InternshipOpportunity>;
  publishInternship(id: string): Promise<InternshipOpportunity>;
  unpublishInternship(id: string): Promise<InternshipOpportunity>;
  closeInternship(id: string): Promise<InternshipOpportunity>;
  deleteInternship(id: string): Promise<boolean>;

  // ─── Eligibility Engine ───
  evaluateEligibility(opportunity: CareerOpportunity): Promise<EligibilityResult>;

  // ─── Applications ───
  getMyApplications(): Promise<CareerApplication[]>;
  getApplicationForOpportunity(opportunityId: string): Promise<CareerApplication | null>;
  applyToOpportunity(input: ApplyOpportunityInput): Promise<CareerApplication>;
  withdrawApplication(applicationId: string): Promise<boolean>;

  // ─── Bookmarks & Saved ───
  getSavedOpportunityIds(): Promise<string[]>;
  toggleBookmark(opportunityId: string): Promise<{ saved: boolean }>;
  isBookmarked(opportunityId: string): Promise<boolean>;
  getSavedOpportunities(): Promise<CareerOpportunity[]>;

  // ─── Smart Collections ───
  getCollections(): Promise<SmartCollection[]>;
  getCollectionById(id: string): Promise<SmartCollection | null>;
  createCollection(input: CreateSmartCollectionInput): Promise<SmartCollection>;
  updateCollection(id: string, input: Partial<CreateSmartCollectionInput>): Promise<SmartCollection>;
  deleteCollection(id: string): Promise<boolean>;
  addOpportunityToCollection(collectionId: string, opportunityId: string, opportunityType: OpportunityType, note?: string): Promise<SmartCollection>;
  removeOpportunityFromCollection(collectionId: string, opportunityId: string): Promise<SmartCollection>;

  // ─── Resume Review ───
  getMyResumeReviews(): Promise<ResumeReviewRequest[]>;
  getResumeReviewById(id: string): Promise<ResumeReviewRequest | null>;
  createResumeReview(input: CreateResumeReviewInput): Promise<ResumeReviewRequest>;
  deleteResumeReview(id: string): Promise<boolean>;

  // ─── Student Profile ───
  getStudentCareerProfile(): Promise<StudentCareerProfile>;
  updateStudentCareerProfile(profile: Partial<StudentCareerProfile>): Promise<StudentCareerProfile>;

  // ─── Dashboard Stats ───
  getCareerStats(): Promise<CareerDashboardStats>;
}
