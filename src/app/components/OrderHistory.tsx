"use client";

import React from "react";
import { motion } from "framer-motion";
import { Package, Calendar, CreditCard, ChevronRight } from "lucide-react";

interface OrderHistoryProps {
  orders: any[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white/50 border border-dashed border-[#6c3518]/20 p-20 text-center rounded-[12px] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#6c3518]/20 shadow-inner">
            <Package size={24} />
        </div>
        <p className="text-[#6c3518]/40 font-poppins italic text-sm">No orders yet. Start your ritual today.</p>
        <button className="text-[10px] font-bold tracking-widest text-[#6c3518] uppercase underline underline-offset-4 hover:text-black transition-colors">
            Explore Indevie
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, idx) => (
        <motion.div 
          key={order.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className="bg-white p-6 lg:p-8 rounded-[12px] border border-[#6c3518]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-xl hover:shadow-[#6c3518]/5 transition-all duration-500 cursor-pointer"
        >
          <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#f5f1e6] rounded-xl overflow-hidden flex-shrink-0 relative border border-[#6c3518]/5 group-hover:scale-105 transition-transform duration-500">
                   {order.lineItems.nodes[0]?.variant?.image?.url ? (
                      <img 
                          src={order.lineItems.nodes[0].variant.image.url} 
                          alt="Product" 
                          className="w-full h-full object-cover"
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6c3518]/10">
                          <Package size={24} />
                      </div>
                   )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#6c3518]/40 uppercase">
                  Order #{order.orderNumber}
                </p>
                <p className="text-base text-[#6c3518] font-medium font-poppins">
                  {new Date(order.processedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                  })}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-poppins">
                    <span>{order.lineItems.nodes.length} Items</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span className="text-green-600 font-bold uppercase tracking-wider">Fulfilled</span>
                </div>
              </div>
          </div>
          
          <div className="w-full md:w-auto flex justify-between md:flex-row items-center gap-6 border-t md:border-none pt-4 md:pt-0">
             <div className="text-left md:text-right">
                <p className="text-lg font-poppins font-semibold text-[#6c3518]">
                  {order.totalPriceV2.currencyCode} {parseFloat(order.totalPriceV2.amount).toLocaleString('en-IN')}
                </p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Paid via Card</p>
             </div>
             <div className="w-8 h-8 rounded-full border border-[#6c3518]/10 flex items-center justify-center text-[#6c3518]/40 group-hover:bg-[#6c3518] group-hover:text-white group-hover:border-[#6c3518] transition-all duration-300">
                <ChevronRight size={16} />
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
