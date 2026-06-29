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
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });

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
  let originalPrice: number | null = null;

  if (activeItem.item_metadata) {
    try {
      const meta = JSON.parse(activeItem.item_metadata);
      materialName = meta.material || "Pure Handloom Silk";
      notes = meta.notes || "";
      if (meta.images && Array.isArray(meta.images)) {
        imagesList = meta.images;
      }
      if (meta.original_price) {
        originalPrice = Number(meta.original_price);
      }
    } catch {}
  }

  if (!originalPrice) {
    originalPrice = Math.round(activeItem.price * 1.35);
  }

  const discountPct = Math.round(((originalPrice - activeItem.price) / originalPrice) * 100);

  const hasImages = imagesList.length > 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imagesList.length) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    
    // Mouse coordinates relative to the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Ensure mouse is within bounds
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setZoomStyle({ display: "none" });
      return;
    }
    
    // Lens size is 160px
    const lensWidth = 160;
    const lensHeight = 160;
    
    const left = x - lensWidth / 2;
    const top = y - lensHeight / 2;
    
    // Calculate percentage coordinates for background positioning
    const xp = (x / rect.width) * 100;
    const yp = (y / rect.height) * 100;
    
    setZoomStyle({
      display: "block",
      left: `${left}px`,
      top: `${top}px`,
      backgroundImage: `url(${imagesList[activeImgIdx]})`,
      backgroundPosition: `${xp}% ${yp}%`,
      backgroundSize: `${rect.width * 2.2}px ${rect.height * 2.2}px`, // 2.2x zoom
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

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
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-[3/4] bg-brand-cream border border-[#E6E0D5] rounded-xs overflow-hidden flex items-center justify-center magnifier-container"
          >
            {hasImages ? (
              <>
                <img 
                  src={imagesList[activeImgIdx]} 
                  alt={`${setObj.name} in ${activeItem.color}`}
                  className="w-full h-full object-cover animate-fade-in"
                />
                <div className="magnifier-lens" style={zoomStyle} />
              </>
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
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-sans font-bold text-brand-ruby">
                ₹{activeItem.price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-zinc-400 line-through text-sm font-sans">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
              {discountPct > 0 && (
                <span className="text-emerald-700 font-sans text-xs font-bold">
                  ({discountPct}% OFF)
                </span>
              )}
              <span className="text-[10px] text-brand-muted font-sans font-medium ml-1">Inclusive of all local taxes</span>
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
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => addToCart(activeItem, setObj)}
              disabled={activeItem.status !== "available" || activeItem.quantity <= 0}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 text-white font-sans text-xs font-bold tracking-widest uppercase py-4 shadow-md transition-all rounded-xs"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              {activeItem.status === "available" ? "Add to Shopping Bag" : "Sold Out"}
            </button>
            
            <a
              href={`https://wa.me/919963988633?text=${encodeURIComponent(`Hi, I have a question about ${setObj.name} (Color: ${activeItem.color}, SKU: ${activeItem.sku})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-sans text-xs font-bold tracking-widest uppercase py-4 shadow-md transition-all rounded-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.96 1.448 5.432 0 9.855-4.437 9.858-9.899.002-2.647-1.03-5.132-2.903-7.009-1.874-1.878-4.37-2.91-7.014-2.912-5.434 0-9.858 4.441-9.863 9.903-.002 1.778.469 3.511 1.361 5.048l-.934 3.41 3.484-.913zm11.232-6.52c-.329-.165-1.95-.963-2.253-1.074-.303-.11-.524-.165-.744.165-.22.33-.853 1.074-1.046 1.294-.193.22-.386.242-.715.077-.329-.165-1.389-.512-2.647-1.635-.978-.873-1.637-1.952-1.829-2.28-.193-.33-.02-.508.145-.671.149-.147.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.412-.028-.577-.083-.165-.744-1.792-1.019-2.457-.267-.643-.539-.556-.744-.567-.193-.01-.413-.012-.633-.012s-.578.082-.88.412c-.303.33-1.157 1.129-1.157 2.75 0 1.62 1.183 3.19 1.348 3.41.165.22 2.328 3.555 5.64 4.987.788.34 1.403.543 1.883.696.792.252 1.513.216 2.083.13.635-.096 1.95-.798 2.226-1.568.275-.769.275-1.43.193-1.567-.083-.138-.303-.22-.633-.386z"/>
              </svg>
              WhatsApp Enquiry
            </a>
            
            <button className="p-4 border border-[#E6E0D5] text-brand-muted hover:text-brand-ruby hover:border-brand-ruby rounded-xs transition-colors flex items-center justify-center">
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
