"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Calendar, CreditCard, ChevronDown, ChevronUp, ExternalLink, MapPin, ReceiptText } from "lucide-react";

interface OrderHistoryProps {
  orders: any[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'FULFILLED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'UNFULFILLED':
      case 'PENDING':
      case 'AUTHORIZED':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-poppins font-medium text-[#6c3518]/60 uppercase tracking-widest">Recent Purchases</h3>
        <span className="text-[10px] font-bold text-[#6c3518]/40 uppercase tracking-widest">{orders.length} TOTAL</span>
      </div>

      {orders.map((order, idx) => {
        const isExpanded = expandedOrderId === order.id;
        
        return (
          <div 
            key={order.id} 
            className="bg-white rounded-[16px] border border-[#6c3518]/5 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#6c3518]/5"
          >
            {/* Order Header / Summary */}
            <div 
              onClick={() => toggleOrder(order.id)}
              className="p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#f5f1e6] rounded-xl flex items-center justify-center text-[#6c3518]/30 border border-[#6c3518]/5 group-hover:scale-105 transition-transform duration-500">
                  <ReceiptText size={20} />
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
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(order.financialStatus || 'UNPAID')}`}>
                      {order.financialStatus?.replace('_', ' ') || 'UNPAID'}
                    </span>
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(order.fulfillmentStatus || 'UNFULFILLED')}`}>
                      {order.fulfillmentStatus?.replace('_', ' ') || 'PROCESSING'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto flex justify-between md:flex-row items-center gap-6 border-t md:border-none pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-lg font-poppins font-semibold text-[#6c3518]">
                    {order.totalPriceV2.currencyCode} {parseFloat(order.totalPriceV2.amount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9px] text-[#6c3518]/40 font-poppins italic tracking-wide mt-0.5">
                    {order.lineItems.nodes.length} {order.lineItems.nodes.length === 1 ? 'Item' : 'Items'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full border border-[#6c3518]/10 flex items-center justify-center text-[#6c3518]/40 transition-all duration-300 ${isExpanded ? 'bg-[#6c3518] text-white' : 'group-hover:bg-[#6c3518]/5'}`}>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <div className="px-6 lg:px-8 pb-8 pt-2 border-t border-[#6c3518]/5 bg-[#f5f1e6]/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      
                      {/* Left Side: Items and Breakdown */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#6c3518]/60 uppercase">Items Ordered</h4>
                          <div className="space-y-4">
                            {order.lineItems.nodes.map((item: any, i: number) => (
                              <div key={i} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-[#6c3518]/5 flex-shrink-0">
                                  {item.variant?.image ? (
                                    <img src={item.variant.image.url} alt={item.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#6c3518]/10"><Package size={16} /></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#6c3518] font-poppins">{item.title}</p>
                                  <p className="text-[10px] text-gray-500 font-poppins italic">
                                    {item.variant?.title !== 'Default Title' ? item.variant?.title : 'Standard' } • Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-poppins text-[#6c3518]/60">
                                  {item.variant?.price?.amount ? `${item.variant.price.currencyCode} ${parseFloat(item.variant.price.amount).toLocaleString('en-IN')}` : ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="bg-white/50 p-6 rounded-xl border border-[#6c3518]/5 space-y-3">
                          <div className="flex justify-between text-xs font-poppins text-gray-500">
                            <span>Subtotal</span>
                            <span>{order.subtotalPriceV2?.currencyCode} {parseFloat(order.subtotalPriceV2?.amount || '0').toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-xs font-poppins text-gray-500">
                            <span>Shipping</span>
                            <span>{order.totalShippingPriceV2?.currencyCode} {parseFloat(order.totalShippingPriceV2?.amount || '0').toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-xs font-poppins text-gray-500">
                            <span>Tax</span>
                            <span>{order.totalTaxV2?.currencyCode} {parseFloat(order.totalTaxV2?.amount || '0').toLocaleString('en-IN')}</span>
                          </div>
                          <div className="h-[1px] bg-[#6c3518]/5 my-2"></div>
                          <div className="flex justify-between text-base font-poppins font-bold text-[#6c3518]">
                            <span>Total</span>
                            <span>{order.totalPriceV2.currencyCode} {parseFloat(order.totalPriceV2.amount).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Shipping and Authenticity Info */}
                      <div className="space-y-8">
                        {/* Shipping Address */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#6c3518]/60 uppercase">
                            <MapPin size={12} />
                            <span>Shipping Address</span>
                          </div>
                          <div className="bg-white/50 p-6 rounded-xl border border-[#6c3518]/5 font-poppins text-sm text-[#6c3518]/80 leading-relaxed shadow-sm">
                            {order.shippingAddress ? (
                              <>
                                <p>{order.shippingAddress.address1}</p>
                                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}</p>
                                <p className="uppercase tracking-widest text-[10px] text-[#6c3518]/50 mt-1 font-bold">{order.shippingAddress.country}</p>
                              </>
                            ) : (
                              <p className="italic text-gray-400">Digital Ritual / Address Unavailable</p>
                            )}
                          </div>
                        </div>

                        {/* Authenticity / Bill Section */}
                        {/* <div className="space-y-4">
                          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#6c3518]/60 uppercase">Documents & Support</h4>
                          <div className="flex flex-col gap-3">
                            {order.statusPageUrl && (
                              <a 
                                href={order.statusPageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full bg-[#6c3518] hover:bg-black text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-[#6c3518]/10 group/btn"
                              >
                                <div className="flex items-center gap-3">
                                  <ReceiptText size={18} />
                                  <span className="text-xs font-bold tracking-widest uppercase">View Official Invoice</span>
                                </div>
                                <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                              </a>
                            )}
                            <p className="text-[10px] text-gray-400 font-poppins text-center italic">
                              This is an authentic Shopify-generated bill and live tracking portal.
                            </p>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
