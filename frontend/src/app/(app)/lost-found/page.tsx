import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function LegacyLostFoundRedirectPage() {
  redirect(ROUTES.CAMPUS_LIFE_LOST_FOUND);
}
