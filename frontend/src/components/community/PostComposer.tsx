"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Globe, EyeOff } from "lucide-react";

import { CommunityCategory, Post, ReactionSummary } from "@/types/post.types";
import { User } from "@/types/user.types";
import { useCommunityStore } from "@/store/community.store";
import { useAuthStore } from "@/store/auth.store";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { CATEGORY_MAP } from "./CategoryBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Define categories array from constant keys
const CATEGORY_KEYS = Object.keys(CATEGORY_MAP) as [CommunityCategory, ...CommunityCategory[]];

const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post content cannot be empty.")
    .max(1000, "Post content cannot exceed 1000 characters."),
  category: z.enum(CATEGORY_KEYS, {
    errorMap: () => ({ message: "Please select a category." }),
  }),
  isAnonymous: z.boolean(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostComposerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: Partial<Post>;
  postIdToEdit?: string;
}

export function PostComposer({
  onSuccess,
  onCancel,
  defaultValues,
  postIdToEdit,
}: PostComposerProps) {
  const store = useCommunityStore();
  const currentUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!postIdToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: defaultValues?.content || "",
      category: defaultValues?.category || "general",
      isAnonymous: defaultValues?.isAnonymous || false,
    },
  });

  const content = watch("content") ?? "";
  const isAnonymous = watch("isAnonymous") ?? false;
  const category = watch("category");

  const onSubmit = async (data: PostFormValues) => {
    setLoading(true);
    setError(null);

    // Generate temp ID for optimistic UI
    const tempId = "temp-" + Date.now();
    
    // Create optimistic post object
    const optimisticPost: Post = {
      id: tempId,
      author: data.isAnonymous ? undefined : (currentUser as User),
      isAnonymous: data.isAnonymous,
      content: data.content,
      category: data.category,
      type: "TEXT",
      reactions: [
        { emoji: "👍", count: 0, reactedByMe: false },
        { emoji: "🔥", count: 0, reactedByMe: false }
      ] as ReactionSummary[],
      commentsCount: 0,
      isPinned: false,
      isEdited: isEditing,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (!isEditing) {
      // 1. Add optimistic post to visible feed immediately
      store.addOptimisticPost(optimisticPost);
      if (onSuccess) onSuccess();
    }

    try {
      if (isEditing) {
        // Edit existing post
        const updated = await MockCommunityServiceInstance.updatePost(postIdToEdit, {
          content: data.content,
          category: data.category,
          isAnonymous: data.isAnonymous,
        });
        store.updateLocalPost(updated);
        reset();
        if (onSuccess) onSuccess();
      } else {
        // Create new post
        const confirmedPost = await MockCommunityServiceInstance.createPost({
          content: data.content,
          category: data.category,
          isAnonymous: data.isAnonymous,
        });
        
        // 2. Confirm/replace post in store
        store.confirmPost(tempId, confirmedPost);
        reset();
      }
    } catch (err) {
      if (!isEditing) {
        // 3. Mark optimistic post as failed
        store.failPost(tempId);
      }
      const errMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Text Area */}
      <div className="space-y-1.5">
        <Textarea
          placeholder="Share something with your campus community..."
          {...register("content")}
          className={cn(
            "min-h-[140px] text-sm resize-none rounded-xl bg-muted/20 border-border/60 focus-visible:bg-background transition-colors p-3.5",
            errors.content && "border-destructive focus-visible:ring-destructive/30"
          )}
          maxLength={1000}
        />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="text-destructive font-medium">{errors.content?.message}</span>
          <span>{content.length}/1000 characters</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Dropdown */}
          <div className="space-y-1">
            <Label htmlFor="category" className="text-[10px] font-semibold text-muted-foreground uppercase">
              Category
            </Label>
            <div className="w-[160px]">
              <Select
                value={category}
                onValueChange={(val) => setValue("category", val as CommunityCategory)}
              >
                <SelectTrigger id="category" className="h-8 text-xs font-medium">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_MAP).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-xs font-medium">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Anonymous Switch */}
          <div className="flex items-center gap-2 border-l border-border/40 pl-4 h-8 self-end">
            <Switch
              id="anonymous-toggle"
              checked={isAnonymous}
              onCheckedChange={(checked) => setValue("isAnonymous", checked)}
            />
            <Label htmlFor="anonymous-toggle" className="flex items-center gap-1 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
              {isAnonymous ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                  <span>Post Anonymously</span>
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 text-[var(--cn-indigo)]" />
                  <span>Post Publicly</span>
                </>
              )}
            </Label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
              className="h-8.5 rounded-lg text-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={loading || content.trim().length === 0}
            className="h-8.5 bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white rounded-lg text-xs font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {isEditing ? "Saving..." : "Posting..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Post"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
