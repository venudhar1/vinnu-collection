"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, Sparkles, Shield, Truck, MessageCircle, 
  Search, SlidersHorizontal, ArrowUpDown, AlertCircle, ShoppingBag
} from "lucide-react";
import { useCart } from "../context/CartContext";

interface Item {
  id: string;
  set_id: string;
  color: string;
  sku: string;
  quantity: number;
  price: number;
  status: string;
  item_metadata?: string;
}

interface SetItem {
  id: string;
  name: string;
  description?: string;
  total_items: number;
  total_available: number;
  total_sold: number;
}

interface SareeProduct {
  set: SetItem;
  items: Item[];
}

export default function ShopHomePage() {
  const { addToCart } = useCart();

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedFabric, setSelectedFabric] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price-asc");

  // Keep track of active variant index per Saree Set ID
  const [activeItemIndexes, setActiveItemIndexes] = useState<Record<string, number>>({});

  // Query 1: Fetch Sets (Collections)
  const { data: sets, isLoading: isSetsLoading } = useQuery<SetItem[]>({
    queryKey: ["public_sets"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/public/sets`);
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    },
  });

  // Query 2: Fetch All Items across sets
  const { data: allItems, isLoading: isItemsLoading } = useQuery<Item[]>({
    queryKey: ["public_all_items", sets],
    queryFn: async () => {
      if (!sets) return [];
      const promises = sets.map(async (set) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/public/sets/${set.id}/items`);
        if (!res.ok) return [];
        return res.json();
      });
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: !!sets && sets.length > 0,
  });

  const isLoading = isSetsLoading || isItemsLoading;

  // Process and combine Sets and Items into structured product listing
  const getProductsList = (): SareeProduct[] => {
    if (!sets || !allItems) return [];
    
    return sets.map((set) => {
      const setVariants = allItems.filter((item) => item.set_id === set.id);
      return {
        set,
        items: setVariants,
      };
    }).filter(p => p.items.length > 0); // Only display sets that have color variants
  };

  const products = getProductsList();

  // Apply filters
  const filteredProducts = products.filter((prod) => {
    // Search filter
    const matchesSearch = 
      prod.set.name.toLowerCase().includes(search.toLowerCase()) || 
      (prod.set.description && prod.set.description.toLowerCase().includes(search.toLowerCase())) ||
      prod.items.some(i => i.sku.toLowerCase().includes(search.toLowerCase()) || i.color.toLowerCase().includes(search.toLowerCase()));

    // Fabric/Material filter
    let matchesFabric = true;
    if (selectedFabric !== "all") {
      matchesFabric = prod.items.some((item) => {
        if (!item.item_metadata) return false;
        try {
          const meta = JSON.parse(item.item_metadata);
          return meta.material?.toLowerCase().includes(selectedFabric.toLowerCase());
        } catch {
          return false;
        }
      });
    }

    return matchesSearch && matchesFabric;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const activeIdxA = activeItemIndexes[a.set.id] !== undefined ? activeItemIndexes[a.set.id] : 0;
    const activeIdxB = activeItemIndexes[b.set.id] !== undefined ? activeItemIndexes[b.set.id] : 0;
    
    const itemA = a.items[activeIdxA < a.items.length ? activeIdxA : 0];
    const itemB = b.items[activeIdxB < b.items.length ? activeIdxB : 0];
    if (!itemA || !itemB) return 0;

    if (sortBy === "price-asc") {
      return itemA.price - itemB.price;
    } else if (sortBy === "price-desc") {
      return itemB.price - itemA.price;
    } else if (sortBy === "name-asc") {
      return a.set.name.localeCompare(b.set.name);
    }
    return 0;
  });

  const handleSwatchClick = (setId: string, idx: number) => {
    setActiveItemIndexes((prev) => ({
      ...prev,
      [setId]: idx,
    }));
  };

  return (
    <div className="space-y-10">
      {/* Premium Horizontal Trust Banner */}
      <section className="bg-white border border-[#E6E0D5] py-3.5 px-4 rounded-md flex flex-wrap justify-center items-center gap-4 md:gap-8 text-[9px] uppercase font-bold tracking-widest text-brand-gold shadow-xs">
        <span className="flex items-center gap-1">✓ Authentic Handloom Products</span>
        <span className="text-zinc-200 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">✓ Secured UPI Scan & Pay</span>
        <span className="text-zinc-200 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">✓ Free Insured Shipping</span>
        <span className="text-zinc-200 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">✓ WhatsApp Live Support</span>
      </section>

      {/* Editorial Hero Section */}
      <section className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-12 pt-6 pb-12 md:pt-10 md:pb-16">
        {/* Text Content */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-4 pr-0 md:pr-6">
          <div className="flex items-center gap-1.5 text-brand-gold font-sans font-bold uppercase tracking-widest text-[9px]">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            Seasonal Launch: Pure Weaves
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-brand-charcoal leading-tight">
            The Heritage <br />
            <span className="text-brand-gold italic font-normal">Silk & Zari</span> Collection
          </h1>
          
          <p className="text-xs text-brand-muted leading-relaxed font-sans max-w-md">
            Immerse yourself in sarees crafted by generational Indian artisans. Each weave represents weeks of meticulous handloom artistry, featuring authentic raw fabrics and heritage gold zari borders.
          </p>
          
          <div className="pt-2">
            <a 
              href="#saree-catalog"
              className="text-brand-gold hover:text-yellow-600 transition-colors uppercase tracking-widest text-[10px] font-bold inline-flex items-center gap-1.5 border-b border-brand-gold/40 pb-0.5"
            >
              Browse Catalogue
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="md:col-span-7 aspect-[3/4] max-h-[580px] relative overflow-hidden rounded-lg border border-[#E6E0D5]">
          <img 
            src="/images/hero_saree.png" 
            alt="Premium Silk Saree Showcase"
            className="w-full h-full object-cover object-top transform hover:scale-105 transition-transform duration-700"
          />
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
            <p className="text-brand-muted mt-1 leading-relaxed">Certified fibers and genuine gold/silver metallic threads sourced directly from weavers.</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-brand-cream border border-brand-gold/30 text-brand-gold rounded-full flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-charcoal uppercase tracking-wider">Insured Shipping</h4>
            <p className="text-brand-muted mt-1 leading-relaxed">Free secure transit insurance across India with reliable tracking.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="p-3 bg-brand-cream border border-brand-gold/30 text-brand-gold rounded-full flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-charcoal uppercase tracking-wider">Instant WhatsApp Support</h4>
            <p className="text-brand-muted mt-1 leading-relaxed">Chat directly with our team for styling advice or custom order assistance.</p>
          </div>
        </div>
      </section>

      {/* Main Saree Showcase Grid */}
      <section id="saree-catalog" className="space-y-8 scroll-mt-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif text-brand-charcoal tracking-wide">Featured Weaves</h2>
          <div className="w-20 h-0.5 bg-brand-gold mx-auto" />
          <p className="text-xs text-brand-muted font-sans font-medium">Explore unique saree clusters curated for festive celebrations and wedding ceremonies.</p>
        </div>

        {/* Toolbar / Filters Panel */}
        <div className="bg-white border border-[#E6E0D5] p-6 rounded-lg flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 shadow-xs">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search color, material, collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E6E0D5] rounded-md focus:outline-hidden focus:border-brand-gold text-xs font-sans"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Fabric Filter */}
            <div className="flex items-center gap-2 border border-[#E6E0D5] rounded-md px-3 py-1 bg-[#FAF7F2]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-muted" />
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="bg-transparent focus:outline-hidden text-brand-charcoal py-1 font-bold uppercase tracking-wider text-[11px] font-sans"
              >
                <option value="all">All Fabrics</option>
                <option value="silk">Pure Silk</option>
                <option value="organza">Organza</option>
                <option value="banarasi">Banarasi</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2 border border-[#E6E0D5] rounded-md px-3 py-1 bg-[#FAF7F2]">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-hidden text-brand-charcoal py-1 font-bold uppercase tracking-wider text-[11px] font-sans"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {sortedProducts.length > 0 ? (
              sortedProducts.map(({ set, items }) => {
                const activeIdx = activeItemIndexes[set.id] !== undefined ? activeItemIndexes[set.id] : 0;
                const activeItem = items[activeIdx < items.length ? activeIdx : 0];
                if (!activeItem) return null;

                // Parse metadata
                let materialName = "Pure Handloom Silk";
                let imagesList: string[] = [];
                let originalPrice: number | null = null;

                if (activeItem.item_metadata) {
                  try {
                    const meta = JSON.parse(activeItem.item_metadata);
                    materialName = meta.material || "Pure Handloom Silk";
                    if (meta.images && Array.isArray(meta.images)) {
                      imagesList = meta.images;
                    }
                    if (meta.original_price) {
                      originalPrice = Number(meta.original_price);
                    }
                  } catch {}
                }

                // If original price is not present, calculate a mock one (35% markup)
                if (!originalPrice) {
                  originalPrice = Math.round(activeItem.price * 1.35);
                }

                const discountPct = Math.round(((originalPrice - activeItem.price) / originalPrice) * 100);
                const primaryImage = imagesList.length > 0 ? imagesList[0] : undefined;
                const secondaryImage = imagesList.length > 1 ? imagesList[1] : primaryImage;

                return (
                  <div 
                    key={set.id}
                    className="flex flex-col justify-between group"
                  >
                    <Link 
                      href={`/shop/product/${set.id}?variant=${activeItem.id}`}
                      className="block relative aspect-[3/4] bg-brand-cream overflow-hidden border border-[#E6E0D5] rounded-lg saree-card-image-container"
                    >
                      {primaryImage ? (
                        <>
                          <img 
                            src={primaryImage} 
                            alt={`${set.name} - ${activeItem.color}`}
                            className="w-full h-full object-cover saree-card-primary-image"
                          />
                          <img 
                            src={secondaryImage} 
                            alt={`${set.name} details - ${activeItem.color}`}
                            className="saree-card-secondary-image"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <span className="font-serif text-lg text-brand-gold uppercase tracking-widest">{set.name}</span>
                          <div className="w-12 h-12 rounded-full border border-white mt-4 shadow-sm" style={{ backgroundColor: activeItem.color.toLowerCase() }} />
                          <span className="text-[10px] text-brand-muted font-sans mt-2">Shade: {activeItem.color}</span>
                        </div>
                      )}

                      {/* Stock Status Badge */}
                      {activeItem.status !== "available" ? (
                        <span className="absolute top-3 left-3 bg-brand-ruby text-white font-sans text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs shadow-xs z-10">
                          {activeItem.status}
                        </span>
                      ) : (
                        discountPct > 0 && (
                          <span className="absolute top-3 left-3 bg-brand-gold text-white font-sans text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs shadow-xs z-10">
                            {discountPct}% OFF
                          </span>
                        )
                      )}
                    </Link>

                    {/* Saree Details Content */}
                    <div className="pt-4 pb-2 space-y-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-brand-gold block font-sans">
                          {materialName}
                        </span>
                        <Link 
                          href={`/shop/product/${set.id}?variant=${activeItem.id}`}
                          className="block font-serif text-base text-zinc-800 hover:text-brand-gold transition-colors line-clamp-1 font-medium"
                        >
                          {set.name}
                        </Link>
                      </div>

                      {/* Price display with discounts */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-ruby font-sans">
                          ₹{activeItem.price.toLocaleString()}
                        </span>
                        {originalPrice && (
                          <span className="text-zinc-400 line-through text-[11px] font-sans">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                        )}
                        {discountPct > 0 && (
                          <span className="text-emerald-700 font-sans text-[9px] font-bold">
                            ({discountPct}% OFF)
                          </span>
                        )}
                      </div>

                      {/* Swatches & CTA */}
                      <div className="flex items-center justify-between gap-4 pt-1">
                        {/* Swatches */}
                        <div className="flex items-center gap-1.5">
                          {items.map((item, idx) => (
                            <button
                              key={item.id}
                              onClick={() => handleSwatchClick(set.id, idx)}
                              className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all ${
                                activeIdx === idx 
                                  ? "ring-1.5 ring-brand-gold border-white scale-110" 
                                  : "border-zinc-300 hover:scale-105"
                              }`}
                              style={{ backgroundColor: item.color.toLowerCase() }}
                              title={item.color}
                            />
                          ))}
                        </div>

                        {/* Direct Add to Cart Button */}
                        <button
                          onClick={() => addToCart(activeItem, set)}
                          disabled={activeItem.status !== "available" || activeItem.quantity <= 0}
                          className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal hover:text-brand-gold disabled:text-zinc-300 transition-colors cursor-pointer border-b border-brand-charcoal/20 hover:border-brand-gold/40 pb-0.5"
                        >
                          {activeItem.status === "available" ? "Add to Bag" : "Sold Out"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white border border-[#E6E0D5] p-12 text-center space-y-3 rounded-xs">
                <AlertCircle className="w-12 h-12 text-brand-gold/30 mx-auto" />
                <h4 className="font-serif text-lg text-brand-charcoal">No Weaves Match Selection</h4>
                <p className="text-brand-muted text-xs font-sans max-w-sm mx-auto">We couldn't find any sarees matching your search criteria. Try modifying your filters.</p>
                <button 
                  onClick={() => { setSearch(""); setSelectedFabric("all"); }}
                  className="mt-2 text-xs font-bold text-brand-gold hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Brand Story Section */}
      <section className="bg-white/45 border border-[#E6E0D5]/50 p-6 md:p-10 rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold block font-sans">Our Devotion</span>
          <h2 className="text-3xl font-serif text-brand-charcoal tracking-wide leading-tight">Preserving the Weaving Loom Art</h2>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
            We partner directly with weaving families, bypassing intermediaries. This secures fair wages for the artisans and ensures you receive a handloom masterpiece of verified origin and outstanding quality.
          </p>
          <div className="border-l-2 border-brand-gold pl-4 text-xs font-sans text-brand-charcoal font-medium italic">
            &quot;Saree drape is a celebration of handloom culture and storytelling.&quot;
          </div>
        </div>
        <div className="h-64 sm:h-80 relative overflow-hidden rounded-lg border border-[#E6E0D5]">
          <img 
            src="/images/banarasi_wine_1.png" 
            alt="Handcrafted Banarasi Saree Weave"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
        </div>
      </section>
    </div>
  );
}
