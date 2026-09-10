import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Users } from "lucide-react";
export const metadata: Metadata = { title: "Admin — Users" };
export default function AdminUsersPage() {
  return <ModulePlaceholder title="Admin — User Management" description="Manage user accounts, roles and permissions — coming in Phase 8." icon={<Users className="h-8 w-8 text-[var(--cn-rose)]" />} phase="Phase 8" />;
}
