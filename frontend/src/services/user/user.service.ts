/**
 * CampusNexus — User Profile Service
 * Handles user profile retrieval and non-anonymous public activity.
 *
 * PRIVACY RULES:
 * 1. Passwords/tokens/internal secrets are NEVER exposed.
 * 2. Anonymous community posts and anonymous faculty reviews are STRICTLY EXCLUDED
 *    from user profile activity feeds.
 * 3. Student profiles are NOT indexed by Global Search.
 */

import { User } from "@/types/user.types";
import { Post } from "@/types/post.types";
import { useAuthStore, MOCK_ACCOUNTS } from "@/store/auth.store";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";

export class UserService {
  /**
   * Fetch a user profile by username.
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();

    // 1. Check current authenticated user
    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.username.toLowerCase() === cleanUsername) {
      return currentUser;
    }

    // 2. Check mock accounts seed data
    const mockMatch = MOCK_ACCOUNTS.find(
      (acc) => acc.user.username.toLowerCase() === cleanUsername
    );
    if (mockMatch) {
      return mockMatch.user;
    }

    // 3. Check persisted auth user in localStorage if not in memory
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cn_auth_user");
        if (stored) {
          const parsed = JSON.parse(stored) as User;
          if (parsed && parsed.username?.toLowerCase() === cleanUsername) {
            return parsed;
          }
        }
      } catch {
        // ignore parse error
      }
    }

    return null;
  }

  /**
   * Fetch public activity for a given user ID.
   * STRICT ANONYMITY: Only non-anonymous posts created by this user are returned.
   */
  async getUserPublicPosts(userId: string): Promise<Post[]> {
    try {
      const allPosts = await MockCommunityServiceInstance.getPosts({});
      return allPosts.filter(
        (p) => p.author?.id === userId && !p.isAnonymous
      );
    } catch {
      return [];
    }
  }

  /**
   * Update profile information for the authenticated user.
   */
  async updateUserProfile(
    data: Partial<Pick<User, "fullName" | "bio" | "department" | "batch" | "avatarUrl">>
  ): Promise<User> {
    const authStore = useAuthStore.getState();
    authStore.updateProfile(data);
    const updated = useAuthStore.getState().user;
    if (!updated) {
      throw new Error("No authenticated user found to update.");
    }
    return updated;
  }
}

export const userService = new UserService();
