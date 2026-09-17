"use client";

import { useState } from "react";
import { ManagedUser, UserAccountStatus } from "@/types/moderation.types";
import { UserRole } from "@/types/user.types";
import { moderationService } from "@/services/moderation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShieldAlert } from "lucide-react";

interface UserActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser;
  mode: "STATUS" | "ROLE";
  onUserUpdated?: (updated: ManagedUser) => void;
}

export function UserActionDialog({
  open,
  onOpenChange,
  user,
  mode,
  onUserUpdated,
}: UserActionDialogProps) {
  const [status, setStatus] = useState<UserAccountStatus>(user.accountStatus);
  const [role, setRole] = useState<UserRole>(user.role);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let updated: ManagedUser;
      if (mode === "STATUS") {
        updated = await moderationService.updateUserStatus(
          user.id,
          status,
          reason.trim() || undefined
        );
      } else {
        updated = await moderationService.updateUserRole(user.id, role);
      }

      onUserUpdated?.(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <DialogTitle>
              {mode === "STATUS" ? "Manage Account Status" : "Modify Authentication Role"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === "STATUS"
              ? `Update account status for ${user.fullName} (@${user.username}).`
              : `Assign administrative privileges or permissions to ${user.fullName}. (Admin Only)`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
            <div>
              <span className="font-semibold text-foreground">Student/Staff:</span> {user.fullName}
            </div>
            <div>
              <span className="font-semibold text-foreground">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-semibold text-foreground">Current Role:</span> {user.role} |{" "}
              <span className="font-semibold text-foreground">Status:</span> {user.accountStatus}
            </div>
          </div>

          {mode === "STATUS" ? (
            <div className="space-y-1.5">
              <Label htmlFor="account-status">Account Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as UserAccountStatus)}
              >
                <SelectTrigger id="account-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active (Normal access)</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted (Posting disabled)</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended (Account locked)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="account-role">Top-Level Role *</Label>
              <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                <SelectTrigger id="account-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student (Standard User)</SelectItem>
                  <SelectItem value="MODERATOR">Moderator (Global Content Triage)</SelectItem>
                  <SelectItem value="ADMIN">Admin (Full System Authority)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="audit-reason">Reason / Audit Log Note *</Label>
            <Textarea
              id="audit-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Specify the reason for this account modification..."
              rows={3}
              className="rounded-xl text-sm leading-relaxed"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={status === "SUSPENDED" ? "destructive" : "default"}
              disabled={loading || !reason.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm & Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
