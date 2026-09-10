import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { User } from "lucide-react";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  return (
    <ModulePlaceholder
      title={`@${username}`}
      description="Full user profiles with badges, activity and social graph — coming in Phase 3."
      icon={<User className="h-8 w-8 text-[var(--cn-indigo)]" />}
      phase="Phase 3"
    />
  );
}
