import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Flag } from "lucide-react";
export const metadata: Metadata = { title: "Admin — Reports" };
export default function AdminReportsPage() {
  return <ModulePlaceholder title="Admin — Reports" description="Platform-level reporting and analytics — coming in Phase 8." icon={<Flag className="h-8 w-8 text-[var(--cn-rose)]" />} phase="Phase 8" />;
}
