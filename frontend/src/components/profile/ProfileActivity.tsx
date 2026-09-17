"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types/post.types";
import { userService } from "@/services/user";
import { PostCard } from "@/components/community/PostCard";
import { MessageSquare, Loader2 } from "lucide-react";

interface ProfileActivityProps {
  userId: string;
}

export function ProfileActivity({ userId }: ProfileActivityProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    userService
      .getUserPublicPosts(userId)
      .then((data) => {
        if (isMounted) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPosts([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No Public Posts Yet</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Public posts shared by this student in the Community will be displayed here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
