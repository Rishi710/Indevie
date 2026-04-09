"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const initialState: { success: boolean; error: string | null } = {
  success: false,
  error: null,
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/account");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6 lg:space-y-8">
      {state.error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-[8px] text-[13px] font-medium">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="email@example.com"
          className="w-full px-5 py-3.5 border border-[#6c3518]/10 rounded-xl bg-[#f5f1e6]/20 focus:outline-none focus:border-[#6c3518]/40 focus:bg-white transition-all text-sm font-poppins text-[#6c3518] placeholder:text-gray-300"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="password" className="block text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase">
            Password
          </label>
          <Link 
            href="/forgot-password" 
            className="text-[9px] font-poppins uppercase tracking-wider text-[#6c3518]/60 hover:text-[#6c3518] border-b border-transparent hover:border-[#6c3518]/20 transition-all"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-5 py-3.5 border border-[#6c3518]/10 rounded-xl bg-[#f5f1e6]/20 focus:outline-none focus:border-[#6c3518]/40 focus:bg-white transition-all text-sm font-poppins text-[#6c3518] placeholder:text-gray-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6c3518]/40 hover:text-[#6c3518] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#6c3518] text-white py-4 rounded-xl text-[10px] font-poppins font-bold tracking-[0.25em] uppercase hover:bg-black transition-all duration-500 disabled:opacity-50 shadow-lg shadow-[#6c3518]/10"
        >
          {isPending ? "Authenticating..." : "Sign In to Indevie"}
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-sm font-poppins text-gray-400 font-light">
          New to Indevie?{" "}
          <Link href="/register" className="text-[#6c3518] font-poppins font-medium hover:text-black transition-all ml-1 underline underline-offset-4 decoration-[#6c3518]/20">
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
}
