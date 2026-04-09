"use client";

import React, { useState, useActionState, useEffect } from "react";
import { updateCustomerAction } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Check, X, MapPin } from "lucide-react";

interface AccountDetailsFormProps {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    defaultAddress?: {
      address1: string;
      address2?: string | null;
      city: string;
      province: string;
      country: string;
      zip: string;
    } | null;
  };
}

const initialState = { success: false, error: null as string | null };

export default function AccountDetailsForm({ customer }: AccountDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateCustomerAction, initialState);

  // Close editing on success
  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state.success]);

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white p-8 rounded-[12px] border border-[#6c3518]/5 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-poppins text-[#6c3518] italic">Profile Details</h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#6c3518] uppercase hover:opacity-70 transition-all"
            >
              <Edit3 size={14} />
              Edit details
            </button>
          ) : (
             <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-red-600 uppercase hover:opacity-70 transition-all"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>

        {state.error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] font-poppins rounded-lg">
                {state.error}
            </div>
        )}

        <form action={formAction}>
           <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase mb-1">First Name</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="firstName" 
                                defaultValue={customer.firstName}
                                className="w-full text-sm font-poppins text-[#6c3518] bg-[#f5f1e6]/30 border border-[#6c3518]/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6c3518]/30"
                                required
                            />
                        ) : (
                            <p className="text-sm font-poppins text-[#6c3518]">{customer.firstName}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase mb-1">Last Name</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="lastName" 
                                defaultValue={customer.lastName}
                                className="w-full text-sm font-poppins text-[#6c3518] bg-[#f5f1e6]/30 border border-[#6c3518]/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6c3518]/30"
                                required
                            />
                        ) : (
                            <p className="text-sm font-poppins text-[#6c3518]">{customer.lastName}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase mb-1">Email Address</label>
                    {isEditing ? (
                        <input 
                            type="email" 
                            name="email" 
                            defaultValue={customer.email}
                            className="w-full text-sm font-poppins text-[#6c3518] bg-[#f5f1e6]/30 border border-[#6c3518]/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6c3518]/30"
                            required
                        />
                    ) : (
                        <p className="text-sm font-poppins text-[#6c3518]">{customer.email}</p>
                    )}
                </div>

                <div>
                    <label className="block text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase mb-1 font-medium">
                        Phone Number
                    </label>
                    {isEditing ? (
                        <div>
                        <input 
                            type="tel" 
                            name="phone" 
                            defaultValue={customer.phone || ""}
                            placeholder="+919977997799"
                            className="w-full text-sm font-poppins text-[#6c3518] bg-[#f5f1e6]/30 border border-[#6c3518]/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6c3518]/30"
                        />
                         <p className="text-[9px] text-gray-400 mt-1 italic tracking-wider uppercase">Format: +91...</p>
                        </div>
                    ) : (
                        <p className="text-sm font-poppins text-[#6c3518]">{customer.phone || "Not provided"}</p>
                    )}
                </div>

                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-4"
                        >
                            <button 
                                type="submit" 
                                disabled={isPending}
                                className="w-full bg-[#6c3518] text-white py-4 rounded-xl text-[10px] font-poppins font-bold tracking-[0.25em] uppercase hover:bg-black transition-all duration-500 disabled:opacity-50"
                            >
                                {isPending ? "Updating Ritual..." : "Save Changes"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
           </div>
        </form>
      </div>

      {/* Address Section */}
      <div className="bg-white p-8 rounded-[12px] border border-[#6c3518]/5 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-[#6c3518]">
            <MapPin size={18} className="opacity-50" />
            <h2 className="text-lg font-poppins italic">Default Address</h2>
        </div>
        
        {customer.defaultAddress ? (
            <div className="space-y-1 text-sm font-poppins text-[#6c3518]/80 leading-relaxed">
                <p className="font-semibold text-[#6c3518]">{customer.firstName} {customer.lastName}</p>
                <p>{customer.defaultAddress.address1}</p>
                {customer.defaultAddress.address2 && <p>{customer.defaultAddress.address2}</p>}
                <p>{customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}</p>
                <p>{customer.defaultAddress.country}</p>
            </div>
        ) : (
            <p className="text-sm font-poppins text-gray-400 italic">No address on file.</p>
        )}

        <button className="w-full mt-8 py-3 border border-[#6c3518]/20 rounded-[8px] text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase hover:bg-[#6c3518]/5 transition-all">
            Manage Addresses
        </button>
      </div>
    </div>
  );
}
