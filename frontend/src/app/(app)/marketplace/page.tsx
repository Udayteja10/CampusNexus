import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function LegacyMarketplaceRedirectPage() {
  redirect(ROUTES.CAMPUS_LIFE_MARKETPLACE);
}
