"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { UserActionDialog } from "@/components/admin/UserActionDialog";
import { moderationService } from "@/services/moderation";
import { ManagedUser, UserAccountStatus } from "@/types/moderation.types";
import { UserRole } from "@/types/user.types";
import { useAuthStore, selectIsAdmin } from "@/store/auth.store";

export default function AdminUsersPage() {
  const isAdmin = useAuthStore(selectIsAdmin);
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<UserAccountStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [dialogMode, setDialogMode] = useState<"STATUS" | "ROLE">("STATUS");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moderationService.getManagedUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchQuery,
      });
      setUsers(data);
    } catch (err) {
      console.error("Failed to load managed users:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenDialog = (user: ManagedUser, mode: "STATUS" | "ROLE") => {
    setSelectedUser(user);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const handleUserUpdated = (updated: ManagedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              User Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user accounts, regulate posting permissions, suspend policy violators, and assign administrative roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers()}
            className="rounded-xl"
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, email, department..."
            className="pl-9 text-sm rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val as UserRole | "ALL")}>
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="MODERATOR">Moderator</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as UserAccountStatus | "ALL")}
          >
            <SelectTrigger className="w-[150px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="RESTRICTED">Restricted</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Table / List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No users match filters</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search query or role/status filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">User</th>
                  <th className="px-3 py-3.5">Department</th>
                  <th className="px-3 py-3.5">Role</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {users.map((user) => {
                  const isTargetAdmin = user.role === "ADMIN";
                  const canModifyStatus = isAdmin || !isTargetAdmin;
                  const isSelf = currentUser?.id === user.id;

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-muted/30">
                      <td className="py-3.5 pl-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {user.fullName} {isSelf && <span className="text-[10px] text-muted-foreground font-normal">(You)</span>}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              @{user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="font-medium text-foreground">{user.department || "General"}</div>
                        {user.batch && (
                          <div className="text-[11px] text-muted-foreground">{user.batch}</div>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : user.role === "MODERATOR"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.role === "ADMIN" && <Shield className="h-3 w-3" />}
                          {user.role === "MODERATOR" && <ShieldAlert className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        <UserStatusBadge status={user.accountStatus} />
                      </td>

                      <td className="px-3 py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {canModifyStatus && !isSelf && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(user, "STATUS")}
                              className="h-8 text-xs rounded-xl"
                            >
                              Manage Status
                            </Button>
                          )}

                          {isAdmin && !isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(user, "ROLE")}
                              className="h-8 text-xs text-primary rounded-xl"
                            >
                              <Sparkles className="mr-1 h-3 w-3" />
                              Change Role
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Action Dialog */}
      {selectedUser && (
        <UserActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={selectedUser}
          mode={dialogMode}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}
