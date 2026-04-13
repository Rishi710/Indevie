"use client";

import React, { useState, useEffect } from "react";
import AccountDetailsForm from "./AccountDetailsForm";
import OrderHistory from "./OrderHistory";
import { useSearchParams, useRouter } from "next/navigation";
import { logoutAction } from "../actions/auth";
import { User, ShoppingBag, LogOut, ChevronRight } from "lucide-react";

export default function AccountDashboard({ customer }: { customer: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "profile" || tab === "orders")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const tabs = [
    { 
      id: "profile", 
      label: "My Profile", 
      icon: <User size={20} />,
      description: "Personal info & addresses"
    },
    { 
      id: "orders", 
      label: "My Orders", 
      icon: <ShoppingBag size={20} />,
      description: "Manage your purchases"
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-1/3 xl:w-1/4 lg:sticky lg:top-32">
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#6c3518]/5 overflow-hidden relative">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#f5f1e6]/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="mb-8 px-2">
              <p className="text-[10px] font-bold text-[#6c3518]/40 uppercase tracking-[0.2em] mb-1">Account Menu</p>
              <h3 className="text-xl font-poppins text-[#6c3518] italic">Indevie Dashboard</h3>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full group relative flex items-center p-4 rounded-2xl transition-all duration-500 ${
                    activeTab === tab.id
                      ? "bg-[#6c3518] text-white shadow-xl shadow-[#6c3518]/10"
                      : "text-[#6c3518]/60 hover:bg-[#f5f1e6]/50 hover:text-[#6c3518]"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors duration-500 ${
                    activeTab === tab.id ? "bg-white/10" : "bg-gray-50 group-hover:bg-white"
                  }`}>
                    {tab.icon}
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-[14px] font-bold font-poppins uppercase tracking-wider">{tab.label}</p>
                    <p className={`text-[10px] italic font-poppins tracking-wide ${
                      activeTab === tab.id ? "text-white/60" : "text-gray-400"
                    }`}>
                      {tab.description}
                    </p>
                  </div>
                  {activeTab === tab.id && (
                    <div className="ml-auto">
                      <ChevronRight size={16} className="text-white/40" />
                    </div>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute left-0 w-1 h-6 bg-white rounded-r-full my-auto inset-y-0"></span>
                  )}
                </button>
              ))}
              
              <div className="pt-6 mt-4 border-t border-gray-100">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full group flex items-center p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-500"
                  >
                    <div className="p-2.5 rounded-xl bg-red-50 group-hover:bg-white transition-colors">
                      <LogOut size={20} />
                    </div>
                    <div className="ml-4 text-left">
                      <p className="text-[14px] font-bold font-poppins uppercase tracking-wider">Sign Out</p>
                      <p className="text-[10px] italic font-poppins tracking-wide text-red-300">End your session</p>
                    </div>
                  </button>
                </form>
              </div>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="w-full lg:w-2/3 xl:w-3/4 min-h-[500px]">
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {activeTab === "profile" ? (
            <div className="space-y-8">
              <div className="bg-white rounded-[24px] p-8 lg:p-10 shadow-sm border border-[#6c3518]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5f1e6]/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="mb-10 inline-block">
                    <span className="text-[10px] font-bold text-[#6c3518]/40 uppercase tracking-[0.3em] mb-2 block">Personal Portal</span>
                    <h2 className="text-4xl lg:text-5xl font-poppins text-[#6c3518] italic lowercase">profile <span className="text-gray-300 not-italic font-light">details</span></h2>
                    <div className="h-0.5 w-12 bg-[#6c3518]/20 mt-4"></div>
                  </div>
                  <AccountDetailsForm customer={customer} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-[24px] p-8 lg:p-10 shadow-sm border border-[#6c3518]/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5f1e6]/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                 <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                      <span className="text-[10px] font-bold text-[#6c3518]/40 uppercase tracking-[0.3em] mb-2 block">Shopping Archive</span>
                      <h2 className="text-4xl lg:text-5xl font-poppins text-[#6c3518] italic lowercase">order <span className="text-gray-300 not-italic font-light">history</span></h2>
                      <div className="h-0.5 w-12 bg-[#6c3518]/20 mt-4"></div>
                    </div>
                    <div className="bg-[#f5f1e6] px-6 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[120px]">
                        <p className="text-[18px] font-serif italic text-[#6c3518] leading-none mb-1">
                            {customer.orders?.nodes.length || 0}
                        </p>
                        <p className="text-[8px] font-bold text-[#6c3518]/50 tracking-[0.2em] uppercase">
                            Total Orders
                        </p>
                    </div>
                </div>
                <OrderHistory orders={customer.orders?.nodes || []} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
