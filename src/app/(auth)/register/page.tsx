import { redirect } from "next/navigation";

// Registration is handled by GoKwik — redirect to home
export default function RegisterPage() {
  redirect("/");
}
