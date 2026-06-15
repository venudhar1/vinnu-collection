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
              VENU
              <span className="text-[10px] block font-sans tracking-widest text-brand-gold -mt-1 font-medium">COLLECTIONS</span>
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

            <Link href="/shop/login" className="p-2 text-brand-charcoal hover:text-brand-gold transition-colors" title="Customer Login">
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
            <h3 className="font-serif text-lg tracking-widest text-brand-gold mb-4">VENU</h3>
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
              <li><span className="cursor-pointer hover:text-brand-gold transition-colors">Shipping Policy</span></li>
              <li><span className="cursor-pointer hover:text-brand-gold transition-colors">Fabric Care Guide</span></li>
              <li><span className="cursor-pointer hover:text-brand-gold transition-colors">Contact Support</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold mb-4">Stay Connected</h4>
            <p className="text-xs text-slate-300 mb-3">Subscribe to get notifications on new arrivals and seasonal discounts.</p>
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="Your email"
                className="bg-zinc-800 text-white text-xs px-3 py-2 border border-zinc-700 rounded-xs focus:outline-hidden focus:border-brand-gold flex-1"
              />
              <button className="bg-brand-gold text-brand-charcoal text-xs font-bold px-4 py-2 hover:bg-yellow-600 transition-colors rounded-xs">
                Join
              </button>
            </div>
            {/* Elegant Social Icons */}
            <div className="flex gap-3 mt-5">
              <a 
                href="https://www.instagram.com/venucollections/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-zinc-800 text-brand-gold hover:text-white hover:bg-zinc-700 rounded-full transition-all duration-200 border border-brand-gold/15 hover:border-brand-gold/50 cursor-pointer"
                title="Follow us on Instagram"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a 
                href="https://chat.whatsapp.com/KKA3HDnSbKm8etwlJQ5R3I?s=cl&p=i&ilr=1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-zinc-800 text-brand-gold hover:text-white hover:bg-zinc-700 rounded-full transition-all duration-200 border border-brand-gold/15 hover:border-brand-gold/50 cursor-pointer"
                title="Chat with us on WhatsApp"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/@venucollections" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-zinc-800 text-brand-gold hover:text-white hover:bg-zinc-700 rounded-full transition-all duration-200 border border-brand-gold/15 hover:border-brand-gold/50 cursor-pointer"
                title="Watch our YouTube Channel"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between text-zinc-500 text-[10px]">
          <p>© 2026 Venu Collections. All rights reserved. Made in India.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/shop/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/shop/terms" className="hover:text-white transition-colors">Terms of Service</Link>
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

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919963988633?text=Hi%20Venu%20Collections%2C%20I'm%20interested%20in%20this%20product."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#128C7E] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center border border-white/20 md:bottom-6 bottom-20"
        title="Chat on WhatsApp"
        id="floating-whatsapp-btn"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.96 1.448 5.432 0 9.855-4.437 9.858-9.899.002-2.647-1.03-5.132-2.903-7.009-1.874-1.878-4.37-2.91-7.014-2.912-5.434 0-9.858 4.441-9.863 9.903-.002 1.778.469 3.511 1.361 5.048l-.934 3.41 3.484-.913zm11.232-6.52c-.329-.165-1.95-.963-2.253-1.074-.303-.11-.524-.165-.744.165-.22.33-.853 1.074-1.046 1.294-.193.22-.386.242-.715.077-.329-.165-1.389-.512-2.647-1.635-.978-.873-1.637-1.952-1.829-2.28-.193-.33-.02-.508.145-.671.149-.147.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.412-.028-.577-.083-.165-.744-1.792-1.019-2.457-.267-.643-.539-.556-.744-.567-.193-.01-.413-.012-.633-.012s-.578.082-.88.412c-.303.33-1.157 1.129-1.157 2.75 0 1.62 1.183 3.19 1.348 3.41.165.22 2.328 3.555 5.64 4.987.788.34 1.403.543 1.883.696.792.252 1.513.216 2.083.13.635-.096 1.95-.798 2.226-1.568.275-.769.275-1.43.193-1.567-.083-.138-.303-.22-.633-.386z"/>
        </svg>
      </a>

      {/* Mobile Sticky Contact Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-charcoal text-white border-t border-brand-gold/30 h-16 flex items-center justify-around px-4 shadow-lg">
        <a 
          href="https://chat.whatsapp.com/KKA3HDnSbKm8etwlJQ5R3I?s=cl&p=i&ilr=1" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center gap-1 text-[#25D366] hover:opacity-80 transition-opacity"
          id="mobile-contact-whatsapp"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.96 1.448 5.432 0 9.855-4.437 9.858-9.899.002-2.647-1.03-5.132-2.903-7.009-1.874-1.878-4.37-2.91-7.014-2.912-5.434 0-9.858 4.441-9.863 9.903-.002 1.778.469 3.511 1.361 5.048l-.934 3.41 3.484-.913zm11.232-6.52c-.329-.165-1.95-.963-2.253-1.074-.303-.11-.524-.165-.744.165-.22.33-.853 1.074-1.046 1.294-.193.22-.386.242-.715.077-.329-.165-1.389-.512-2.647-1.635-.978-.873-1.637-1.952-1.829-2.28-.193-.33-.02-.508.145-.671.149-.147.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.412-.028-.577-.083-.165-.744-1.792-1.019-2.457-.267-.643-.539-.556-.744-.567-.193-.01-.413-.012-.633-.012s-.578.082-.88.412c-.303.33-1.157 1.129-1.157 2.75 0 1.62 1.183 3.19 1.348 3.41.165.22 2.328 3.555 5.64 4.987.788.34 1.403.543 1.883.696.792.252 1.513.216 2.083.13.635-.096 1.95-.798 2.226-1.568.275-.769.275-1.43.193-1.567-.083-.138-.303-.22-.633-.386z"/>
          </svg>
          <span className="text-[9px] font-sans font-semibold tracking-wider">WhatsApp</span>
        </a>
        <div className="w-[1px] h-6 bg-brand-gold/25" />
        <a 
          href="https://www.instagram.com/venucollections/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center gap-1 text-brand-gold hover:opacity-80 transition-opacity"
          id="mobile-contact-instagram"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span className="text-[9px] font-sans font-semibold tracking-wider">Instagram</span>
        </a>
        <div className="w-[1px] h-6 bg-brand-gold/25" />
        <a 
          href="https://www.youtube.com/@venucollections" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center gap-1 text-rose-500 hover:opacity-80 transition-opacity"
          id="mobile-contact-youtube"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
          <span className="text-[9px] font-sans font-semibold tracking-wider">YouTube</span>
        </a>
      </div>
    </div>
  );
}
