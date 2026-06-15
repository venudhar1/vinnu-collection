"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Eye, Lock, RefreshCw } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 font-sans text-xs text-brand-charcoal/90 leading-relaxed space-y-8">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-charcoal transition-colors font-bold uppercase tracking-wider text-[10px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Boutique
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#E6E0D5] pb-6 space-y-2">
        <h1 className="text-4xl font-serif text-brand-charcoal tracking-wide">Privacy Policy</h1>
        <p className="text-brand-muted text-sm font-medium">Last updated: June 15, 2026</p>
      </div>

      {/* Intro assurances card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-sm p-5 flex gap-4 items-start shadow-xs">
        <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h3 className="font-serif text-sm font-bold text-emerald-800">Your Trust & Privacy are Safe with Us</h3>
          <p className="text-emerald-700 text-[11px] leading-relaxed">
            At Venu Collections, we celebrate authentic Indian weaving heritage and strictly respect your personal details. We do not sell, rent, or trade your contact or address information. Your financial payments are made directly inside secure UPI apps.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-6 text-justify">
        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-gold" />
            1. Information We Collect
          </h2>
          <p>
            When you purchase from our boutique, we collect the necessary coordinates to fulfill your order and safely ship your sarees. This includes:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li><strong>Personal Contact:</strong> Full Name, Email Address, and Phone Number.</li>
            <li><strong>Shipping Coordinates:</strong> Street Address, City, State, and Pincode.</li>
            <li><strong>Payment Metadata:</strong> Optional UPI transaction references or payer names submitted to verify your purchase.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-gold" />
            2. Payment Security & UPI Scanning
          </h2>
          <p>
            We prioritize secure transaction protocols:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li><strong>Zero Financial Data Storage:</strong> No credit card numbers, CVVs, net banking credentials, or bank passwords are ever processed or stored on our servers.</li>
            <li><strong>UPI QR Code Payments:</strong> Our checkout operates strictly via direct UPI Scan & Pay. When you scan our QR code, the transaction takes place completely inside your trusted UPI app (GPay, PhonePe, Paytm, BHIM, or your bank app) under standard banking encryption.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-brand-gold" />
            3. How We Use Your Information
          </h2>
          <p>
            Your information is exclusively utilized to process, authenticate, and safely ship your orders. We use these details to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li>Generate shipping tags and verify delivery routing details.</li>
            <li>Confirm manual UPI payment receipt against incoming receiver banking ledger reports.</li>
            <li>Send email confirmations regarding order placement and shipment notifications.</li>
            <li>Respond to customer support requests or fabric care queries.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            4. Third-Party Sharing
          </h2>
          <p>
            We only share your information with trusted partners required to complete your checkout and delivery:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li><strong>Logistics Partners:</strong> Sharing your name, delivery address, and phone number with insured shipping agencies to transit and deliver your handcrafted sarees.</li>
            <li><strong>Legal Obligations:</strong> We may disclose information only if required by law to comply with tax audit trails, regulatory guidelines, or official judicial proceedings.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            5. Contact Support & Queries
          </h2>
          <p>
            If you have questions about our privacy guidelines or would like to request removal of your client coordinates from our record ledgers, please contact us:
          </p>
          <div className="bg-brand-cream border border-[#E6E0D5] p-4 rounded-xs text-xs font-serif text-brand-charcoal space-y-1.5">
            <p><strong>Venu Collections Boutique Support</strong></p>
            <p className="font-sans text-[11px] text-brand-muted font-medium">Email: privacy@venucollections.com</p>
            <p className="font-sans text-[11px] text-brand-muted font-medium">WhatsApp: +91 9963988633</p>
          </div>
        </section>
      </div>
    </div>
  );
}
