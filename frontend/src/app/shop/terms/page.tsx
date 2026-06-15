"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, AlertCircle, HelpCircle, Info } from "lucide-react";

export default function TermsOfServicePage() {
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
        <h1 className="text-4xl font-serif text-brand-charcoal tracking-wide">Terms of Service</h1>
        <p className="text-brand-muted text-sm font-medium">Last updated: June 15, 2026</p>
      </div>

      {/* Handloom Authenticity Disclaimer banner */}
      <div className="bg-brand-cream border border-[#E6E0D5] rounded-sm p-5 flex gap-4 items-start shadow-xs text-brand-charcoal">
        <Info className="w-6 h-6 text-brand-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h3 className="font-serif text-sm font-bold">Important Notice on Handcrafted Weaves</h3>
          <p className="text-brand-muted text-[11px] leading-relaxed font-medium">
            Every saree in Venu Collections is handcrafted by master artisans. Minor irregularities in the weave patterns, slight floats, or small color variations are natural characteristics of genuine handloom processes, representing authentic craftsmanship and uniqueness, not defects.
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="space-y-6 text-justify">
        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-gold" />
            1. Ordering & UPI Payments
          </h2>
          <p>
            By placing an order on Venu Collections, you agree to comply with our manual payment flow:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li><strong>Scan and Pay:</strong> Payments must be made via scanning our official Kotak Bank QR code using any UPI app.</li>
            <li><strong>Manual Reconciliation:</strong> Because P2P bank transfers do not trigger automated website reconciliation, orders are marked as `"pending"` immediately upon submission. Our staff will manually verify your payment within 1-2 hours and update your order to `"paid"` status.</li>
            <li><strong>Optional Reference:</strong> You are encouraged to provide your UPI payer name or UTR details during checkout to accelerate verification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-gold" />
            2. Final Sale & No Returns Policy
          </h2>
          <p>
            Due to the delicate nature of handloom textiles, authentic zari threads, and artisanal weaves, all products sold on Venu Collections are considered <strong>Final Sale</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li><strong>No Returns or Exchanges:</strong> Once a saree is dispatched, we cannot accept return or exchange requests, as these delicate fabrics lose their structural and design value once unfolded or refolded outside of professional settings.</li>
            <li><strong>Damages in Transit:</strong> In the rare event that an item is damaged during transit, you must report the issue along with package opening video proof to our customer care team within 24 hours of delivery signature.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-gold" />
            3. Delivery & Transit coordinates
          </h2>
          <p>
            Shipping accuracy is critical to prevent lost orders:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li><strong>Mandatory Coordinates:</strong> Accurate customer phone numbers and street addresses are strictly required during checkout. We cannot process or dispatch shipments lacking valid contact phone numbers.</li>
            <li><strong>Insured Transit:</strong> All packages are sent via transit-insured logistics networks across India. In case of courier damage, claims must be reported to our customer care team within 24 hours of signature receipt.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            4. Fabric Care Recommendations
          </h2>
          <p>
            Due to the delicate natural fibers, dyes, and metallic zari threads used in heritage weaving:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-brand-muted font-medium">
            <li><strong>Dry Clean Only:</strong> All silk, Banarasi, and metallic thread zari sarees must be dry cleaned exclusively.</li>
            <li><strong>Storage Guidelines:</strong> Store sarees wrapped in clean, dry muslin cloth and periodically change folding patterns to preserve fiber strength.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg text-brand-charcoal border-b border-[#FAF7F2] pb-1.5 flex items-center gap-2">
            5. Intellectual Property
          </h2>
          <p>
            All custom graphics, product weave photos, collection set names, and branding designs displayed on this portal are the intellectual property of Venu Collections. Unauthorized copying, hotlinking, or distribution of these assets is strictly prohibited.
          </p>
        </section>
      </div>
    </div>
  );
}
