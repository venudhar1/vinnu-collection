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
    <div className="space-y-12">
      {/* Premium Horizontal Trust Banner */}
      <section className="bg-white border border-[#E6E0D5] py-3.5 px-4 rounded-xs flex flex-wrap justify-center items-center gap-4 md:gap-8 text-[9px] uppercase font-bold tracking-widest text-brand-gold shadow-xs">
        <span className="flex items-center gap-1">✓ Authentic Handloom Products</span>
        <span className="text-zinc-200 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">✓ Secured UPI Scan & Pay</span>
        <span className="text-zinc-200 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">✓ Free Insured Shipping</span>
        <span className="text-zinc-200 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">✓ WhatsApp Live Support</span>
      </section>

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
            <a 
              href="#saree-catalog"
              className="bg-brand-gold text-brand-charcoal px-6 py-3 rounded-xs font-bold text-xs uppercase tracking-widest hover:bg-yellow-600 transition-colors shadow-lg flex items-center gap-2"
            >
              Browse Catalogue
              <ArrowRight className="w-4 h-4" />
            </a>
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
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-charcoal uppercase tracking-wider">Instant WhatsApp Support</h4>
            <p className="text-brand-muted mt-1 leading-relaxed">Have a question about a weave or custom order? Connect directly with our team on WhatsApp for instant assistance.</p>
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
        <div className="bg-white border border-[#E6E0D5] p-6 rounded-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search color, material, collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs font-sans"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Fabric Filter */}
            <div className="flex items-center gap-2 border border-[#E6E0D5] rounded-xs px-3 py-1 bg-[#FAF7F2]">
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
            <div className="flex items-center gap-2 border border-[#E6E0D5] rounded-xs px-3 py-1 bg-[#FAF7F2]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                const primaryImage = imagesList.length > 0 ? imagesList[0] : null;
                const secondaryImage = imagesList.length > 1 ? imagesList[1] : primaryImage;

                return (
                  <div 
                    key={set.id}
                    className="bg-white border border-[#E6E0D5] hover:border-brand-gold/60 rounded-xs overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all group"
                  >
                    {/* Saree Card Photo container with Hover Swap and Zoom */}
                    <Link 
                      href={`/shop/product/${set.id}?variant=${activeItem.id}`}
                      className="block relative aspect-[3/4] bg-brand-cream overflow-hidden border-b border-[#E6E0D5] saree-card-image-container"
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
                        <span className="absolute top-4 left-4 bg-brand-ruby text-white font-sans text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm z-10">
                          {activeItem.status}
                        </span>
                      ) : (
                        discountPct > 0 && (
                          <span className="absolute top-4 left-4 bg-brand-gold text-white font-sans text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm z-10">
                            {discountPct}% OFF
                          </span>
                        )
                      )}
                    </Link>

                    {/* Saree Details Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-brand-gold block font-sans">
                          {materialName}
                        </span>
                        <Link 
                          href={`/shop/product/${set.id}?variant=${activeItem.id}`}
                          className="block font-serif text-lg text-zinc-800 hover:text-brand-gold transition-colors line-clamp-1"
                        >
                          {set.name}
                        </Link>
                      </div>

                      {/* Price display with discounts */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-brand-ruby font-sans">
                          ₹{activeItem.price.toLocaleString()}
                        </span>
                        {originalPrice && (
                          <span className="text-zinc-400 line-through text-xs font-sans">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                        )}
                        {discountPct > 0 && (
                          <span className="text-emerald-700 font-sans text-[10px] font-bold">
                            ({discountPct}% OFF)
                          </span>
                        )}
                      </div>

                      {/* Swatches selector */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block font-sans">
                          Available Colors:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item, idx) => (
                            <button
                              key={item.id}
                              onClick={() => handleSwatchClick(set.id, idx)}
                              className={`w-5 h-5 rounded-full border flex-shrink-0 transition-all ${
                                activeIdx === idx 
                                  ? "ring-2 ring-brand-gold border-white scale-110" 
                                  : "border-zinc-300 hover:scale-105"
                              }`}
                              style={{ backgroundColor: item.color.toLowerCase() }}
                              title={item.color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card CTA Actions */}
                    <div className="border-t border-[#E6E0D5] px-6 py-4 bg-[#FAF7F2] flex items-center justify-between gap-3">
                      <Link
                        href={`/shop/product/${set.id}?variant=${activeItem.id}`}
                        className="text-[10px] font-bold uppercase tracking-wider text-brand-muted hover:text-brand-charcoal transition-colors font-sans"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => addToCart(activeItem, set)}
                        disabled={activeItem.status !== "available" || activeItem.quantity <= 0}
                        className="bg-brand-charcoal text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xs shadow-md transition-colors"
                      >
                        {activeItem.status === "available" ? "Add to Bag" : "Out of Stock"}
                      </button>
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

      {/* Brand Story Banner */}
      <section className="bg-white border border-[#E6E0D5] p-12 rounded-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold block font-sans">Our Devotion</span>
          <h2 className="text-3xl font-serif text-brand-charcoal tracking-wide leading-tight">Preserving the Art of the Weaving Loom</h2>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
            Every saree we curate at Venu Collections is selected for its authenticity. We partner directly with weaving families in Banaras, Kanchipuram, and Sambalpur, bypassing intermediaries. This secures a fair wage for the artisans and ensures you receive a masterpiece of verified origin and outstanding quality.
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
