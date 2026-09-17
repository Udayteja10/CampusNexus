import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function LegacyClubsRedirectPage() {
  redirect(ROUTES.CAMPUS_LIFE_CLUBS);
}
