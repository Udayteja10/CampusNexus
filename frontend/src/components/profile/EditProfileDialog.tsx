"use client";

import { useState } from "react";
import { User } from "@/types/user.types";
import { userService } from "@/services/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onUpdated?: (user: User) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onUpdated,
}: EditProfileDialogProps) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await userService.updateUserProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
      });
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your public profile details. Institutional academic information is verified and read-only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="username (lowercase, numbers, _)"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              3–20 characters, lowercase letters, numbers, and underscores only.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself, your academic focus or technical interests..."
              rows={3}
              maxLength={300}
            />
            <div className="text-right text-[11px] text-muted-foreground">
              {bio.length}/300
            </div>
          </div>

          {/* Verified Academic Identity (Read-only) */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Verified Institutional Identity</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/70">HTNO</span>
                <span className="font-mono text-foreground font-medium">{user.htno || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/70">Department</span>
                <span className="text-foreground font-medium">{user.department || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/70">Year of Study</span>
                <span className="text-foreground font-medium">{user.yearOfStudy ? `Year ${user.yearOfStudy}` : "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/70">Role</span>
                <span className="text-foreground font-medium">{user.role}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
              <Lock className="h-3 w-3" /> Academic credentials are permanently linked to your institutional HTNO.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
