"use client";

import { useActionState, useState, useEffect } from "react";
import { activateAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const initialState: { success: boolean; error: string | null } = {
    success: false,
    error: null,
};

interface ActivateFormProps {
    customerId: string;
    activationToken: string;
}

export default function ActivateForm({ customerId, activationToken }: ActivateFormProps) {
    const [state, formAction, isPending] = useActionState(activateAction, initialState);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push("/account");
            router.refresh(); // Refresh to update auth state in header
        }
    }, [state.success, router]);

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl shadow-[#6c3518]/5 border border-[#6c3518]/5">
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="customerId" value={customerId} />
                <input type="hidden" name="activationToken" value={activationToken} />

                <div className="text-center mb-4">
                    <h2 className="text-2xl font-poppins font-bold text-[#6c3518] mb-2 tracking-tight">Activate Account</h2>
                    <p className="text-sm font-poppins text-gray-500 font-light leading-relaxed">
                        Please set a new password to activate your account and access your orders.
                    </p>
                </div>

                {state.error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-top-1">
                        {state.error}
                    </div>
                )}

                <div className="space-y-2 text-left">
                    <div>
                        <label htmlFor="password" className="block text-[11px] font-poppins font-bold tracking-[0.15em] text-[#6c3518] uppercase mb-2 ml-1">
                            New Password
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                required
                                placeholder="Minimum 8 characters"
                                className="w-full px-5 py-3.5 border border-[#6c3518]/10 rounded-xl bg-[#f5f1e6]/10 focus:outline-none focus:border-[#6c3518]/40 focus:bg-white transition-all text-sm font-poppins text-[#6c3518] placeholder:text-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6c3518]/30 hover:text-[#6c3518] transition-colors"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="passwordConfirm" className="block text-[11px] font-poppins font-bold tracking-[0.15em] text-[#6c3518] uppercase mb-2 ml-1">
                            Confirm Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="passwordConfirm"
                            name="passwordConfirm"
                            required
                            placeholder="Re-enter password"
                            className="w-full px-5 py-3.5 border border-[#6c3518]/10 rounded-xl bg-[#f5f1e6]/10 focus:outline-none focus:border-[#6c3518]/40 focus:bg-white transition-all text-sm font-poppins text-[#6c3518] placeholder:text-gray-300"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#6c3518] text-white py-4 rounded-xl text-[11px] font-poppins font-bold tracking-[0.2em] uppercase hover:bg-black transition-all duration-500 disabled:opacity-50 shadow-lg shadow-[#6c3518]/10 active:scale-[0.98]"
                    >
                        {isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Activating...
                            </span>
                        ) : "Activate Account"}
                    </button>
                </div>
            </form>
        </div>
    );
}
