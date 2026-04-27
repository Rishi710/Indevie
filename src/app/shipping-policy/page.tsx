import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | Indevie Beauty',
  description: 'Learn about Indevie Beauty\'s shipping timelines, order processing, tracking, and delivery policies.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] pt-40 pb-12 md:pt-40 md:pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-medium text-stone-900 tracking-tight">
            Shipping Policy
          </h1>
          <p className="text-sm text-stone-500 uppercase tracking-widest">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 md:p-12">
          <div className="prose prose-stone max-w-none space-y-5 text-stone-700 leading-tight">
            
            {/* Introduction */}
            <section className="space-y-4">
              <p className="text-lg text-stone-800 italic">
                At Indéviē, we prepare every order with intention and care, packed softly, shipped swiftly, and sent from our studio to your doorstep like a small ritual of comfort.
              </p>
            </section>

            {/* 1. Order Processing Time */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">1. Order Processing Time</h2>
              <p>
                We dispatch all orders within <strong>1–2 business days</strong> (Monday to Saturday), excluding public holidays.
              </p>
              <p className="text-stone-600">
                During festivals, sales, or new launches, processing time may be slightly longer, but we&apos;ll always try to keep you informed.
              </p>
            </section>

            {/* 2. Shipping Timelines */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">2. Shipping Timelines</h2>
              <p>Once shipped, your order typically arrives within:</p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li><strong className="text-stone-800 font-medium">Metro cities:</strong> 3–5 business days</li>
                <li><strong className="text-stone-800 font-medium">Tier 2 & Tier 3 cities:</strong> 4–7 business days</li>
                <li><strong className="text-stone-800 font-medium">Remote/Interior areas:</strong> 6–10 business days</li>
              </ul>
              <p className="text-sm italic text-stone-500">
                Please note these are estimated timelines provided by our courier partners and may vary due to weather, operational delays, or unforeseen logistics issues.
              </p>
            </section>

            {/* 3. Shipping Charges */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">3. Shipping Charges</h2>
              <p className="text-lg text-[#6c3518] font-medium bg-[#faf9f6] inline-block px-4 py-2 rounded-lg">
                Free Shipping on orders across India.
              </p>
            </section>

            {/* 4. Order Tracking */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">4. Order Tracking</h2>
              <p>
                Once your order is dispatched, you&apos;ll receive a tracking link via email/SMS/WhatsApp so you can follow your package as it travels to you.
              </p>
              <p className="text-stone-600">
                If tracking is delayed in updating, don&apos;t worry, it usually syncs within 24 hours.
              </p>
            </section>

            {/* 5. Delivery Attempts */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">5. Delivery Attempts</h2>
              <p>
                Our courier partner will make two delivery attempts.
              </p>
              <p className="text-stone-600">
                If the order is undeliverable due to an incorrect address, unreachable phone number, or refusal to accept, it will be returned to us. Reshipping charges may apply.
              </p>
            </section>

            {/* 6. Incorrect Address or Contact Details */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">6. Incorrect Address or Contact Details</h2>
              <p>
                Please double-check your address and phone number at checkout.
              </p>
              <p>
                If you need to correct details after placing an order, write to us immediately at <a href="mailto:support@indevie.com" className="text-[#6c3518] hover:underline font-medium">support@indevie.com</a>. Once shipped, address changes may not be possible.
              </p>
            </section>

            {/* 7. Damaged, Leaking, or Incorrect Orders */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">7. Damaged, Leaking, or Incorrect Orders</h2>
              <p>
                If your parcel arrives damaged, leaking, or with incorrect items, please reach out within 48 hours of delivery with:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li><strong className="text-stone-800 font-medium">Order ID</strong></li>
                <li><strong className="text-stone-800 font-medium">Photos of the parcel + product</strong></li>
                <li><strong className="text-stone-800 font-medium">A short description of the issue</strong></li>
              </ul>
              <p className="text-stone-800 font-medium">
                We&apos;ll make it right with a replacement or refund as per our policy.
              </p>
            </section>

            {/* 8. Out-of-Stock Items */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">8. Out-of-Stock Items</h2>
              <p>
                If an item becomes unavailable after your order is placed, we will contact you with the option to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li>Replace with another product</li>
                <li>Issue a full refund</li>
                <li>Hold the order until the item restocks (if applicable)</li>
              </ul>
            </section>

            {/* 9. Shipping Restrictions */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">9. Shipping Restrictions</h2>
              <p>
                We currently ship within India only. International shipping will be introduced soon, stay tuned.
              </p>
            </section>

            {/* 10. Contact Us */}
            <section className="space-y-4 bg-stone-50 p-6 rounded-xl border border-stone-100 mt-10">
              <h2 className="text-xl font-medium text-stone-900 mb-2">10. Contact Us</h2>
              <p className="mb-4">
                For any shipping-related questions, we&apos;re always here to help:
              </p>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-stone-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@indevie.com" className="text-[#6c3518] hover:underline font-medium break-all">
                  support@indevie.com
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
