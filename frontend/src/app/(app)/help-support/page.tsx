import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { HelpCircle } from "lucide-react";
export const metadata: Metadata = { title: "Help & Support" };
export default function HelpSupportPage() {
  return <ModulePlaceholder title="Help & Support" description="FAQs, guides and contact support — coming in Phase 7." icon={<HelpCircle className="h-8 w-8 text-[var(--cn-indigo)]" />} phase="Phase 7" />;
}
