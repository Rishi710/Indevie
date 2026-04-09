"use client";

import { useActionState, useState } from "react";
import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const initialState: { success: boolean; error: string | null } = {
  success: false,
  error: null,
};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/account");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-5 lg:space-y-6">
      {state.error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-[8px] text-[13px] font-medium">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            placeholder="First"
            className="w-full px-5 py-3.5 border border-[#6c3518]/10 rounded-xl bg-[#f5f1e6]/20 focus:outline-none focus:border-[#6c3518]/40 focus:bg-white transition-all text-sm text-[#6c3518] placeholder:text-gray-300"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            placeholder="Last"
            className="w-full px-5 py-3.5 border border-[#6c3518]/10 rounded-xl bg-[#f5f1e6]/20 focus:outline-none focus:border-[#6c3518]/40 focus:bg-white transition-all text-sm font-poppins text-[#6c3518] placeholder:text-gray-300"
          />
        </div>
      </div>

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
        <label htmlFor="password" className="block text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase mb-2">
          Create Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            required
            placeholder="Min. 8 characters"
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

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#6c3518] text-white py-4 rounded-xl text-[10px] font-poppins font-bold tracking-[0.25em] uppercase hover:bg-black transition-all duration-500 disabled:opacity-50 shadow-lg shadow-[#6c3518]/10"
        >
          {isPending ? "Creating Account..." : "Join the Indevie"}
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-sm font-poppins text-gray-400 font-light">
          Already have an account?{" "}
          <Link href="/login" className="text-[#6c3518] font-poppins font-medium hover:text-black transition-all ml-1 underline underline-offset-4 decoration-[#6c3518]/20">
            Log in here
          </Link>
        </p>
      </div>
    </form>
  );
}
