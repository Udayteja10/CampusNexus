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
  Semester,
} from "@/types/academic.types";
import { User } from "@/types/user.types";
import { useAuthStore } from "@/store/auth.store";
import { getDepartmentId } from "@/lib/departments";
import {
  IAcademicService,
  CreateResourceInput,
  UploadNewVersionInput,
  CreateStudyGroupInput,
  SubmitFacultyReviewInput,
  CreateAcademicRequestInput,
  CreateWikiArticleInput,
  AcademicDashboardStats,
} from "./academic.types";
import {
  SEED_SUBJECTS,
  SEED_RESOURCES,
  SEED_FACULTY,
  SEED_FACULTY_REVIEWS,
  SEED_STUDY_GROUPS,
  SEED_ACADEMIC_EVENTS,
  SEED_WIKI_ARTICLES,
  SEED_ACADEMIC_REQUESTS,
} from "./academic.seed";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateId = (prefix = "id") =>
  `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

const sleep = (ms = 250) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class AcademicAccessError extends Error {
  constructor(message = "Access restricted: You do not have permission to view content from another department.") {
    super(message);
    this.name = "AcademicAccessError";
  }
}

// ─── LocalStorage Persistence Helpers ────────────────────────────────────────

const STORAGE_KEYS = {
  RESOURCES: "cn_academic_resources",
  COMMENTS: "cn_academic_comments",
  BOOKMARKS: "cn_academic_bookmarks",
  UPVOTES: "cn_academic_upvotes",
  REQUESTS: "cn_academic_requests",
  REQ_COMMENTS: "cn_academic_req_comments",
  STUDY_GROUPS: "cn_academic_study_groups",
  SG_MEMBERS: "cn_academic_sg_members",
  FACULTY_REVIEWS: "cn_academic_faculty_reviews",
  WIKI_ARTICLES: "cn_academic_wiki_articles",
  SEEDED: "cn_academic_seeded_v1",
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading from localStorage (${key}):`, err);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing to localStorage (${key}):`, err);
  }
}

// ─── Service Implementation ──────────────────────────────────────────────────

export class MockAcademicService implements IAcademicService {
  constructor() {
    this.ensureSeeded();
  }

  private ensureSeeded(): void {
    if (typeof window === "undefined") return;
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      setStorage(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
      setStorage(STORAGE_KEYS.STUDY_GROUPS, SEED_STUDY_GROUPS);
      setStorage(STORAGE_KEYS.FACULTY_REVIEWS, SEED_FACULTY_REVIEWS);
      setStorage(STORAGE_KEYS.WIKI_ARTICLES, SEED_WIKI_ARTICLES);
      setStorage(STORAGE_KEYS.REQUESTS, SEED_ACADEMIC_REQUESTS);
      setStorage(STORAGE_KEYS.COMMENTS, {});
      setStorage(STORAGE_KEYS.REQ_COMMENTS, {});
      setStorage(STORAGE_KEYS.BOOKMARKS, []);
      setStorage(STORAGE_KEYS.UPVOTES, []);
      setStorage(STORAGE_KEYS.SG_MEMBERS, {});
      localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
    }
  }

  private getCurrentUser(): User | null {
    return useAuthStore.getState().user;
  }

  /**
   * Resolves effective department ID for current user.
   * Admins and moderators can access any dept or filter as requested.
   * Students are locked to their own registered department.
   */
  private getUserDepartmentId(): string {
    const user = this.getCurrentUser();
    if (!user) return "cse"; // default fallback for public / guest views
    const deptId = getDepartmentId(user.department);
    return deptId || "cse";
  }

  private assertDepartmentAccess(targetDepartmentId: string): void {
    const user = this.getCurrentUser();
    if (!user) return; // public read or guest view
    if (user.role === "ADMIN" || user.role === "MODERATOR") return; // full cross-dept visibility for staff
    const userDeptId = this.getUserDepartmentId();
    if (userDeptId.toLowerCase() !== targetDepartmentId.toLowerCase()) {
      throw new AcademicAccessError(
        `Department restriction: This content belongs to the ${targetDepartmentId.toUpperCase()} department.`
      );
    }
  }

  public isDeptCoordinator(departmentId?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    const targetDept = departmentId || this.getUserDepartmentId();
    return (
      user.deptCoordinatorOf?.some(
        (perm) => perm.departmentId.toLowerCase() === targetDept.toLowerCase()
      ) ?? false
    );
  }

  // ─── Resources ─────────────────────────────────────────────────────────────

  async getResources(filters?: ResourceFilters): Promise<AcademicResource[]> {
    await sleep(150);
    this.ensureSeeded();
    let resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);

    const user = this.getCurrentUser();
    const activeDeptId =
      user?.role === "ADMIN" || user?.role === "MODERATOR"
        ? filters?.departmentId || this.getUserDepartmentId()
        : this.getUserDepartmentId();

    // Department filtering
    if (activeDeptId) {
      resources = resources.filter(
        (r) => r.departmentId.toLowerCase() === activeDeptId.toLowerCase()
      );
    }

    if (filters?.subjectCode && filters.subjectCode !== "ALL") {
      resources = resources.filter(
        (r) => r.subjectCode.toLowerCase() === filters.subjectCode?.toLowerCase()
      );
    }

    if (filters?.semester) {
      resources = resources.filter((r) => r.semester === Number(filters.semester));
    }

    if (filters?.resourceType && String(filters.resourceType) !== "ALL") {
      resources = resources.filter((r) => r.resourceType === filters.resourceType);
    }

    if (filters?.verifiedOnly) {
      resources = resources.filter((r) => r.isVerifiedByCoordinator);
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      resources = resources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.uploaderName.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (filters?.sortBy) {
      case "downloads":
        resources.sort((a, b) => b.downloadsCount - a.downloadsCount);
        break;
      case "upvotes":
        resources.sort((a, b) => b.upvotesCount - a.upvotesCount);
        break;
      case "title":
        resources.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
      default:
        resources.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return resources;
  }

  async getResourceById(id: string): Promise<AcademicResource | null> {
    await sleep(150);
    this.ensureSeeded();
    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const resource = resources.find((r) => r.id === id);
    if (!resource) return null;

    // Enforce department isolation
    this.assertDepartmentAccess(resource.departmentId);
    return resource;
  }

  async createResource(input: CreateResourceInput): Promise<AcademicResource> {
    await sleep(250);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Authentication required to upload resources.");

    const deptId = this.getUserDepartmentId();
    const isCoordinator = this.isDeptCoordinator(deptId);

    const newResource: AcademicResource = {
      id: generateId("res"),
      title: input.title.trim(),
      description: input.description?.trim(),
      departmentId: deptId,
      subjectCode: input.subjectCode,
      subjectName: input.subjectName,
      semester: input.semester,
      academicYear: input.academicYear || "2024-2025",
      resourceType: input.resourceType,
      fileUrl: input.fileUrl || "/mock/docs/sample_resource.pdf",
      fileType: input.fileType || "pdf",
      fileSize: input.fileSize || 1024 * 1024 * 2,
      uploaderId: user.id,
      uploaderName: user.fullName || user.username,
      uploaderDepartment: user.department,
      isVerifiedByCoordinator: isCoordinator,
      verifiedBy: isCoordinator ? user.id : undefined,
      verifiedByName: isCoordinator ? user.fullName : undefined,
      verifiedAt: isCoordinator ? new Date().toISOString() : undefined,
      downloadsCount: 0,
      upvotesCount: 0,
      commentsCount: 0,
      tags: input.tags || [],
      versions: [
        {
          versionNumber: 1,
          fileUrl: input.fileUrl || "/mock/docs/sample_resource.pdf",
          fileSize: input.fileSize || 1024 * 1024 * 2,
          uploadedBy: user.fullName || user.username,
          uploadedAt: new Date().toISOString(),
          changeLog: "Initial Version Upload",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    resources.unshift(newResource);
    setStorage(STORAGE_KEYS.RESOURCES, resources);

    return newResource;
  }

  async deleteResource(id: string): Promise<boolean> {
    await sleep(200);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const target = resources.find((r) => r.id === id);
    if (!target) return false;

    // Check authorization: author, coordinator of that dept, or ADMIN/MODERATOR
    const isOwner = target.uploaderId === user.id;
    const isCoord = this.isDeptCoordinator(target.departmentId);
    const isStaff = user.role === "ADMIN" || user.role === "MODERATOR";

    if (!isOwner && !isCoord && !isStaff) {
      throw new Error("You do not have permission to delete this resource.");
    }

    const filtered = resources.filter((r) => r.id !== id);
    setStorage(STORAGE_KEYS.RESOURCES, filtered);
    return true;
  }

  async uploadNewVersion(input: UploadNewVersionInput): Promise<AcademicResource> {
    await sleep(250);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const idx = resources.findIndex((r) => r.id === input.resourceId);
    if (idx === -1) throw new Error("Resource not found");

    const resource = resources[idx];
    this.assertDepartmentAccess(resource.departmentId);

    const currentVersions = resource.versions || [];
    const nextVersionNum = currentVersions.length + 1;

    const newVersion = {
      versionNumber: nextVersionNum,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      uploadedBy: user.fullName || user.username,
      uploadedAt: new Date().toISOString(),
      changeLog: input.changeLog || `Version ${nextVersionNum} update`,
    };

    resource.versions = [...currentVersions, newVersion];
    resource.fileUrl = input.fileUrl;
    resource.fileSize = input.fileSize;
    resource.updatedAt = new Date().toISOString();

    resources[idx] = resource;
    setStorage(STORAGE_KEYS.RESOURCES, resources);
    return resource;
  }

  async toggleUpvote(resourceId: string): Promise<{ upvoted: boolean; count: number }> {
    await sleep(150);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const upvotes = getStorage<{ userId: string; resourceId: string }[]>(STORAGE_KEYS.UPVOTES, []);
    const existingIndex = upvotes.findIndex(
      (u) => u.userId === user.id && u.resourceId === resourceId
    );

    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const resIdx = resources.findIndex((r) => r.id === resourceId);

    let upvoted = false;
    let count = 0;

    if (existingIndex > -1) {
      upvotes.splice(existingIndex, 1);
      upvoted = false;
      if (resIdx > -1) {
        resources[resIdx].upvotesCount = Math.max(0, (resources[resIdx].upvotesCount || 1) - 1);
        count = resources[resIdx].upvotesCount;
      }
    } else {
      upvotes.push({ userId: user.id, resourceId });
      upvoted = true;
      if (resIdx > -1) {
        resources[resIdx].upvotesCount = (resources[resIdx].upvotesCount || 0) + 1;
        count = resources[resIdx].upvotesCount;
      }
    }

    setStorage(STORAGE_KEYS.UPVOTES, upvotes);
    if (resIdx > -1) setStorage(STORAGE_KEYS.RESOURCES, resources);

    return { upvoted, count };
  }

  async hasUpvoted(resourceId: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;
    const upvotes = getStorage<{ userId: string; resourceId: string }[]>(STORAGE_KEYS.UPVOTES, []);
    return upvotes.some((u) => u.userId === user.id && u.resourceId === resourceId);
  }

  async toggleBookmark(resourceId: string): Promise<{ bookmarked: boolean }> {
    await sleep(150);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const bookmarks = getStorage<{ userId: string; resourceId: string; createdAt: string }[]>(
      STORAGE_KEYS.BOOKMARKS,
      []
    );
    const existingIndex = bookmarks.findIndex(
      (b) => b.userId === user.id && b.resourceId === resourceId
    );

    let bookmarked = false;
    if (existingIndex > -1) {
      bookmarks.splice(existingIndex, 1);
      bookmarked = false;
    } else {
      bookmarks.push({ userId: user.id, resourceId, createdAt: new Date().toISOString() });
      bookmarked = true;
    }

    setStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return { bookmarked };
  }

  async isBookmarked(resourceId: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;
    const bookmarks = getStorage<{ userId: string; resourceId: string }[]>(
      STORAGE_KEYS.BOOKMARKS,
      []
    );
    return bookmarks.some((b) => b.userId === user.id && b.resourceId === resourceId);
  }

  async getBookmarkedResources(): Promise<AcademicResource[]> {
    await sleep(150);
    const user = this.getCurrentUser();
    if (!user) return [];

    const bookmarks = getStorage<{ userId: string; resourceId: string }[]>(
      STORAGE_KEYS.BOOKMARKS,
      []
    );
    const userBmIds = new Set(
      bookmarks.filter((b) => b.userId === user.id).map((b) => b.resourceId)
    );

    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    return resources.filter((r) => userBmIds.has(r.id));
  }

  async verifyResource(resourceId: string): Promise<AcademicResource> {
    await sleep(200);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const idx = resources.findIndex((r) => r.id === resourceId);
    if (idx === -1) throw new Error("Resource not found");

    const resource = resources[idx];
    if (!this.isDeptCoordinator(resource.departmentId)) {
      throw new Error("Only Department Student Coordinators or Administrators can verify resources.");
    }

    resource.isVerifiedByCoordinator = true;
    resource.verifiedBy = user.id;
    resource.verifiedByName = user.fullName || user.username;
    resource.verifiedAt = new Date().toISOString();

    resources[idx] = resource;
    setStorage(STORAGE_KEYS.RESOURCES, resources);
    return resource;
  }

  async recordDownload(resourceId: string): Promise<number> {
    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const idx = resources.findIndex((r) => r.id === resourceId);
    if (idx === -1) return 0;
    resources[idx].downloadsCount = (resources[idx].downloadsCount || 0) + 1;
    setStorage(STORAGE_KEYS.RESOURCES, resources);
    return resources[idx].downloadsCount;
  }

  // ─── Resource Comments ─────────────────────────────────────────────────────

  async getResourceComments(resourceId: string): Promise<ResourceComment[]> {
    await sleep(100);
    const commentsMap = getStorage<Record<string, ResourceComment[]>>(STORAGE_KEYS.COMMENTS, {});
    return commentsMap[resourceId] || [];
  }

  async addResourceComment(resourceId: string, content: string): Promise<ResourceComment> {
    await sleep(200);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const newComment: ResourceComment = {
      id: generateId("cmt"),
      resourceId,
      userId: user.id,
      userName: user.fullName || user.username,
      userAvatar: user.avatarUrl,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const commentsMap = getStorage<Record<string, ResourceComment[]>>(STORAGE_KEYS.COMMENTS, {});
    if (!commentsMap[resourceId]) commentsMap[resourceId] = [];
    commentsMap[resourceId].push(newComment);
    setStorage(STORAGE_KEYS.COMMENTS, commentsMap);

    // Update comment count on resource
    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const idx = resources.findIndex((r) => r.id === resourceId);
    if (idx > -1) {
      resources[idx].commentsCount = (resources[idx].commentsCount || 0) + 1;
      setStorage(STORAGE_KEYS.RESOURCES, resources);
    }

    return newComment;
  }

  async deleteResourceComment(commentId: string): Promise<boolean> {
    await sleep(150);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const commentsMap = getStorage<Record<string, ResourceComment[]>>(STORAGE_KEYS.COMMENTS, {});
    let deleted = false;

    for (const resId in commentsMap) {
      const idx = commentsMap[resId].findIndex((c) => c.id === commentId);
      if (idx > -1) {
        const comment = commentsMap[resId][idx];
        if (comment.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
          throw new Error("You can only delete your own comments.");
        }
        commentsMap[resId].splice(idx, 1);
        deleted = true;

        // Decrement comment count on resource
        const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
        const rIdx = resources.findIndex((r) => r.id === resId);
        if (rIdx > -1) {
          resources[rIdx].commentsCount = Math.max(0, (resources[rIdx].commentsCount || 1) - 1);
          setStorage(STORAGE_KEYS.RESOURCES, resources);
        }
        break;
      }
    }

    if (deleted) setStorage(STORAGE_KEYS.COMMENTS, commentsMap);
    return deleted;
  }

  // ─── Subjects ──────────────────────────────────────────────────────────────

  async getSubjects(departmentId?: string, semester?: Semester): Promise<Subject[]> {
    await sleep(150);
    const user = this.getCurrentUser();
    const deptId =
      user?.role === "ADMIN" || user?.role === "MODERATOR"
        ? departmentId || this.getUserDepartmentId()
        : this.getUserDepartmentId();

    let subjects = SEED_SUBJECTS.filter(
      (s) => s.departmentId.toLowerCase() === deptId.toLowerCase()
    );

    if (semester) {
      subjects = subjects.filter((s) => s.semester === Number(semester));
    }

    return subjects;
  }

  async getSubjectByCode(code: string): Promise<Subject | null> {
    await sleep(150);
    const subject = SEED_SUBJECTS.find(
      (s) => s.code.toLowerCase() === code.toLowerCase()
    );
    if (!subject) return null;

    this.assertDepartmentAccess(subject.departmentId);
    return subject;
  }

  // ─── Study Groups ──────────────────────────────────────────────────────────

  async getStudyGroups(filters?: StudyGroupFilters): Promise<StudyGroup[]> {
    await sleep(150);
    this.ensureSeeded();
    let groups = getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, SEED_STUDY_GROUPS);

    const user = this.getCurrentUser();
    const activeDeptId =
      user?.role === "ADMIN" || user?.role === "MODERATOR"
        ? filters?.departmentId || this.getUserDepartmentId()
        : this.getUserDepartmentId();

    groups = groups.filter(
      (g) => g.departmentId.toLowerCase() === activeDeptId.toLowerCase()
    );

    if (filters?.subjectCode && filters.subjectCode !== "ALL") {
      groups = groups.filter(
        (g) => g.subjectCode.toLowerCase() === filters.subjectCode?.toLowerCase()
      );
    }

    if (filters?.semester) {
      groups = groups.filter((g) => g.semester === Number(filters.semester));
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      groups = groups.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.subjectName.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return groups;
  }

  async getStudyGroupById(id: string): Promise<StudyGroup | null> {
    await sleep(150);
    this.ensureSeeded();
    const groups = getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, SEED_STUDY_GROUPS);
    const group = groups.find((g) => g.id === id);
    if (!group) return null;

    this.assertDepartmentAccess(group.departmentId);
    return group;
  }

  async createStudyGroup(input: CreateStudyGroupInput): Promise<StudyGroup> {
    await sleep(250);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Authentication required to create a study group.");

    const deptId = this.getUserDepartmentId();

    const newGroup: StudyGroup = {
      id: generateId("sg"),
      name: input.name.trim(),
      description: input.description.trim(),
      departmentId: deptId,
      subjectCode: input.subjectCode,
      subjectName: input.subjectName,
      semester: input.semester,
      leaderId: user.id,
      leaderName: user.fullName || user.username,
      membersCount: 1,
      maxMembers: input.maxMembers || 10,
      meetingLink: input.meetingLink?.trim(),
      meetingSchedule: input.meetingSchedule?.trim(),
      isPrivate: input.isPrivate || false,
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
    };

    const groups = getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, SEED_STUDY_GROUPS);
    groups.unshift(newGroup);
    setStorage(STORAGE_KEYS.STUDY_GROUPS, groups);

    // Add creator as leader member
    const membersMap = getStorage<Record<string, StudyGroupMember[]>>(STORAGE_KEYS.SG_MEMBERS, {});
    membersMap[newGroup.id] = [
      {
        userId: user.id,
        userName: user.fullName || user.username,
        userAvatar: user.avatarUrl,
        joinedAt: new Date().toISOString(),
        role: "LEADER",
      },
    ];
    setStorage(STORAGE_KEYS.SG_MEMBERS, membersMap);

    return newGroup;
  }

  async joinStudyGroup(groupId: string): Promise<boolean> {
    await sleep(200);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const groups = getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, SEED_STUDY_GROUPS);
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error("Study group not found");

    this.assertDepartmentAccess(group.departmentId);

    const membersMap = getStorage<Record<string, StudyGroupMember[]>>(STORAGE_KEYS.SG_MEMBERS, {});
    const members = membersMap[groupId] || [];

    if (members.some((m) => m.userId === user.id)) {
      return true; // already joined
    }

    if (members.length >= group.maxMembers) {
      throw new Error("This study group has reached its maximum member limit.");
    }

    members.push({
      userId: user.id,
      userName: user.fullName || user.username,
      userAvatar: user.avatarUrl,
      joinedAt: new Date().toISOString(),
      role: "MEMBER",
    });

    membersMap[groupId] = members;
    setStorage(STORAGE_KEYS.SG_MEMBERS, membersMap);

    // Update member count
    group.membersCount = members.length;
    setStorage(STORAGE_KEYS.STUDY_GROUPS, groups);

    return true;
  }

  async leaveStudyGroup(groupId: string): Promise<boolean> {
    await sleep(200);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const membersMap = getStorage<Record<string, StudyGroupMember[]>>(STORAGE_KEYS.SG_MEMBERS, {});
    const members = membersMap[groupId] || [];
    const filtered = members.filter((m) => m.userId !== user.id);

    membersMap[groupId] = filtered;
    setStorage(STORAGE_KEYS.SG_MEMBERS, membersMap);

    const groups = getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, SEED_STUDY_GROUPS);
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      group.membersCount = filtered.length;
      setStorage(STORAGE_KEYS.STUDY_GROUPS, groups);
    }

    return true;
  }

  async getStudyGroupMembers(groupId: string): Promise<StudyGroupMember[]> {
    await sleep(100);
    const membersMap = getStorage<Record<string, StudyGroupMember[]>>(STORAGE_KEYS.SG_MEMBERS, {});
    return membersMap[groupId] || [];
  }

  async isMemberOfStudyGroup(groupId: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;
    const membersMap = getStorage<Record<string, StudyGroupMember[]>>(STORAGE_KEYS.SG_MEMBERS, {});
    const members = membersMap[groupId] || [];
    return members.some((m) => m.userId === user.id);
  }

  // ─── Faculty & Reviews ─────────────────────────────────────────────────────

  async getFacultyList(filters?: FacultyFilters): Promise<Faculty[]> {
    await sleep(150);
    const user = this.getCurrentUser();
    const activeDeptId =
      user?.role === "ADMIN" || user?.role === "MODERATOR"
        ? filters?.departmentId || this.getUserDepartmentId()
        : this.getUserDepartmentId();

    let facultyList = SEED_FACULTY.filter(
      (f) => f.departmentId.toLowerCase() === activeDeptId.toLowerCase()
    );

    if (filters?.subject) {
      facultyList = facultyList.filter((f) =>
        f.subjectsHandled.some((s) => s.toLowerCase().includes(filters.subject!.toLowerCase()))
      );
    }

    if (filters?.minRating) {
      facultyList = facultyList.filter((f) => f.rating >= Number(filters.minRating));
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      facultyList = facultyList.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q) ||
          f.specialization.some((s) => s.toLowerCase().includes(q)) ||
          f.subjectsHandled.some((s) => s.toLowerCase().includes(q))
      );
    }

    return facultyList;
  }

  async getFacultyById(id: string): Promise<Faculty | null> {
    await sleep(150);
    const faculty = SEED_FACULTY.find((f) => f.id === id);
    if (!faculty) return null;

    this.assertDepartmentAccess(faculty.departmentId);
    return faculty;
  }

  async getFacultyReviews(facultyId: string): Promise<FacultyReview[]> {
    await sleep(150);
    this.ensureSeeded();
    const reviews = getStorage<FacultyReview[]>(STORAGE_KEYS.FACULTY_REVIEWS, SEED_FACULTY_REVIEWS);
    return reviews.filter((r) => r.facultyId === facultyId);
  }

  async canReviewFaculty(facultyId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = this.getCurrentUser();
    if (!user) return { allowed: false, reason: "Please log in to submit a review." };

    const faculty = SEED_FACULTY.find((f) => f.id === facultyId);
    if (!faculty) return { allowed: false, reason: "Faculty member not found." };

    // Check department match
    const userDeptId = this.getUserDepartmentId();
    if (user.role !== "ADMIN" && userDeptId.toLowerCase() !== faculty.departmentId.toLowerCase()) {
      return { allowed: false, reason: "You can only review faculty from your own department." };
    }

    // Check if user has already reviewed this academic year
    const reviews = getStorage<FacultyReview[]>(STORAGE_KEYS.FACULTY_REVIEWS, SEED_FACULTY_REVIEWS);
    const hasReviewed = reviews.some(
      (r) => r.facultyId === facultyId && r.studentId === user.id && r.academicYear === "2024-2025"
    );

    if (hasReviewed) {
      return { allowed: false, reason: "You have already submitted a review for this faculty member this academic year." };
    }

    return { allowed: true };
  }

  async submitFacultyReview(input: SubmitFacultyReviewInput): Promise<FacultyReview> {
    await sleep(250);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const check = await this.canReviewFaculty(input.facultyId);
    if (!check.allowed) throw new Error(check.reason || "Review submission not allowed.");

    const newReview: FacultyReview = {
      id: generateId("rev"),
      facultyId: input.facultyId,
      studentId: user.id, // preserved internally
      studentName: input.isAnonymous ? "Anonymous Student" : user.fullName || user.username,
      isAnonymous: Boolean(input.isAnonymous),
      rating: Math.max(1, Math.min(5, input.rating)),
      tags: input.tags || [],
      comment: input.comment.trim(),
      semester: input.semester,
      academicYear: input.academicYear || "2024-2025",
      createdAt: new Date().toISOString(),
    };

    const reviews = getStorage<FacultyReview[]>(STORAGE_KEYS.FACULTY_REVIEWS, SEED_FACULTY_REVIEWS);
    reviews.unshift(newReview);
    setStorage(STORAGE_KEYS.FACULTY_REVIEWS, reviews);

    // Recalculate faculty average rating
    const facultyReviews = reviews.filter((r) => r.facultyId === input.facultyId);
    const avgRating =
      facultyReviews.reduce((sum, r) => sum + r.rating, 0) / facultyReviews.length;

    const faculty = SEED_FACULTY.find((f) => f.id === input.facultyId);
    if (faculty) {
      faculty.rating = Number(avgRating.toFixed(1));
      faculty.reviewCount = facultyReviews.length;
    }

    return newReview;
  }

  // ─── Academic Calendar ─────────────────────────────────────────────────────

  async getAcademicEvents(_month?: number, _year?: number): Promise<AcademicEvent[]> {
    await sleep(150);
    const user = this.getCurrentUser();
    const userDeptId = this.getUserDepartmentId();

    // Return all college-wide events + events matching user's department
    return SEED_ACADEMIC_EVENTS.filter((event) => {
      if (event.scope === "college") return true;
      if (event.scope === "department") {
        if (user?.role === "ADMIN" || user?.role === "MODERATOR") return true;
        return event.departmentId?.toLowerCase() === userDeptId.toLowerCase();
      }
      return false;
    });
  }

  // ─── Campus Wiki (Shared across college) ───────────────────────────────────

  async getWikiArticles(category?: WikiCategory, search?: string): Promise<WikiArticle[]> {
    await sleep(150);
    this.ensureSeeded();
    let articles = getStorage<WikiArticle[]>(STORAGE_KEYS.WIKI_ARTICLES, SEED_WIKI_ARTICLES);

    if (category && String(category) !== "ALL") {
      articles = articles.filter((a) => a.category === category);
    }

    if (search?.trim()) {
      const q = search.toLowerCase().trim();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return articles;
  }

  async getWikiArticleBySlug(slug: string): Promise<WikiArticle | null> {
    await sleep(150);
    this.ensureSeeded();
    const articles = getStorage<WikiArticle[]>(STORAGE_KEYS.WIKI_ARTICLES, SEED_WIKI_ARTICLES);
    const article = articles.find((a) => a.slug === slug || a.id === slug);
    if (!article) return null;

    // Increment views count
    article.viewsCount = (article.viewsCount || 0) + 1;
    setStorage(STORAGE_KEYS.WIKI_ARTICLES, articles);

    return article;
  }

  async createWikiArticle(input: CreateWikiArticleInput): Promise<WikiArticle> {
    await sleep(250);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newArticle: WikiArticle = {
      id: generateId("wiki"),
      slug: `${slug}-${generateId("art")}`,
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category,
      departmentId: input.departmentId,
      authorId: user.id,
      authorName: user.fullName || user.username,
      tags: input.tags || [],
      helpfulCount: 0,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    const articles = getStorage<WikiArticle[]>(STORAGE_KEYS.WIKI_ARTICLES, SEED_WIKI_ARTICLES);
    articles.unshift(newArticle);
    setStorage(STORAGE_KEYS.WIKI_ARTICLES, articles);

    return newArticle;
  }

  async voteWikiHelpful(articleId: string): Promise<number> {
    const articles = getStorage<WikiArticle[]>(STORAGE_KEYS.WIKI_ARTICLES, SEED_WIKI_ARTICLES);
    const idx = articles.findIndex((a) => a.id === articleId || a.slug === articleId);
    if (idx === -1) return 0;

    articles[idx].helpfulCount = (articles[idx].helpfulCount || 0) + 1;
    setStorage(STORAGE_KEYS.WIKI_ARTICLES, articles);
    return articles[idx].helpfulCount;
  }

  // ─── Resource Requests ─────────────────────────────────────────────────────

  async getAcademicRequests(filters?: AcademicRequestFilters): Promise<AcademicRequest[]> {
    await sleep(150);
    this.ensureSeeded();
    let requests = getStorage<AcademicRequest[]>(STORAGE_KEYS.REQUESTS, SEED_ACADEMIC_REQUESTS);

    const user = this.getCurrentUser();
    const activeDeptId =
      user?.role === "ADMIN" || user?.role === "MODERATOR"
        ? filters?.departmentId || this.getUserDepartmentId()
        : this.getUserDepartmentId();

    requests = requests.filter(
      (r) => r.departmentId.toLowerCase() === activeDeptId.toLowerCase()
    );

    if (filters?.semester) {
      requests = requests.filter((r) => r.semester === Number(filters.semester));
    }

    if (filters?.status && String(filters.status) !== "ALL") {
      requests = requests.filter((r) => r.status === filters.status);
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      requests = requests.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q)
      );
    }

    return requests;
  }

  async createAcademicRequest(input: CreateAcademicRequestInput): Promise<AcademicRequest> {
    await sleep(250);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const deptId = this.getUserDepartmentId();

    const newReq: AcademicRequest = {
      id: generateId("req"),
      title: input.title.trim(),
      description: input.description.trim(),
      departmentId: deptId,
      subjectCode: input.subjectCode,
      subjectName: input.subjectName,
      semester: input.semester,
      resourceType: input.resourceType,
      requesterId: user.id,
      requesterName: user.fullName || user.username,
      requesterDepartment: user.department,
      status: "OPEN",
      commentsCount: 0,
      upvotesCount: 0,
      createdAt: new Date().toISOString(),
    };

    const requests = getStorage<AcademicRequest[]>(STORAGE_KEYS.REQUESTS, SEED_ACADEMIC_REQUESTS);
    requests.unshift(newReq);
    setStorage(STORAGE_KEYS.REQUESTS, requests);

    return newReq;
  }

  async fulfillAcademicRequest(requestId: string, resourceId: string): Promise<AcademicRequest> {
    await sleep(200);
    const requests = getStorage<AcademicRequest[]>(STORAGE_KEYS.REQUESTS, SEED_ACADEMIC_REQUESTS);
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error("Request not found");

    const resources = getStorage<AcademicResource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    const resource = resources.find((r) => r.id === resourceId);

    requests[idx].status = "FULFILLED";
    requests[idx].fulfilledResourceId = resourceId;
    requests[idx].fulfilledResourceTitle = resource?.title || "Fulfilled with resource";

    setStorage(STORAGE_KEYS.REQUESTS, requests);
    return requests[idx];
  }

  async getRequestComments(requestId: string): Promise<RequestComment[]> {
    await sleep(100);
    const commentsMap = getStorage<Record<string, RequestComment[]>>(STORAGE_KEYS.REQ_COMMENTS, {});
    return commentsMap[requestId] || [];
  }

  async addRequestComment(
    requestId: string,
    content: string,
    suggestedResourceUrl?: string
  ): Promise<RequestComment> {
    await sleep(200);
    const user = this.getCurrentUser();
    if (!user) throw new Error("Unauthenticated");

    const newComment: RequestComment = {
      id: generateId("reqcmt"),
      requestId,
      userId: user.id,
      userName: user.fullName || user.username,
      userAvatar: user.avatarUrl,
      content: content.trim(),
      suggestedResourceUrl: suggestedResourceUrl?.trim(),
      createdAt: new Date().toISOString(),
    };

    const commentsMap = getStorage<Record<string, RequestComment[]>>(STORAGE_KEYS.REQ_COMMENTS, {});
    if (!commentsMap[requestId]) commentsMap[requestId] = [];
    commentsMap[requestId].push(newComment);
    setStorage(STORAGE_KEYS.REQ_COMMENTS, commentsMap);

    const requests = getStorage<AcademicRequest[]>(STORAGE_KEYS.REQUESTS, SEED_ACADEMIC_REQUESTS);
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx > -1) {
      requests[idx].commentsCount = (requests[idx].commentsCount || 0) + 1;
      setStorage(STORAGE_KEYS.REQUESTS, requests);
    }

    return newComment;
  }

  // ─── Dashboard Stats ───────────────────────────────────────────────────────

  async getDashboardStats(): Promise<AcademicDashboardStats> {
    await sleep(150);
    const resources = await this.getResources();
    const studyGroups = await this.getStudyGroups();
    const faculty = await this.getFacultyList();
    const requests = await this.getAcademicRequests({ status: "OPEN" });
    const events = await this.getAcademicEvents();

    const verifiedResources = resources.filter((r) => r.isVerifiedByCoordinator).length;
    const upcomingExams = events.filter(
      (e) => e.eventType === "EXAM" && new Date(e.endDate) >= new Date()
    ).length;

    return {
      totalResources: resources.length,
      verifiedResources,
      activeStudyGroups: studyGroups.length,
      departmentFacultyCount: faculty.length,
      openRequestsCount: requests.length,
      upcomingExamsCount: upcomingExams,
    };
  }
}

export const academicService = new MockAcademicService();
