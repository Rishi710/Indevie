import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { fetchCustomer } from "@/lib/shopify";
import { redirect } from "next/navigation";
import AccountDashboard from "@/app/components/AccountDashboard";

export const metadata = {
  title: "My Account - Indevie Beauty",
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerAccessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  const customer = await fetchCustomer(token);

  if (!customer) {
    // Token might be invalid or expired
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#fcfaf6] pt-40 pb-20 px-10">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-16 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#6c3518]/10 pb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-[1px] bg-[#6c3518]"></span>
                <span className="text-[10px] font-bold text-[#6c3518] uppercase tracking-[0.4em]">Welcome to your Dashboard</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-poppins text-[#6c3518] italic -ml-1">
                Hello, {customer.firstName || "Indevie User"}
              </h1>
              {/* <p className="text-gray-500 font-light font-poppins tracking-wide text-sm mt-4 max-w-md leading-relaxed">
                This is your little corner of Indevie, where everything is just for you. Check in on your orders, update your details, or simply pick up right where you left off in your skincare journey.
              </p> */}
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#f5f1e6]/20 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        {/* Dashboard Content */}
        <Suspense fallback={
          <div className="flex items-center justify-center p-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c3518]"></div>
          </div>
        }>
          <AccountDashboard customer={customer} />
        </Suspense>
      </div>
    </main>
  );
}

