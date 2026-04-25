import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Indevie Beauty',
  description: 'Read the terms of service that govern your use of Indevie Beauty website and services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-medium text-stone-900 tracking-tight">
            Terms of Service
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
              <p>
                Welcome to Indéviē. The terms &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to Indéviē, operated by InGoddess Pvt Ltd, an Indian company registered in Indore, Madhya Pradesh. These Terms of Service (&quot;Terms&quot;) govern your use of our website, online store, and all related services (collectively, the &quot;Services&quot;). Our store is powered by Shopify, which enables us to provide these Services to you.
              </p>
              <p>
                By accessing or using the Services, you agree to be bound by these Terms and by our Privacy Policy. If you do not agree, you may not use the Services.
              </p>
            </section>

            {/* 1. Eligibility & Account Access */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">1. Eligibility & Account Access</h2>
              <p>
                By agreeing to these Terms, you confirm that you are 18 years or older and legally capable of entering into a binding contract under Indian law.
              </p>
              <p>
                You may be required to provide accurate and complete information (such as email, address, and payment details) to use certain features. You are solely responsible for maintaining the confidentiality of your account and for all activity under your account.
              </p>
            </section>

            {/* 2. Our Products */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">2. Our Products</h2>
              <p>We make every effort to accurately display product details. However:</p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li>Colours and appearance may vary based on your device.</li>
                <li>Product descriptions, formulations, and prices may change without notice.</li>
                <li>We may discontinue or limit quantities of products at our discretion.</li>
                <li>We do not guarantee that any product will meet your expectations or that descriptions will be error-free.</li>
              </ul>
            </section>

            {/* 3. Orders & Acceptance */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">3. Orders & Acceptance</h2>
              <p>
                When you place an order, you are making an offer to purchase. An order is considered accepted only when we send you a confirmation email and successfully process your payment.
              </p>
              <p>
                We reserve the right to refuse, modify, or cancel any order for reasons including product availability, errors, or suspected fraud. If your order is cancelled, we will notify you via the contact details you provided.
              </p>
              <p>
                All purchases are subject to our <Link href="/refund-policy" className="text-[#6c3518] hover:underline">Refund & Return Policy</Link>. You represent that purchases are for personal use and not for resale.
              </p>
            </section>

            {/* 4. Pricing, Payments & Billing */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">4. Pricing, Payments & Billing</h2>
              <p>
                Prices are listed in Indian Rupees (INR) and may be changed without notice. Prices shown at checkout will be the final charges before shipping and taxes.
              </p>
              <p>
                You agree to provide current, accurate, and complete payment information. By submitting payment details, you confirm that:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li>You are authorised to use the selected payment method.</li>
                <li>All charges will be honoured by your bank or payment provider.</li>
                <li>You will pay all applicable amounts including GST, shipping, and any additional charges.</li>
              </ul>
              <p>
                We are not responsible for payment failures or transaction delays.
              </p>
            </section>

            {/* 5. Shipping, Delivery & Risk of Loss */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">5. Shipping, Delivery & Risk of Loss</h2>
              <p>
                Estimated shipping times are provided for convenience and are not guaranteed. Delivery delays may occur due to courier issues, strikes, weather conditions, or other factors outside our control.
              </p>
              <p>
                Once we hand over your order to the courier partner, risk of loss passes to you.
              </p>
            </section>

            {/* 6. Intellectual Property */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">6. Intellectual Property</h2>
              <p>
                All content available through the Services, including trademarks, text, images, videos, graphics, product descriptions, and layouts, is owned by Indéviē / InGoddess Pvt Ltd or our licensors.
              </p>
              <p>
                You may not copy, reproduce, modify, distribute, or exploit any part of the Services without prior written permission. All rights not expressly granted to you are reserved.
              </p>
            </section>

            {/* 7. Optional Third-Party Tools & Integrations */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">7. Optional Third-Party Tools & Integrations</h2>
              <p>
                The Services may provide access to third-party tools or applications. We do not control these tools and provide them &quot;as is&quot; without warranties. Your use of third-party tools is entirely at your own risk and subject to the respective provider&apos;s terms.
              </p>
              <p>
                Future features or tools added to the site also fall under these Terms.
              </p>
            </section>

            {/* 8. Third-Party Links */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">8. Third-Party Links</h2>
              <p>
                The Services may contain links to external websites. We do not endorse or take responsibility for third-party content, privacy practices, or transactions. Engaging with these sites is solely at your own risk.
              </p>
            </section>

            {/* 9. Relationship With Shopify */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">9. Relationship With Shopify</h2>
              <p>
                Our store is powered by Shopify. Purchases made on our website are transactions between you and Indéviē (InGoddess Pvt Ltd). Shopify is not responsible for product quality, safety, delivery, damages, or disputes arising from your purchase.
              </p>
              <p>
                You expressly release Shopify from any liability related to your transactions with us.
              </p>
            </section>

            {/* 10. Privacy Policy */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">10. Privacy Policy</h2>
              <p>
                Your information is processed in accordance with our <Link href="/privacy-policy" className="text-[#6c3518] hover:underline">Privacy Policy</Link> and Shopify&apos;s data policies. By using the Services, you consent to data collection, storage, and processing as described.
              </p>
              <p>
                Some data may be transferred to or stored in other countries for processing by Shopify or third-party partners.
              </p>
            </section>

            {/* 11. Feedback */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">11. Feedback</h2>
              <p>
                Any feedback, reviews, ideas, or suggestions (&quot;Feedback&quot;) submitted by you may be used by us without restrictions or compensation. You grant us a worldwide, royalty-free, perpetual licence to use, display, modify, and distribute such Feedback.
              </p>
              <p>
                You represent that your Feedback:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li>Is original and lawful</li>
                <li>Does not violate intellectual property rights</li>
                <li>Does not contain harmful, offensive, or misleading content</li>
              </ul>
              <p>
                We may remove Feedback that violates these Terms.
              </p>
            </section>

            {/* 12. Errors & Corrections */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">12. Errors & Corrections</h2>
              <p>
                Occasionally product descriptions, pricing, availability, or other site information may contain errors. We reserve the right to correct any inaccuracies or cancel orders based on inaccurate information.
              </p>
            </section>

            {/* 13. Prohibited Uses */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">13. Prohibited Uses</h2>
              <p>You may not use the Services for:</p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li>Unlawful, fraudulent, or harmful activities</li>
                <li>Harassment, abuse, or defamation</li>
                <li>Uploading viruses or malicious code</li>
                <li>Copying or scraping site content</li>
                <li>Circumventing security features</li>
                <li>Misrepresentation or impersonation</li>
                <li>Interference with the website&apos;s functionality</li>
              </ul>
              <p>
                Violation may result in account suspension or legal action.
              </p>
            </section>

            {/* 14. Termination */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">14. Termination</h2>
              <p>
                We may suspend or terminate your access to the Services at any time, without notice, for violation of these Terms or for any reason deemed necessary.
              </p>
              <p>
                Sections related to Intellectual Property, Feedback, Limitation of Liability, and Governing Law continue to apply after termination.
              </p>
            </section>

            {/* 15. Disclaimer of Warranties */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">15. Disclaimer of Warranties</h2>
              <p>
                Our Services and products are provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the extent permitted by Indian law, we disclaim all warranties, express or implied, including fitness for purpose, merchantability, and non-infringement.
              </p>
              <p>
                We do not guarantee uninterrupted, error-free service or accuracy of content.
              </p>
            </section>

            {/* 16. Limitation of Liability */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">16. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Indéviē / InGoddess Pvt Ltd shall not be liable for:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li>Loss of profits, revenue, data, or goodwill</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Delays, service interruptions, or errors</li>
                <li>Losses arising from third-party services or shipping partners</li>
                <li>Misuse of products not used as directed</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount you paid for the product in question.
              </p>
            </section>

            {/* 17. Indemnification */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">17. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Indéviē, Shopify, and associated personnel from claims, losses, damages, or expenses arising from:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-stone-400">
                <li>Your breach of these Terms</li>
                <li>Your misuse of the Services</li>
                <li>Your violation of Indian laws or third-party rights</li>
              </ul>
            </section>

            {/* 18. Severability */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">18. Severability</h2>
              <p>
                If any part of these Terms is found unenforceable, the remaining provisions remain valid and enforceable.
              </p>
            </section>

            {/* 19. Waiver & Entire Agreement */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">19. Waiver & Entire Agreement</h2>
              <p>
                Failure to enforce a right does not constitute a waiver of that right. These Terms constitute the entire agreement between you and Indéviē regarding the Services.
              </p>
            </section>

            {/* 20. Assignment */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">20. Assignment</h2>
              <p>
                You may not assign your rights under these Terms without our written consent. We may assign our rights without notice.
              </p>
            </section>

            {/* 21. Governing Law & Jurisdiction (India) */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">21. Governing Law & Jurisdiction (India)</h2>
              <p>
                These Terms shall be governed by and interpreted in accordance with the laws of India. All disputes shall be subject to the exclusive jurisdiction of the courts of Indore, Madhya Pradesh.
              </p>
            </section>

            {/* 22. Changes to Terms */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-medium text-stone-900 border-b border-stone-200 pb-2">22. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Updated versions will be posted on this page. Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* 23. Contact Information */}
            <section className="space-y-4 bg-stone-50 p-6 rounded-xl border border-stone-100 mt-10">
              <h2 className="text-xl font-medium text-stone-900 mb-2">23. Contact Information</h2>
              <p className="mb-4">Indéviē (InGoddess Pvt Ltd)</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-stone-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@indevie.com" className="text-[#6c3518] hover:underline font-medium break-all">
                    support@indevie.com
                  </a>
                </div>
                
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-stone-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <address className="not-italic text-stone-600">
                    Business Address: Indralok, Indore (452009)
                  </address>
                </div>

                <div className="flex flex-col gap-1 text-stone-600 text-sm mt-2 pt-3 border-t border-stone-200">
                  <p><strong>CIN:</strong> U47722MP2025PTC079860</p>
                  <p><strong>GST:</strong> 23AAICI5017L1ZK</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
