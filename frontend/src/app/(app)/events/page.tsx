import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function LegacyEventsRedirectPage() {
  redirect(ROUTES.CAMPUS_LIFE_EVENTS);
}
