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
      id: string;
      address1: string;
      address2?: string | null;
      city: string;
      province: string;
      country: string;
      zip: string;
    } | null;
    addresses: {
      nodes: Array<{
        id: string;
        address1: string;
        address2?: string | null;
        city: string;
        province: string;
        country: string;
        zip: string;
        firstName?: string;
        lastName?: string;
      }>;
    };
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
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-[#6c3518]">
                <MapPin size={18} className="opacity-50" />
                <h2 className="text-xl font-poppins italic">Saved Addresses</h2>
            </div>
            <span className="text-[10px] font-bold text-[#6c3518]/40 uppercase tracking-widest">
                {customer.addresses?.nodes.length || 0} Saved
            </span>
        </div>
        
        <div className="space-y-6">
            {customer.addresses?.nodes.length > 0 ? (
                customer.addresses.nodes.map((address) => (
                    <div 
                        key={address.id} 
                        className={`p-6 rounded-xl border transition-all ${
                            address.id === customer.defaultAddress?.id 
                            ? 'bg-[#f5f1e6]/40 border-[#6c3518]/20 shadow-sm' 
                            : 'bg-white border-[#6c3518]/5 hover:border-[#6c3518]/10'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <p className="font-semibold text-[#6c3518] font-poppins text-sm uppercase tracking-wide">
                                {address.firstName} {address.lastName}
                            </p>
                            {address.id === customer.defaultAddress?.id && (
                                <span className="bg-[#6c3518] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    Default
                                </span>
                            )}
                        </div>
                        <div className="space-y-0.5 text-xs font-poppins text-[#6c3518]/70 leading-relaxed italic">
                            <p>{address.address1}</p>
                            {address.address2 && <p>{address.address2}</p>}
                            <p>{address.city}, {address.province} {address.zip}</p>
                            <p className="uppercase tracking-widest text-[9px] mt-1 font-bold">{address.country}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 bg-[#f5f1e6]/20 rounded-xl border border-dashed border-[#6c3518]/10">
                    <p className="text-sm font-poppins text-gray-400 italic">No addresses saved yet.</p>
                </div>
            )}
        </div>

        {/* <button className="w-full mt-10 py-4 bg-[#f5f1e6] border border-[#6c3518]/10 rounded-xl text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase hover:bg-white hover:border-[#6c3518]/30 transition-all duration-300">
            Add New Address
        </button> */}
      </div>
    </div>
  );
}
