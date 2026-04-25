import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Indevie Beauty',
  description: 'Learn about our 7-day easy returns, refund process, and exchanges at Indevie Beauty.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-medium text-stone-900 tracking-tight">
            Refund & Return Policy
          </h1>
          {/* <p className="text-sm text-stone-500 uppercase tracking-widest">
            India Only
          </p> */}

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
                At Indéviē, we craft every bottle with intention, softness, and stories from our roots. But if something doesn&apos;t feel right, we&apos;re here to make the journey back just as comforting.
              </p>
            </section>

            {/* 7-Day Easy Returns */}
            <section className="space-y-4 pt-6">
              <h2 className="text-2xl font-medium text-stone-900 border-b border-stone-200 pb-2">7-Day Easy Returns</h2>
              <p>
                You have 7 days from the day your order arrives to request a return.
              </p>
              <p>
                To be eligible, the product must be unopened, unused, and in the same condition you received it, sealed with its original packaging intact. Think of it as a product that hasn&apos;t yet begun its ritual with you.
              </p>
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 my-4">
                <p className="font-medium text-stone-800 mb-1">To start a return:</p>
                <p>
                  Simply write to us at <a href="mailto:returns@indevie.com" className="text-[#6c3518] hover:underline font-medium">returns@indevie.com</a>.
                </p>
                <p className="text-sm text-stone-600 mt-2">
                  Our team will guide you gently through the process and share the return address along with clear instructions.
                </p>
              </div>
              <p className="text-sm text-red-800/80 bg-red-50 p-3 rounded-md inline-block">
                <strong>Please note:</strong> Items sent back without first requesting a return will not be accepted.
              </p>
            </section>

            {/* Damages & Transit Issues */}
            <section className="space-y-4 pt-6">
              <h2 className="text-2xl font-medium text-stone-900 border-b border-stone-200 pb-2">Damages & Transit Issues</h2>
              <p>
                If your product reaches you broken, leaking, or not quite what you ordered, please reach out to us immediately. We&apos;ll look into it with care and make things right, no stress, no friction.
              </p>
            </section>

            {/* Non-Returnable Items */}
            <section className="space-y-4 pt-6">
              <h2 className="text-2xl font-medium text-stone-900 border-b border-stone-200 pb-2">Non-Returnable Items</h2>
              <p>
                Because we craft personal care meant for delicate skin rituals, items cannot be returned once opened. We also do not accept returns on:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li><strong className="text-stone-800 font-medium">Opened or used products</strong></li>
                <li><strong className="text-stone-800 font-medium">Items purchased on sale</strong></li>
                <li><strong className="text-stone-800 font-medium">Gift cards</strong></li>
              </ul>
              <p className="italic text-stone-500 mt-4">
                If you&apos;re unsure about your specific case, just write to us, we&apos;re happy to help.
              </p>
            </section>

            {/* Exchanges */}
            <section className="space-y-4 pt-6">
              <h2 className="text-2xl font-medium text-stone-900 border-b border-stone-200 pb-2">Exchanges</h2>
              <p>
                If you&apos;d like something else instead, simply request a return for the unopened item. Once accepted, you may place a fresh order for the product you want. Simple and seamless.
              </p>
            </section>

            {/* Refunds */}
            <section className="space-y-4 pt-6">
              <h2 className="text-2xl font-medium text-stone-900 border-b border-stone-200 pb-2">Refunds</h2>
              <p>
                Once we receive your return and inspect the product, we&apos;ll let you know if the refund is approved.
              </p>
              <p>
                Approved refunds are processed to your original payment method within <strong>5–7 business days</strong>.
              </p>
              <p className="text-sm text-stone-500">
                Your bank or payment provider may take a little extra time to reflect the credit, thank you for your patience as it travels back to you.
              </p>
              <div className="mt-6 pt-6 border-t border-stone-100">
                <p>
                  If more than 15 business days have passed since approval, please write to us at <a href="mailto:escalations@indevie.com" className="text-[#6c3518] hover:underline font-medium">escalations@indevie.com</a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
