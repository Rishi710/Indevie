"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/app/actions/auth";
import Link from "next/link";

const initialState: { success: boolean; error: string | null } = {
  success: false,
  error: null,
};

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <div className="space-y-6 lg:space-y-8">
      {state.success ? (
        <div className="space-y-6 text-center lg:text-left">
          <div className="bg-green-50 border border-green-100 text-[#4a7c59] px-6 py-5 rounded-2xl text-sm font-poppins leading-relaxed">
            <p className="font-semibold mb-1">Check your inbox</p>
            <p className="font-light opacity-90">We've sent a recovery link to your email address. Please follow the instructions to reset your ritual password.</p>
          </div>
          <Link 
            href="/login" 
            className="inline-block text-[11px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase border-b border-[#6c3518]/20 hover:border-[#6c3518] transition-all pb-1"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-8">
          {state.error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-[8px] text-[13px] font-poppins font-medium">
              {state.error}
            </div>
          )}

          <p className="text-gray-400 font-light font-poppins text-xs lg:text-sm leading-relaxed">
            Enter your email address and we'll send you a link to reset your password and continue your skincare journey.
          </p>

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

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#6c3518] text-white py-4 rounded-xl text-[10px] font-poppins font-bold tracking-[0.25em] uppercase hover:bg-black transition-all duration-500 disabled:opacity-50 shadow-lg shadow-[#6c3518]/10"
            >
              {isPending ? "Sending..." : "Send Recovery Link"}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm font-poppins text-gray-400 font-light">
              Remember your password?{" "}
              <Link href="/login" className="text-[#6c3518] font-poppins font-medium hover:text-black transition-all ml-1 underline underline-offset-4 decoration-[#6c3518]/20">
                Log in here
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
