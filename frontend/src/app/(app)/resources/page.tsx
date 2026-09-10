import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function ResourcesRedirectPage() {
  redirect(ROUTES.ACADEMIC_RESOURCES);
}
