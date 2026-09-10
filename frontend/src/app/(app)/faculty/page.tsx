import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function FacultyRedirectPage() {
  redirect(ROUTES.ACADEMIC_FACULTY);
}
