"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import { Post } from "@/types/post.types";
import { useAuthStore } from "@/store/auth.store";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { PostComposer } from "@/components/community/PostComposer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  
  // Resolve params
  const resolvedParams = React.use(params);
  const postId = resolvedParams.id;

  const currentUser = useAuthStore((state) => state.user);
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
          // Check authorization (Must be author, and cannot edit anonymous posts easily)
          const isOwner = currentUser && data.author && data.author.id === currentUser.id;
          if (!isOwner && currentUser?.role === "STUDENT") {
            setError("You are not authorized to edit this post.");
          } else {
            setPost(data);
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to load post.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, currentUser]);

  const handleSuccess = () => {
    router.push(ROUTES.POST_DETAIL(postId));
  };

  const handleCancel = () => {
    router.push(ROUTES.POST_DETAIL(postId));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="text-muted-foreground hover:text-foreground gap-1 p-0 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Discussion</span>
      </Button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-indigo)]" />
          <p className="text-xs text-muted-foreground">Loading post details...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : post ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Edit Discussion Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PostComposer
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              defaultValues={post}
              postIdToEdit={post.id}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
