"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostComposer } from "@/components/community/PostComposer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function CreatePostPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(ROUTES.COMMUNITY);
  };

  const handleCancel = () => {
    router.push(ROUTES.COMMUNITY);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="text-muted-foreground hover:text-foreground gap-1 p-0 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Discussions</span>
      </Button>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Create Discussion Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PostComposer onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
