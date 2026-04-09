import React from "react";
import { cookies } from "next/headers";
import { fetchCustomer } from "@/lib/shopify";
import { redirect } from "next/navigation";
import { logoutAction } from "../../actions/auth";

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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-[#6c3518]/10 pb-8">
          <div>
            <h1 className="text-4xl font-poppins text-[#6c3518] italic mb-2">
              Hello, {customer.firstName || "Indevie User"}
            </h1>
            <p className="text-gray-500 font-light font-poppins tracking-wide">
              Welcome back to your skincare Indevie dashboard.
            </p>
          </div>
          <form action={logoutAction}>
            <button 
              type="submit"
              className="text-[11px] font-bold tracking-[0.15em] text-[#6c3518] hover:text-[#6c3518]/70 uppercase border-b border-[#6c3518]/20 transition-all"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Order History */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-poppins text-[#6c3518] italic mb-6">Recent Orders</h2>
            {customer.orders?.nodes.length > 0 ? (
              <div className="space-y-4">
                {customer.orders.nodes.map((order: any) => (
                  <div key={order.id} className="bg-white p-6 rounded-[12px] border border-[#6c3518]/5 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">
                        Order {order.orderNumber}
                      </p>
                      <p className="text-sm text-[#6c3518] font-medium">
                        {new Date(order.processedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-poppins italic text-[#6c3518]">
                         {order.totalPriceV2.currencyCode} {parseFloat(order.totalPriceV2.amount).toLocaleString('en-IN')}
                       </p>
                       <p className="text-[10px] text-green-600 font-bold tracking-widest uppercase mt-1">Confirmed</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-dashed border-[#6c3518]/20 p-20 text-center rounded-[12px]">
                <p className="text-gray-400 font-poppins italic">No orders yet. Start your ritual today.</p>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[12px] border border-[#6c3518]/5 shadow-sm">
              <h2 className="text-lg font-poppins text-[#6c3518] italic mb-6">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase mb-1">Full Name</label>
                  <p className="text-sm font-poppins text-[#6c3518]">{customer.firstName} {customer.lastName}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase mb-1">Email Address</label>
                  <p className="text-sm font-poppins text-[#6c3518]">{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <label className="block text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase mb-1">Phone</label>
                    <p className="text-sm font-poppins text-[#6c3518]">{customer.phone}</p>
                  </div>
                )}
              </div>
              
              <button className="w-full mt-8 py-3 border border-[#6c3518]/20 rounded-[4px] text-[10px] font-poppins font-bold tracking-[0.2em] text-[#6c3518] uppercase hover:bg-[#6c3518]/5 transition-all">
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
