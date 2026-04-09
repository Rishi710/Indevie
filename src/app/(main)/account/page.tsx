import React from "react";
import { cookies } from "next/headers";
import { fetchCustomer } from "@/lib/shopify";
import { redirect } from "next/navigation";
import { logoutAction } from "../../actions/auth";
import AccountDetailsForm from "@/app/components/AccountDetailsForm";
import OrderHistory from "@/app/components/OrderHistory";

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
    <main className="min-h-screen bg-[#f5f1e6] pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-[#6c3518]/10 pb-10">
          <div>
            <h1 className="text-3xl lg:text-5xl font-poppins text-[#6c3518] italic mb-3">
              Hello, {customer.firstName || "Indevie User"}
            </h1>
            <p className="text-gray-500 font-light font-poppins tracking-wide text-sm">
              Welcome back to your personalized skincare Indevie dashboard.
            </p>
          </div>
          <form action={logoutAction}>
            <button 
              type="submit"
              className="text-[10px] font-bold tracking-[0.2em] text-[#6c3518] hover:text-[#000] uppercase border-b border-[#6c3518]/20 transition-all pb-1"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="grid lg:grid-cols-3 gap-16 items-start">
          {/* LEFT: Account Details & Address (1/3) */}
          <div className="lg:col-span-1">
            <AccountDetailsForm customer={customer} />
          </div>

          {/* RIGHT: Order History (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-poppins text-[#6c3518] italic">Order History</h2>
                <div className="px-4 py-1 bg-white rounded-full border border-[#6c3518]/10 shadow-sm">
                    <p className="text-[10px] font-bold text-[#6c3518] tracking-widest uppercase">
                        {customer.orders?.nodes.length || 0} Total Orders
                    </p>
                </div>
            </div>

            <OrderHistory orders={customer.orders?.nodes || []} />
          </div>
        </div>
      </div>
    </main>
  );
}

