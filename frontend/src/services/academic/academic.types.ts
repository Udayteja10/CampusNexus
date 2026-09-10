import {
  AcademicResource,
  ResourceComment,
  ResourceFilters,
  Subject,
  StudyGroup,
  StudyGroupMember,
  StudyGroupFilters,
  Faculty,
  FacultyReview,
  FacultyFilters,
  AcademicEvent,
  WikiArticle,
  WikiCategory,
  AcademicRequest,
  RequestComment,
  AcademicRequestFilters,
  ResourceType,
  Semester,
} from "@/types/academic.types";

export interface CreateResourceInput {
  title: string;
  description?: string;
  subjectCode: string;
  subjectName: string;
  semester: Semester;
  academicYear?: string;
  resourceType: ResourceType;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  tags: string[];
}

export interface UploadNewVersionInput {
  resourceId: string;
  fileUrl: string;
  fileSize: number;
  changeLog?: string;
}

export interface CreateStudyGroupInput {
  name: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  semester: Semester;
  maxMembers: number;
  meetingLink?: string;
  meetingSchedule?: string;
  isPrivate?: boolean;
  tags?: string[];
}

export interface SubmitFacultyReviewInput {
  facultyId: string;
  rating: number;
  tags: string[];
  comment: string;
  semester: Semester;
  academicYear: string;
  isAnonymous?: boolean;
}

export interface CreateAcademicRequestInput {
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  semester: Semester;
  resourceType: ResourceType;
}

export interface CreateWikiArticleInput {
  title: string;
  content: string;
  category: WikiCategory;
  departmentId?: string;
  tags: string[];
}

export interface AcademicDashboardStats {
  totalResources: number;
  verifiedResources: number;
  activeStudyGroups: number;
  departmentFacultyCount: number;
  openRequestsCount: number;
  upcomingExamsCount: number;
}

export interface IAcademicService {
  // ─── Resources ───
  getResources(filters?: ResourceFilters): Promise<AcademicResource[]>;
  getResourceById(id: string): Promise<AcademicResource | null>;
  createResource(input: CreateResourceInput): Promise<AcademicResource>;
  deleteResource(id: string): Promise<boolean>;
  uploadNewVersion(input: UploadNewVersionInput): Promise<AcademicResource>;
  toggleUpvote(resourceId: string): Promise<{ upvoted: boolean; count: number }>;
  hasUpvoted(resourceId: string): Promise<boolean>;
  toggleBookmark(resourceId: string): Promise<{ bookmarked: boolean }>;
  isBookmarked(resourceId: string): Promise<boolean>;
  getBookmarkedResources(): Promise<AcademicResource[]>;
  verifyResource(resourceId: string): Promise<AcademicResource>;
  recordDownload(resourceId: string): Promise<number>;

  // ─── Resource Comments ───
  getResourceComments(resourceId: string): Promise<ResourceComment[]>;
  addResourceComment(resourceId: string, content: string): Promise<ResourceComment>;
  deleteResourceComment(commentId: string): Promise<boolean>;

  // ─── Subjects ───
  getSubjects(departmentId?: string, semester?: Semester): Promise<Subject[]>;
  getSubjectByCode(code: string): Promise<Subject | null>;

  // ─── Study Groups ───
  getStudyGroups(filters?: StudyGroupFilters): Promise<StudyGroup[]>;
  getStudyGroupById(id: string): Promise<StudyGroup | null>;
  createStudyGroup(input: CreateStudyGroupInput): Promise<StudyGroup>;
  joinStudyGroup(groupId: string): Promise<boolean>;
  leaveStudyGroup(groupId: string): Promise<boolean>;
  getStudyGroupMembers(groupId: string): Promise<StudyGroupMember[]>;
  isMemberOfStudyGroup(groupId: string): Promise<boolean>;

  // ─── Faculty & Reviews ───
  getFacultyList(filters?: FacultyFilters): Promise<Faculty[]>;
  getFacultyById(id: string): Promise<Faculty | null>;
  getFacultyReviews(facultyId: string): Promise<FacultyReview[]>;
  submitFacultyReview(input: SubmitFacultyReviewInput): Promise<FacultyReview>;
  canReviewFaculty(facultyId: string): Promise<{ allowed: boolean; reason?: string }>;

  // ─── Academic Calendar ───
  getAcademicEvents(month?: number, year?: number): Promise<AcademicEvent[]>;

  // ─── Campus Wiki (Shared across departments) ───
  getWikiArticles(category?: WikiCategory, search?: string): Promise<WikiArticle[]>;
  getWikiArticleBySlug(slug: string): Promise<WikiArticle | null>;
  createWikiArticle(input: CreateWikiArticleInput): Promise<WikiArticle>;
  voteWikiHelpful(articleId: string): Promise<number>;

  // ─── Resource Requests ───
  getAcademicRequests(filters?: AcademicRequestFilters): Promise<AcademicRequest[]>;
  createAcademicRequest(input: CreateAcademicRequestInput): Promise<AcademicRequest>;
  fulfillAcademicRequest(requestId: string, resourceId: string): Promise<AcademicRequest>;
  getRequestComments(requestId: string): Promise<RequestComment[]>;
  addRequestComment(requestId: string, content: string, suggestedResourceUrl?: string): Promise<RequestComment>;

  // ─── Dashboard Stats & Permissions ───
  getDashboardStats(): Promise<AcademicDashboardStats>;
  isDeptCoordinator(departmentId?: string): boolean;
}
