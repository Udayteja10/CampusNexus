/**
 * CampusNexus — Help & Support Service
 * Phase 9 Service implementation with mock persistence
 *
 * PRIVACY & ACCESS CONTROL RULES:
 * 1. Support requests are strictly private — a student can only view/modify their own requests.
 * 2. FAQ search is client-side and scoped to Help Center.
 * 3. Support requests are NEVER indexed in Global Search.
 */

import {
  FAQ,
  SupportRequest,
  SupportRequestStatus,
  CreateSupportRequestInput,
  FAQFilterParams,
  SupportRequestFilterParams,
} from "@/types/help.types";
import { INITIAL_FAQS, INITIAL_SUPPORT_REQUESTS } from "./help.seed";
import { useAuthStore } from "@/store/auth.store";

const STORAGE_KEY_REQUESTS = "cn_support_requests";

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export class HelpService {
  private faqs: FAQ[] = [...INITIAL_FAQS];

  private getPersistedRequests(): SupportRequest[] {
    return getStorage<SupportRequest[]>(STORAGE_KEY_REQUESTS, INITIAL_SUPPORT_REQUESTS);
  }

  private saveRequests(requests: SupportRequest[]): void {
    setStorage(STORAGE_KEY_REQUESTS, requests);
  }

  /**
   * Fetch FAQs with optional text search and category filtering.
   */
  async getFAQs(params?: FAQFilterParams): Promise<FAQ[]> {
    let results = [...this.faqs];

    if (params?.category && params.category !== "ALL") {
      results = results.filter((f) => f.category === params.category);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      results = results.filter((f) => {
        const matchQuestion = f.question.toLowerCase().includes(q);
        const matchAnswer = f.answer.toLowerCase().includes(q);
        const matchKeywords = f.keywords.some((kw) => kw.toLowerCase().includes(q));
        const matchCategory = f.category.toLowerCase().includes(q);
        return matchQuestion || matchAnswer || matchKeywords || matchCategory;
      });
    }

    return results;
  }

  /**
   * Fetch a single FAQ by its URL slug.
   */
  async getFAQBySlug(slug: string): Promise<FAQ | null> {
    const normalized = slug.trim().toLowerCase();
    const faq = this.faqs.find((f) => f.slug.toLowerCase() === normalized);
    return faq || null;
  }

  /**
   * Get related FAQs in the same category or sharing keywords.
   */
  async getRelatedFAQs(faq: FAQ, limit = 3): Promise<FAQ[]> {
    return this.faqs
      .filter((f) => f.id !== faq.id && f.category === faq.category)
      .slice(0, limit);
  }

  /**
   * Fetch support requests belonging exclusively to the authenticated user.
   * Access control enforced: Non-admin users only see requests where req.userId === currentUser.id.
   */
  async getSupportRequests(params?: SupportRequestFilterParams): Promise<SupportRequest[]> {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return [];

    let requests = this.getPersistedRequests();

    // Access control: strictly filter by owner ID unless staff
    const isStaff = currentUser.role === "ADMIN" || currentUser.role === "MODERATOR";
    if (!isStaff) {
      requests = requests.filter((r) => r.userId === currentUser.id);
    }

    if (params?.status && params.status !== "ALL") {
      requests = requests.filter((r) => r.status === params.status);
    }

    if (params?.category && params.category !== "ALL") {
      requests = requests.filter((r) => r.category === params.category);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      requests = requests.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    // Sort latest first
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return requests;
  }

  /**
   * Fetch a support request by ID.
   * STRICT ACCESS CONTROL: returns null if the request belongs to another student.
   */
  async getSupportRequestById(id: string): Promise<SupportRequest | null> {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return null;

    const requests = this.getPersistedRequests();
    const request = requests.find((r) => r.id === id);
    if (!request) return null;

    // Strict ownership verification
    const isOwner = request.userId === currentUser.id;
    const isStaff = currentUser.role === "ADMIN" || currentUser.role === "MODERATOR";
    if (!isOwner && !isStaff) {
      // Forbidden access to other student's support request
      return null;
    }

    return request;
  }

  /**
   * Submit a new support request.
   */
  async createSupportRequest(input: CreateSupportRequestInput): Promise<SupportRequest> {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      throw new Error("You must be logged in to submit a support request.");
    }

    if (!input.subject.trim()) {
      throw new Error("Subject is required.");
    }
    if (!input.description.trim()) {
      throw new Error("Description is required.");
    }
    if (!input.category) {
      throw new Error("Category is required.");
    }

    const now = new Date().toISOString();
    const newRequest: SupportRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      userEmail: currentUser.email,
      subject: input.subject.trim(),
      description: input.description.trim(),
      category: input.category,
      priority: input.priority || "MEDIUM",
      status: "OPEN",
      relatedRoute: input.relatedRoute?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    const allRequests = this.getPersistedRequests();
    const updated = [newRequest, ...allRequests];
    this.saveRequests(updated);

    return newRequest;
  }

  /**
   * Add a message / follow-up information to a support request.
   */
  async addMessageToRequest(requestId: string, content: string): Promise<SupportRequest> {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      throw new Error("You must be logged in to reply to a support request.");
    }

    if (!content.trim()) {
      throw new Error("Message content cannot be empty.");
    }

    const allRequests = this.getPersistedRequests();
    const index = allRequests.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error("Support request not found.");
    }

    const request = allRequests[index];
    const isOwner = request.userId === currentUser.id;
    const isStaff = currentUser.role === "ADMIN" || currentUser.role === "MODERATOR";
    if (!isOwner && !isStaff) {
      throw new Error("You do not have permission to add messages to this support request.");
    }

    const now = new Date().toISOString();
    const newMessage = {
      id: `msg-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      isStaff,
      content: content.trim(),
      createdAt: now,
    };

    const updatedRequest: SupportRequest = {
      ...request,
      updatedAt: now,
      messages: [...(request.messages || []), newMessage],
    };

    allRequests[index] = updatedRequest;
    this.saveRequests(allRequests);

    return updatedRequest;
  }

  /**
   * Close a support request (student owner or admin action).
   */
  async closeSupportRequest(requestId: string): Promise<SupportRequest> {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      throw new Error("You must be logged in.");
    }

    const allRequests = this.getPersistedRequests();
    const index = allRequests.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error("Support request not found.");
    }

    const request = allRequests[index];
    const isOwner = request.userId === currentUser.id;
    const isStaff = currentUser.role === "ADMIN" || currentUser.role === "MODERATOR";
    if (!isOwner && !isStaff) {
      throw new Error("You do not have permission to close this support request.");
    }

    const now = new Date().toISOString();
    const updatedRequest: SupportRequest = {
      ...request,
      status: "CLOSED",
      updatedAt: now,
    };

    allRequests[index] = updatedRequest;
    this.saveRequests(allRequests);

    return updatedRequest;
  }

  /**
   * Update support request status (Staff only).
   */
  async updateSupportStatus(
    requestId: string,
    status: SupportRequestStatus
  ): Promise<SupportRequest> {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
      throw new Error("Unauthorized: Staff access required.");
    }

    const allRequests = this.getPersistedRequests();
    const index = allRequests.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error("Support request not found.");
    }

    const request = allRequests[index];
    const now = new Date().toISOString();
    const updatedRequest: SupportRequest = {
      ...request,
      status,
      updatedAt: now,
    };

    allRequests[index] = updatedRequest;
    this.saveRequests(allRequests);

    return updatedRequest;
  }
}

export const helpService = new HelpService();
