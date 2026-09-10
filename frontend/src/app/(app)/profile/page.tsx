import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { User } from "lucide-react";
export const metadata: Metadata = { title: "Profile" };
export default function ProfilePage() {
  return <ModulePlaceholder title="Profile" description="Your campus identity — avatar, bio, badges and activity — coming in Phase 3." icon={<User className="h-8 w-8 text-[var(--cn-indigo)]" />} phase="Phase 3" />;
}
