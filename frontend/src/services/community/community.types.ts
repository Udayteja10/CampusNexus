import {
  Post,
  Comment,
  Report,
  CreatePostPayload,
  UpdatePostPayload,
  CreateCommentRequest,
  CommunityCategory,
} from "@/types/post.types";

export interface ICommunityService {
  getPosts(filters: {
    search?: string;
    category?: CommunityCategory;
    sort?: "latest" | "discussed";
  }): Promise<Post[]>;
  
  getPostById(id: string): Promise<Post | undefined>;
  
  createPost(payload: CreatePostPayload): Promise<Post>;
  
  updatePost(id: string, payload: UpdatePostPayload): Promise<Post>;
  
  deletePost(id: string): Promise<boolean>;
  
  getComments(postId: string): Promise<Comment[]>;
  
  addComment(postId: string, payload: CreateCommentRequest): Promise<Comment>;
  
  deleteComment(postId: string, commentId: string): Promise<boolean>;
  
  toggleReaction(postId: string, emoji: string): Promise<Post>;

  toggleCommentReaction(postId: string, commentId: string, emoji: string): Promise<Comment>;
  
  reportPost(postId: string, reason: string, description?: string): Promise<Report>;
  
  reportComment(postId: string, commentId: string, reason: string, description?: string): Promise<Report>;

  moderatorRemovePost(postId: string): Promise<boolean>;
}
export type { Post, Comment, Report, CreatePostPayload, UpdatePostPayload, CreateCommentRequest, CommunityCategory };
