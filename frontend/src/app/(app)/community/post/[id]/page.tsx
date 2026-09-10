"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import { Post } from "@/types/post.types";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { PostCard } from "@/components/community/PostCard";
import { CommentList } from "@/components/community/CommentList";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  
  // Resolve params promise
  const resolvedParams = React.use(params);
  const postId = resolvedParams.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await MockCommunityServiceInstance.getPostById(postId);
        if (!data) {
          setError("Discussion post not found.");
        } else {
          setPost(data);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to load post.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleBack = () => {
    router.push(ROUTES.COMMUNITY);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="text-muted-foreground hover:text-foreground gap-1 p-0 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Discussions</span>
      </Button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-indigo)]" />
          <p className="text-xs text-muted-foreground">Loading discussion post...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : post ? (
        <div className="space-y-6">
          {/* Post Card in detailed view mode */}
          <PostCard post={post} isDetailed={true} />

          {/* Comments Section */}
          <div className="border border-border/60 bg-card rounded-2xl p-4 sm:p-5 shadow-sm">
            <CommentList postId={post.id} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
