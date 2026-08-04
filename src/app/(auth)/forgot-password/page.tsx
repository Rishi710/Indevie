import { redirect } from "next/navigation";

// Password recovery is handled by GoKwik — redirect to home
export default function ForgotPasswordPage() {
  redirect("/");
}
