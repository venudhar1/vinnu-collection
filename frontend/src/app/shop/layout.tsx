"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { ShoppingBag, X, Trash2, Plus, Minus, Search, User, Heart } from "lucide-react";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { 
    cart, 
    cartCount, 
    cartTotal, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity 
  } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 w-full glass-nav shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Elegant Serif Logo */}
            <Link href="/shop" className="text-2xl font-serif tracking-widest text-brand-charcoal hover:opacity-80 transition-opacity">
              VINNU
              <span className="text-[10px] block font-sans tracking-widest text-brand-gold -mt-1 font-medium">COLLECTION</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/shop/catalog" className="text-sm font-sans tracking-wide text-brand-charcoal/90 hover:text-brand-gold transition-colors font-medium">
                Collections
              </Link>
              <Link href="/shop/catalog" className="text-sm font-sans tracking-wide text-brand-charcoal/90 hover:text-brand-gold transition-colors font-medium">
                Sarees
              </Link>
              <Link href="/shop" className="text-sm font-sans tracking-wide text-brand-charcoal/90 hover:text-brand-gold transition-colors font-medium">
                Our Story
              </Link>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search sarees..."
                className="w-48 pl-8 pr-4 py-1.5 text-xs rounded-full border border-[#E6E0D5] bg-white focus:outline-hidden focus:border-brand-gold transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
            </div>

            <Link href="/admin/login" className="p-2 text-brand-charcoal hover:text-brand-gold transition-colors" title="Staff Dashboard">
              <User className="w-5 h-5" />
            </Link>

            <button className="p-2 text-brand-charcoal hover:text-brand-gold transition-colors relative">
              <Heart className="w-5 h-5" />
            </button>

            {/* Shopping Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-brand-charcoal hover:text-brand-gold transition-colors relative flex items-center gap-1 bg-white border border-[#E6E0D5] rounded-full px-3 py-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>

      {/* Brand Footer */}
      <footer className="bg-brand-charcoal text-white mt-12 py-12 border-t border-brand-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-lg tracking-widest text-brand-gold mb-4">VINNU</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
              Handcrafted with devotion, celebrating the timeless elegance of Indian weave traditions. Offering authentic fabrics directly from heritage artisans.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/shop/catalog" className="hover:text-brand-gold transition-colors">Banarasi Collection</Link></li>
              <li><Link href="/shop/catalog" className="hover:text-brand-gold transition-colors">Silk Sarees</Link></li>
              <li><Link href="/shop/catalog" className="hover:text-brand-gold transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><span className="cursor-pointer hover:text-brand-gold transition-colors">Shipping & Returns</span></li>
              <li><span className="cursor-pointer hover:text-brand-gold transition-colors">Fabric Care Guide</span></li>
              <li><span className="cursor-pointer hover:text-brand-gold transition-colors">Contact Support</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold mb-4">Stay Connected</h4>
            <p className="text-xs text-slate-300 mb-3">Subscribe to get notifications on new arrivals and seasonal discounts.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="bg-zinc-800 text-white text-xs px-3 py-2 border border-zinc-700 rounded-xs focus:outline-hidden focus:border-brand-gold flex-1"
              />
              <button className="bg-brand-gold text-brand-charcoal text-xs font-bold px-4 py-2 hover:bg-yellow-600 transition-colors rounded-xs">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between text-zinc-500 text-[10px]">
          <p>© 2026 Vinnu Collection. All rights reserved. Made in India.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop Overlay */}
            <div 
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white shadow-xl animate-fade-in border-l border-[#E6E0D5]">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between border-b border-[#E6E0D5] px-6 py-5">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-brand-gold" />
                      <h2 className="text-lg font-serif text-brand-charcoal">Your Saree Bag</h2>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="rounded-full p-1.5 text-brand-muted hover:bg-brand-cream transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <ShoppingBag className="w-12 h-12 text-[#E6E0D5] mb-3" />
                        <p className="text-sm font-medium text-brand-muted">Your shopping bag is empty.</p>
                        <Link 
                          href="/shop/catalog" 
                          onClick={() => setIsCartOpen(false)}
                          className="mt-4 text-xs font-bold text-brand-gold hover:underline"
                        >
                          Browse our Sarees
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {cart.map(({ item, set, quantity }) => (
                          <div key={item.id} className="flex items-start gap-4 border-b border-[#FAF7F2] pb-6">
                            {/* Saree Colored Square/Placeholder */}
                            <div className="w-20 h-24 rounded-sm bg-brand-cream border border-[#E6E0D5] flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                              <div className="absolute inset-0 flex flex-col justify-between p-2 text-center">
                                <span className="text-[10px] font-serif uppercase truncate text-brand-gold">{set.name}</span>
                                <div className="mx-auto w-6 h-6 rounded-full border border-white shadow-xs" style={{ backgroundColor: item.color.toLowerCase() }} />
                                <span className="text-[8px] font-sans truncate text-brand-muted">{item.color}</span>
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between text-sm font-medium text-brand-charcoal">
                                <h3 className="font-serif">{set.name}</h3>
                                <p className="ml-4 font-sans font-bold">₹{(item.price * quantity).toLocaleString()}</p>
                              </div>
                              <p className="mt-1 text-xs text-brand-muted font-sans">Color: {item.color}</p>
                              <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</p>

                              <div className="flex items-center justify-between mt-4">
                                {/* Quantity Toggler */}
                                <div className="flex items-center border border-[#E6E0D5] rounded-full px-2 py-1 bg-[#FAF7F2]">
                                  <button 
                                    onClick={() => updateQuantity(item.id, quantity - 1)}
                                    className="p-1 hover:text-brand-gold transition-colors"
                                    disabled={quantity <= 1}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2.5 text-xs font-sans font-bold text-brand-charcoal">{quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, quantity + 1)}
                                    className="p-1 hover:text-brand-gold transition-colors"
                                    disabled={quantity >= item.quantity}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-brand-muted hover:text-brand-ruby transition-colors p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-[#E6E0D5] px-6 py-6 bg-brand-cream">
                      <div className="flex justify-between text-base font-serif text-brand-charcoal mb-2">
                        <span>Subtotal</span>
                        <span className="font-sans font-bold">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-brand-muted font-sans mb-6">Free insured shipping across India.</p>
                      
                      <Link
                        href="/shop/checkout"
                        onClick={() => setIsCartOpen(false)}
                        className="flex items-center justify-center rounded-xs bg-brand-ruby text-white font-sans text-sm font-bold tracking-wider uppercase py-3.5 shadow-md hover:bg-rose-950 transition-colors w-full"
                      >
                        Proceed to Checkout
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
