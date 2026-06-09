"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, AlertCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";

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
  activeItemIdx: number;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialSetId = searchParams.get("set");
  const { addToCart } = useCart();

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedSetId, setSelectedSetId] = useState<string>(initialSetId || "all");
  const [selectedFabric, setSelectedFabric] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price-asc");

  // Keep track of active variant index per Saree Set ID
  const [activeItemIndexes, setActiveItemIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initialSetId) {
      setSelectedSetId(initialSetId);
    }
  }, [initialSetId]);

  // Query 1: Fetch Sets
  const { data: sets, isLoading: isSetsLoading } = useQuery<SetItem[]>({
    queryKey: ["public_sets"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/public/sets`);
      if (!res.ok) throw new Error("Failed to fetch sets");
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
      const activeIdx = activeItemIndexes[set.id] !== undefined ? activeItemIndexes[set.id] : 0;
      return {
        set,
        items: setVariants,
        activeItemIdx: activeIdx < setVariants.length ? activeIdx : 0,
      };
    }).filter(p => p.items.length > 0); // Only display sets that have color variants
  };

  const products = getProductsList();

  // Apply filters
  const filteredProducts = products.filter((prod) => {
    // Search filter
    const matchesSearch = 
      prod.set.name.toLowerCase().includes(search.toLowerCase()) || 
      prod.set.description?.toLowerCase().includes(search.toLowerCase()) ||
      prod.items.some(i => i.sku.toLowerCase().includes(search.toLowerCase()) || i.color.toLowerCase().includes(search.toLowerCase()));

    // Set filter
    const matchesSet = selectedSetId === "all" || prod.set.id === selectedSetId;

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

    return matchesSearch && matchesSet && matchesFabric;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const itemA = a.items[a.activeItemIdx];
    const itemB = b.items[b.activeItemIdx];
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
    <div className="space-y-8 font-sans text-xs">
      {/* Title */}
      <div className="border-b border-[#E6E0D5] pb-4">
        <h2 className="text-2xl font-serif text-brand-charcoal tracking-wide">Browse Our Sarees</h2>
        <p className="text-brand-muted mt-1 leading-relaxed">Discover exquisite handloom pieces sorted by color, weave style, and material.</p>
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
          {/* Collection Filter */}
          <div className="flex items-center gap-2 border border-[#E6E0D5] rounded-xs px-3 py-1 bg-[#FAF7F2]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              className="bg-transparent focus:outline-hidden text-brand-charcoal py-1 font-bold uppercase tracking-wider"
            >
              <option value="all">All Collections</option>
              {sets?.map((set) => (
                <option key={set.id} value={set.id}>{set.name}</option>
              ))}
            </select>
          </div>

          {/* Fabric Filter */}
          <div className="flex items-center gap-2 border border-[#E6E0D5] rounded-xs px-3 py-1 bg-[#FAF7F2]">
            <Sparkles className="w-3.5 h-3.5 text-brand-muted animate-swatch-pulse" />
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="bg-transparent focus:outline-hidden text-brand-charcoal py-1 font-bold uppercase tracking-wider"
            >
              <option value="all">All Fabrics</option>
              <option value="silk">Pure Silk</option>
              <option value="cotton">Cotton / Linen</option>
              <option value="zari">Zari Embroidery</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 border border-[#E6E0D5] rounded-xs px-3 py-1 bg-[#FAF7F2]">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-hidden text-brand-charcoal py-1 font-bold uppercase tracking-wider"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted">Fetching our saree loom...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.length > 0 ? (
            sortedProducts.map(({ set, items, activeItemIdx }) => {
              const activeItem = items[activeItemIdx];
              if (!activeItem) return null;

              // Parse images
              let imagesList: string[] = [];
              let materialName = "Pure Silk";
              if (activeItem.item_metadata) {
                try {
                  const meta = JSON.parse(activeItem.item_metadata);
                  materialName = meta.material || "Pure Silk";
                  if (meta.images && Array.isArray(meta.images)) {
                    imagesList = meta.images;
                  }
                } catch {}
              }

              const hasImage = imagesList.length > 0;

              return (
                <div 
                  key={set.id}
                  className="bg-white border border-[#E6E0D5] rounded-xs shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group overflow-hidden"
                >
                  {/* Saree Card Photo / Placeholder Container */}
                  <Link href={`/shop/product/${set.id}?variant=${activeItem.id}`} className="block relative h-80 bg-brand-cream overflow-hidden border-b border-[#E6E0D5]">
                    {hasImage ? (
                      <img 
                        src={imagesList[0]} 
                        alt={`${set.name} - ${activeItem.color}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <span className="font-serif text-lg text-brand-gold uppercase tracking-widest">{set.name}</span>
                        <div className="w-12 h-12 rounded-full border border-white mt-4 shadow-sm" style={{ backgroundColor: activeItem.color.toLowerCase() }} />
                        <span className="text-[10px] text-brand-muted font-sans mt-2">Shade: {activeItem.color}</span>
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    {activeItem.status !== "available" && (
                      <span className="absolute top-4 left-4 bg-brand-ruby text-white font-sans text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
                        {activeItem.status}
                      </span>
                    )}
                  </Link>

                  {/* Saree Card Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Link href={`/shop/product/${set.id}?variant=${activeItem.id}`} className="block font-serif text-base text-zinc-800 hover:text-brand-gold transition-colors truncate max-w-[150px]">
                          {set.name}
                        </Link>
                        <span className="text-[10px] text-brand-muted font-sans">{materialName}</span>
                      </div>
                      <span className="font-bold text-sm text-brand-charcoal font-sans">
                        ₹{activeItem.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Color Swatches Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block font-sans">Color Swatches</span>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, idx) => (
                          <button
                            key={item.id}
                            onClick={() => handleSwatchClick(set.id, idx)}
                            className={`w-5 h-5 rounded-full border flex-shrink-0 transition-all ${
                              activeItemIdx === idx 
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

                  {/* Card Actions */}
                  <div className="border-t border-[#E6E0D5] px-6 py-4 bg-[#FAF7F2] flex items-center justify-between gap-3">
                    <Link
                      href={`/shop/product/${set.id}?variant=${activeItem.id}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-brand-muted hover:text-brand-charcoal transition-colors font-sans"
                    >
                      View Weave
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
              <p className="text-brand-muted text-xs font-sans max-w-sm mx-auto">We couldn&apos;t find any sarees matching your search criteria. Try modifying your fabric or collection filter.</p>
              <button 
                onClick={() => { setSearch(""); setSelectedSetId("all"); setSelectedFabric("all"); }}
                className="mt-2 text-xs font-bold text-brand-gold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted">Loading catalog...</span>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
