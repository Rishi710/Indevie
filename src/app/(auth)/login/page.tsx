import { redirect } from "next/navigation";

// Login is handled by GoKwik — redirect to home
export default function LoginPage() {
  redirect("/");
}
