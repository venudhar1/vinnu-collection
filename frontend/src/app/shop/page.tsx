"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw } from "lucide-react";

interface SetItem {
  id: string;
  name: string;
  description?: string;
  total_items: number;
  total_available: number;
  total_sold: number;
}

export default function ShopHomePage() {
  const { data: sets, isLoading } = useQuery<SetItem[]>({
    queryKey: ["public_sets"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/public/sets");
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    },
  });

  return (
    <div className="space-y-16">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden bg-brand-charcoal text-white py-24 px-8 md:px-16 rounded-sm border border-brand-gold/30 shadow-md">
        {/* Decorative backdrop elements */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-brand-ruby/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-1 bg-brand-gold/10 border border-brand-gold/30 px-3 py-1 rounded-full text-xs text-brand-gold font-sans font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Seasonal Launch: Pure Weaves
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-white leading-tight">
            The Heritage <br />
            <span className="text-brand-gold italic">Silk & Zari</span> Collection
          </h1>
          
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans max-w-lg">
            Immerse yourself in sarees crafted by generational Indian artisans. Each weave represents weeks of meticulous handloom artistry, featuring authentic raw fabrics and heritage gold zari borders.
          </p>
          
          <div className="pt-4 flex flex-wrap gap-4">
            <Link 
              href="/shop/catalog"
              className="bg-brand-gold text-brand-charcoal px-6 py-3 rounded-xs font-bold text-xs uppercase tracking-widest hover:bg-yellow-600 transition-colors shadow-lg flex items-center gap-2"
            >
              Browse Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/shop/catalog"
              className="border border-white/30 text-white px-6 py-3 rounded-xs font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Our Heritage
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Verification Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-[#E6E0D5] py-8 font-sans text-xs">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-brand-cream border border-brand-gold/30 text-brand-gold rounded-full flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-charcoal uppercase tracking-wider">100% Authentic Handloom</h4>
            <p className="text-brand-muted mt-1 leading-relaxed">Certified authentic fibers and genuine metallic threads sourced directly from weaving clusters.</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-brand-cream border border-brand-gold/30 text-brand-gold rounded-full flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-charcoal uppercase tracking-wider">Insured Shipping</h4>
            <p className="text-brand-muted mt-1 leading-relaxed">Free secure transit insurance across India and trackable international delivery options.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="p-3 bg-brand-cream border border-brand-gold/30 text-brand-gold rounded-full flex-shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-charcoal uppercase tracking-wider">Hassle-Free Returns</h4>
            <p className="text-brand-muted mt-1 leading-relaxed">Shop with confidence. If the weave details do not match your standards, returns are accepted within 7 days.</p>
          </div>
        </div>
      </section>

      {/* Featured Collections Catalog */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif text-brand-charcoal tracking-wide">Featured Weave Collections</h2>
          <div className="w-20 h-0.5 bg-brand-gold mx-auto" />
          <p className="text-xs text-brand-muted font-sans font-medium">Explore unique saree clusters curated for festive celebrations and wedding ceremonies.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sets && sets.length > 0 ? (
              sets.map((set) => (
                <div 
                  key={set.id}
                  className="bg-white border border-[#E6E0D5] hover:border-brand-gold/60 rounded-xs overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="p-8 space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block font-sans">
                      {set.total_available} Weaves Available
                    </span>
                    <h3 className="text-xl font-serif text-brand-charcoal group-hover:text-brand-gold transition-colors">
                      {set.name}
                    </h3>
                    <p className="text-xs text-brand-muted leading-relaxed font-sans line-clamp-3">
                      {set.description || "Traditional Indian handloom saree weaves reflecting local heritage, high thread count, and exquisite border design."}
                    </p>
                  </div>
                  
                  <div className="bg-brand-cream px-8 py-4 border-t border-[#E6E0D5] flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wide text-brand-muted font-sans font-bold">
                      {set.total_items} Color Variants
                    </span>
                    <Link 
                      href={`/shop/catalog?set=${set.id}`}
                      className="text-xs font-bold text-brand-gold hover:text-yellow-600 flex items-center gap-1 uppercase tracking-wider font-sans"
                    >
                      View Sarees
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-brand-muted bg-white border border-[#E6E0D5]">
                <p className="text-sm font-semibold">Our catalogue is currently undergoing updates. Please check back shortly.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Brand Story Banner */}
      <section className="bg-white border border-[#E6E0D5] p-12 rounded-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold block font-sans">Our Devotion</span>
          <h2 className="text-3xl font-serif text-brand-charcoal tracking-wide leading-tight">Preserving the Art of the Weaving Loom</h2>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
            Every saree we curate at Vinnu Collection is selected for its authenticity. We partner directly with weaving families in Banaras, Kanchipuram, and Sambalpur, bypassing intermediaries. This secures a fair wage for the artisans and ensures you receive a masterpiece of verified origin and outstanding quality.
          </p>
          <div className="border-l-2 border-brand-gold pl-4 text-xs font-sans text-brand-charcoal font-medium italic">
            &quot;Saree drape is not just attire, it is the celebration of centuries of handloom culture and storytelling.&quot;
          </div>
        </div>
        <div className="h-64 sm:h-80 bg-brand-cream border border-[#E6E0D5] rounded-xs flex items-center justify-center p-6 text-center">
          <div className="space-y-3 max-w-sm">
            <Sparkles className="w-8 h-8 text-brand-gold mx-auto" />
            <h4 className="font-serif text-lg text-brand-charcoal">Handcrafted Heritage</h4>
            <p className="text-xs text-brand-muted leading-relaxed font-sans">
              From heavy silk wedding bridal sets to lightweight daily-wear cotton weaves, explore authentic Indian textiles.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
