import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { UserCog } from "lucide-react";
export const metadata: Metadata = { title: "Admin Panel" };
export default function AdminPage() {
  return <ModulePlaceholder title="Admin Panel" description="Platform administration and configuration — coming in Phase 8." icon={<UserCog className="h-8 w-8 text-[var(--cn-rose)]" />} phase="Phase 8" />;
}
