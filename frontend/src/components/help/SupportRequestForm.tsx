"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCategory, SupportRequestPriority } from "@/types/help.types";
import { HELP_CATEGORIES } from "@/services/help/help.seed";
import { helpService } from "@/services/help";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

interface SupportRequestFormProps {
  initialCategory?: HelpCategory;
  initialRoute?: string;
  onSuccess?: (requestId: string) => void;
}

export function SupportRequestForm({
  initialCategory = "TECHNICAL",
  initialRoute = "",
  onSuccess,
}: SupportRequestFormProps) {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<HelpCategory>(initialCategory);
  const [priority, setPriority] = useState<SupportRequestPriority>("MEDIUM");
  const [relatedRoute, setRelatedRoute] = useState(initialRoute);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Please enter a subject for your request.");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description of the issue or question.");
      return;
    }

    setLoading(true);

    try {
      const created = await helpService.createSupportRequest({
        subject: subject.trim(),
        category,
        priority,
        relatedRoute: relatedRoute.trim() || undefined,
        description: description.trim(),
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess(created.id);
      } else {
        setTimeout(() => {
          router.push(ROUTES.HELP_REQUEST_DETAIL(created.id));
        }, 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit support request.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Support Request Submitted!</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your support ticket has been registered. You can track progress and updates under My Support Requests.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => router.push(ROUTES.HELP_REQUESTS)}
            className="rounded-xl font-semibold"
          >
            Go to My Requests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">Submit a Support Request</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Describe the problem or query in detail. Our support coordinators will assist you.
        </p>
      </div>

      {error && (
        <div className="p-3.5 text-xs font-medium text-destructive bg-destructive/10 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Subject */}
        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your query or issue"
            className="h-11 rounded-xl"
            required
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory((val as HelpCategory) || "TECHNICAL")}
            >
              <SelectTrigger id="category" className="h-11 rounded-xl">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {HELP_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(val) => setPriority((val as SupportRequestPriority) || "MEDIUM")}
            >
              <SelectTrigger id="priority" className="h-11 rounded-xl">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low (General inquiry / advice)</SelectItem>
                <SelectItem value="MEDIUM">Medium (Standard request)</SelectItem>
                <SelectItem value="HIGH">High (Urgent academic/placement issue)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Related Route (Optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="relatedRoute">Related Page / Feature (Optional)</Label>
          <Input
            id="relatedRoute"
            value={relatedRoute}
            onChange={(e) => setRelatedRoute(e.target.value)}
            placeholder="e.g. /academic/resources or /career/placements"
            className="h-11 rounded-xl font-mono text-xs"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Detailed Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide full details, including steps to reproduce the issue, exact error messages, or context..."
            rows={5}
            className="rounded-xl leading-relaxed text-sm"
            required
          />
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Requests are private and only viewable by you and verified campus support coordinators.
        </p>

        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto rounded-xl font-semibold gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
