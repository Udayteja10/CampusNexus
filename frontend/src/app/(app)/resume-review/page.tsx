import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { FileText } from "lucide-react";
export const metadata: Metadata = { title: "Resume Review" };
export default function ResumeReviewPage() {
  return <ModulePlaceholder title="Resume Review" description="Peer and expert resume review system — coming in Phase 5." icon={<FileText className="h-8 w-8 text-[var(--cn-violet)]" />} phase="Phase 5" />;
}
