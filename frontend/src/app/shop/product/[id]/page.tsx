"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  ArrowLeft, ShoppingBag, Sparkles, ShieldCheck, 
  Truck, Heart, AlertCircle
} from "lucide-react";
import { useCart } from "../../../context/CartContext";

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

function ProductDetailContent({ setId }: { setId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantIdParam = searchParams.get("variant");
  const { addToCart } = useCart();

  // Selected variant state
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Fetch Set Details Query
  const { data: setObj, isLoading: isSetLoading } = useQuery<SetItem>({
    queryKey: ["public_set_detail", setId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/public/sets/${setId}`);
      if (!res.ok) throw new Error("Failed to fetch set detail");
      return res.json();
    },
  });

  // Fetch Items Query
  const { data: items, isLoading: isItemsLoading } = useQuery<Item[]>({
    queryKey: ["public_set_items", setId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/public/sets/${setId}/items`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });

  // Sync active variant from query param or default to first item
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    if (variantIdParam) {
      const match = items.find((i) => i.id === variantIdParam);
      if (match) {
        setActiveItem(match);
        return;
      }
    }
    setActiveItem(items[0]);
  }, [items, variantIdParam]);

  const handleVariantSelect = (item: Item) => {
    setActiveItem(item);
    setActiveImgIdx(0);
    router.replace(`/shop/product/${setId}?variant=${item.id}`, { scroll: false });
  };

  const isLoading = isSetLoading || isItemsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted">Fetching saree weave detail...</span>
      </div>
    );
  }

  if (!setObj || !activeItem) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4 font-sans text-xs">
        <AlertCircle className="w-12 h-12 text-brand-gold/30 mx-auto" />
        <h4 className="font-serif text-lg text-brand-charcoal">Saree Weave Not Found</h4>
        <p className="text-brand-muted">The requested saree or collection is not available in our database.</p>
        <Link href="/shop/catalog" className="inline-block text-brand-gold font-bold hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Parse Metadata details
  let materialName = "Pure Handloom Silk";
  let notes = "";
  let imagesList: string[] = [];

  if (activeItem.item_metadata) {
    try {
      const meta = JSON.parse(activeItem.item_metadata);
      materialName = meta.material || "Pure Handloom Silk";
      notes = meta.notes || "";
      if (meta.images && Array.isArray(meta.images)) {
        imagesList = meta.images;
      }
    } catch {}
  }

  const hasImages = imagesList.length > 0;

  return (
    <div className="space-y-10 font-sans text-xs">
      {/* Breadcrumb / Back button */}
      <div>
        <Link 
          href="/shop/catalog" 
          className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-charcoal transition-colors font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalogue
        </Link>
      </div>

      {/* Main product configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] bg-brand-cream border border-[#E6E0D5] rounded-xs overflow-hidden flex items-center justify-center">
            {hasImages ? (
              <img 
                src={imagesList[activeImgIdx]} 
                alt={`${setObj.name} in ${activeItem.color}`}
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in">
                <span className="font-serif text-2xl tracking-widest text-brand-charcoal">{setObj.name}</span>
                <div 
                  className="w-24 h-24 rounded-full border-2 border-white shadow-md animate-swatch-pulse" 
                  style={{ backgroundColor: activeItem.color.toLowerCase() }}
                />
                <div>
                  <span className="block text-xs uppercase font-bold tracking-wider text-brand-gold">Authentic Weave</span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">SKU: {activeItem.sku}</span>
                </div>
              </div>
            )}

            {/* Sold Tag overlay */}
            {activeItem.status !== "available" && (
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-xs">
                <span className="bg-brand-ruby text-white font-sans text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm shadow-md">
                  Variant Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {hasImages && imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-20 aspect-[3/4] rounded-xs border overflow-hidden flex-shrink-0 bg-brand-cream transition-all ${
                    activeImgIdx === idx 
                      ? "border-brand-gold ring-1 ring-brand-gold scale-102" 
                      : "border-[#E6E0D5] hover:border-brand-charcoal"
                  }`}
                >
                  <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing details and controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#E6E0D5] pb-5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold font-sans block">
              Handcrafted Collection
            </span>
            <h2 className="text-3xl font-serif text-brand-charcoal tracking-wide leading-tight">
              {setObj.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-zinc-400 text-[10px]">SKU: {activeItem.sku}</span>
              <span className="text-zinc-300">|</span>
              <span className="text-zinc-500 font-medium">{materialName}</span>
            </div>
          </div>

          {/* Pricing indicator */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-sans font-bold text-brand-charcoal">
                ₹{activeItem.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-brand-muted font-sans font-medium">Inclusive of all local taxes</span>
            </div>
            
            {/* Availability Badging */}
            <div>
              {activeItem.status === "available" ? (
                activeItem.quantity === 1 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-brand-marigold border border-amber-100 font-sans">
                    Only 1 weave left in stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 font-sans">
                    In Stock (Ready to Ship)
                  </span>
                )
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-brand-ruby border border-rose-100 font-sans">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Color swatches */}
          {items && items.length > 1 && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider block font-sans">
                Select Shade / Color
              </span>
              <div className="flex flex-wrap gap-2.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleVariantSelect(item)}
                    className={`w-8 h-8 rounded-full border transition-all relative flex-shrink-0 flex items-center justify-center ${
                      activeItem.id === item.id 
                        ? "ring-2 ring-brand-gold border-white scale-110 shadow-xs" 
                        : "border-[#E6E0D5] hover:scale-105"
                    }`}
                    style={{ backgroundColor: item.color.toLowerCase() }}
                    title={item.color}
                  >
                    {item.status !== "available" && (
                      <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center text-[9px] text-brand-ruby font-bold">
                        /
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-brand-muted font-sans font-medium">Selected Color: <span className="text-brand-charcoal font-bold">{activeItem.color}</span></p>
            </div>
          )}

          {/* Add to Bag and CTA */}
          <div className="pt-4 flex gap-4">
            <button
              onClick={() => addToCart(activeItem, setObj)}
              disabled={activeItem.status !== "available" || activeItem.quantity <= 0}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 text-white font-sans text-xs font-bold tracking-widest uppercase py-4 shadow-md transition-all rounded-xs"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              {activeItem.status === "available" ? "Add to Shopping Bag" : "Sold Out"}
            </button>
            
            <button className="p-4 border border-[#E6E0D5] text-brand-muted hover:text-brand-ruby hover:border-brand-ruby rounded-xs transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>

          {/* Merchandising description notes */}
          {notes && (
            <div className="space-y-2 border-t border-[#E6E0D5] pt-5">
              <h4 className="font-bold text-brand-charcoal uppercase tracking-wider text-[10px]">Weave Artisan Notes</h4>
              <p className="text-brand-muted leading-relaxed font-sans text-xs">{notes}</p>
            </div>
          )}

          {/* Size / Blouse specifications */}
          <div className="space-y-2.5 border-t border-[#E6E0D5] pt-5 font-sans text-xs text-brand-muted leading-relaxed">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>Includes unstitched matching blouse piece (80cm).</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>Dispatched within 24-48 hours with signature packaging.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>Silk Mark certified purity guarantee upon request.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: setId } = use(params);

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted">Loading product...</span>
      </div>
    }>
      <ProductDetailContent setId={setId} />
    </Suspense>
  );
}
