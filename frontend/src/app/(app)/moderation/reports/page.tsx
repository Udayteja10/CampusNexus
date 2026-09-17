"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function LegacyModReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ADMIN_REPORTS);
  }, [router]);

  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
