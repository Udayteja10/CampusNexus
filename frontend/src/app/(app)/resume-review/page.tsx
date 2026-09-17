import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function ResumeReviewRedirect() {
  redirect(ROUTES.CAREER_RESUME_REVIEW);
}
