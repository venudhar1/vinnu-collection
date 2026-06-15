"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { 
  ShoppingBag, CheckCircle, ShieldCheck, QrCode, Lock, 
  ArrowLeft, AlertTriangle, Send 
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  
  // Form input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [customerSession, setCustomerSession] = useState<null | { name?: string; email?: string; phone?: string }>(null);

  useEffect(() => {
    const saved = localStorage.getItem("customer_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomerSession(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setPhone(parsed.phone || "");
      } catch {
        localStorage.removeItem("customer_session");
      }
    }
  }, []);
  
  // UPI Transaction ID state
  const [transactionId, setTransactionId] = useState("");

  // Flow states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);

  const generateTransactionNote = () => {
    if (cart.length === 0) return "";
    const itemsStr = cart.map(({ item, set }) => {
      // (SKU,color,model) note formatting
      return `${item.sku}: ${set.name} (${item.color})`;
    }).join(", ");
    
    // Truncate to maximum 50 characters to comply with UPI specifications
    if (itemsStr.length > 50) {
      return itemsStr.slice(0, 47) + "...";
    }
    return itemsStr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    setError(null);

    const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
    const payload = {
      customer_name: name,
      customer_email: email,
      customer_phone: phone || null,
      shipping_address: fullAddress,
      payment_id: transactionId || null,
      items: cart.map(({ item, quantity }) => ({
        item_id: item.id,
        quantity,
      })),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderResult(data);
        clearCart(); // Success: clear user's bag
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || "Unable to process order. Stock availability might have changed.");
      }
    } catch {
      setError("Cannot establish connection to checkout services. Please verify backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  // If order was successfully created, show confirmation card
  if (orderResult) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6 font-sans text-xs">
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-sm inline-block text-brand-emerald">
          <CheckCircle className="w-16 h-16 animate-swatch-pulse" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-serif text-brand-charcoal">Thank You For Your Purchase</h2>
          <p className="text-brand-muted text-sm font-sans font-medium">Your saree order is confirmed and currently being prepared for shipment.</p>
        </div>

        {/* Order details block */}
        <div className="bg-white border border-[#E6E0D5] p-6 text-left rounded-xs space-y-4">
          <div className="flex justify-between border-b border-zinc-150 pb-3">
            <span className="font-bold text-zinc-700 uppercase tracking-wide text-[10px]">Order Confirmation Code</span>
            <span className="font-mono font-bold text-brand-gold">{orderResult.id}</span>
          </div>

          <div className="space-y-2 text-zinc-600">
            <p><span className="font-bold text-zinc-800">Customer:</span> {orderResult.customer_name} ({orderResult.customer_email})</p>
            <p><span className="font-bold text-zinc-800">Shipping Address:</span> {orderResult.shipping_address}</p>
            <p><span className="font-bold text-zinc-800">Status:</span> <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-100 uppercase tracking-wider rounded-xs text-[10px]">{orderResult.status}</span></p>
          </div>

          <div className="pt-3 border-t border-zinc-150 flex justify-between items-center text-sm font-serif text-zinc-800">
            <span>Total Paid</span>
            <span className="font-sans font-bold text-brand-ruby text-base">₹{orderResult.total_amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-4 flex gap-4 justify-center">
          <Link
            href="/shop/catalog"
            className="bg-brand-charcoal text-white hover:bg-zinc-800 px-6 py-3 rounded-xs font-bold uppercase tracking-wider text-xs shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-xs">
      {/* Title */}
      <div className="border-b border-[#E6E0D5] pb-4 flex items-center gap-3">
        <Link 
          href="/shop/catalog" 
          className="p-2 border border-zinc-200 hover:bg-zinc-100 rounded-md transition-colors text-zinc-500 hover:text-brand-charcoal"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <div>
          <h2 className="text-2xl font-serif text-brand-charcoal tracking-wide">Checkout</h2>
          <p className="text-brand-muted mt-1 leading-relaxed">Provide your coordinates and simulated card details to complete your order.</p>
        </div>
      </div>

      {customerSession && (
        <div className="mt-4 rounded-sm border border-emerald-100 bg-emerald-50 p-4 text-emerald-800 text-xs">
          <div className="font-semibold">Signed in as {customerSession.name}</div>
          <div className="mt-1">Your saved email is {customerSession.email}. If you want to change it, update the form below.</div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xs bg-rose-50 border border-rose-200 text-rose-800">
          <AlertTriangle className="w-5 h-5 text-brand-ruby flex-shrink-0 mt-0.5 animate-swatch-pulse" />
          <div>
            <p className="font-bold uppercase tracking-wider text-[10px]">Checkout Error</p>
            <p className="font-sans font-medium mt-1">{error}</p>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="bg-white border border-[#E6E0D5] p-12 text-center space-y-4 rounded-xs max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-[#E6E0D5] mx-auto" />
          <h3 className="font-serif text-lg text-brand-charcoal">Your bag is empty</h3>
          <p className="text-brand-muted">You cannot proceed to checkout without adding items to your bag.</p>
          <Link
            href="/shop/catalog"
            className="inline-block bg-brand-charcoal text-white px-6 py-3 rounded-xs font-bold uppercase tracking-wider"
          >
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Details */}
            <div className="bg-white border border-[#E6E0D5] p-6 rounded-xs space-y-4 shadow-xs">
              <h3 className="font-serif text-base text-brand-charcoal border-b border-[#FAF7F2] pb-2">Client Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-[#E6E0D5] p-6 rounded-xs space-y-4 shadow-xs">
              <h3 className="font-serif text-base text-brand-charcoal border-b border-[#FAF7F2] pb-2">Shipping Destination</h3>
              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Street Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 102, Green Avenue, Landmark: Royal Garden"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="110001"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold"
                  />
                </div>
              </div>
            </div>
            {/* UPI Scan & Pay Card */}
            <div className="bg-white border border-[#E6E0D5] p-6 rounded-xs space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#FAF7F2] pb-2">
                <QrCode className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-base text-brand-charcoal">UPI Scan & Pay</h3>
              </div>

              {/* Trust & Safety Assurances */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-sm space-y-2">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Secured UPI Transaction</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-700 font-sans font-medium">
                  Your money is 100% safe. The payment is processed securely via India's Unified Payments Interface. We do not collect, store, or have access to any of your bank account credentials or PINs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-[#FAF7F2] border border-[#E6E0D5] rounded-xs">
                  <div className="bg-white p-3 rounded-xs border border-zinc-200 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                        `upi://pay?pa=9963988633@kotak&pn=Venu%20Collections&am=${cartTotal}&tn=${generateTransactionNote()}&cu=INR`
                      )}`}
                      alt="UPI Payment QR Code"
                      className="w-44 h-44"
                    />
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-brand-muted mt-3 text-center">
                    Scan with GPay, PhonePe, Paytm, BHIM, etc.
                  </span>
                </div>

                {/* UPI Details & Instructions */}
                <div className="space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                      <span className="text-zinc-400">Payee Name:</span>
                      <span className="font-semibold text-brand-charcoal">Venu Collections</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                      <span className="text-zinc-400">UPI ID:</span>
                      <span className="font-mono font-semibold text-brand-charcoal">9963988633@kotak</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                      <span className="text-zinc-400">Amount to Pay:</span>
                      <span className="font-bold text-brand-ruby text-sm">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-1 pb-1">
                      <span className="text-zinc-400">Transaction Note (Pre-filled):</span>
                      <span className="bg-brand-cream border border-brand-gold/20 px-2.5 py-1.5 rounded-sm font-mono text-[9px] text-brand-gold leading-tight break-all font-bold">
                        {generateTransactionNote()}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Deep Link Button */}
                  <div className="block md:hidden">
                    <a
                      href={`upi://pay?pa=9963988633@kotak&pn=Venu%20Collections&am=${cartTotal}&tn=${encodeURIComponent(generateTransactionNote())}&cu=INR`}
                      className="w-full flex items-center justify-center gap-2 bg-[#FAF7F2] border border-[#E6E0D5] hover:bg-zinc-100 text-brand-charcoal text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5 text-brand-gold" />
                      Pay via Mobile UPI App
                    </a>
                  </div>
                </div>
              </div>

              {/* Warning/Instruction about Note */}
              <div className="p-3 bg-brand-cream border border-brand-gold/30 text-brand-gold rounded-xs text-[11px] leading-relaxed font-sans font-medium">
                <strong>Important Instruction:</strong> Please do not modify or delete the transaction note inside your UPI payment app. This note contains the exact saree details (SKU, color, model) and helps us track and ship your order correctly.
              </div>

              {/* Transaction ID input field */}
              <div className="space-y-1.5 border-t border-zinc-100 pt-4">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-gold" />
                  UPI Transaction ID / UTR Number
                </label>
                <input
                  type="text"
                  required
                  pattern="\d{12}"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="Enter the 12-digit transaction ID after payment"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold font-mono text-sm"
                />
                <span className="text-[10px] text-brand-muted block mt-1 leading-relaxed">
                  Submit the 12-digit Transaction ID/UTR from your payment confirmation screen. Once submitted, our team will verify it against our receiver statement to confirm your order within 1-2 hours.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-ruby hover:bg-rose-950 disabled:opacity-50 text-white font-sans text-sm font-bold tracking-widest uppercase py-4 shadow-md transition-all rounded-xs cursor-pointer"
            >
              <Send className="w-4 h-4 text-brand-gold" />
              {loading ? "Processing checkout request..." : "Confirm Payment & Place Order"}
            </button>
          </div>

          {/* Right Column: Order Summary Checklist */}
          <div className="lg:col-span-5 bg-white border border-[#E6E0D5] p-6 rounded-xs space-y-6 shadow-xs sticky top-28">
            <h3 className="font-serif text-base text-brand-charcoal border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              Order Summary
            </h3>
            
            <div className="divide-y divide-[#FAF7F2] max-h-72 overflow-y-auto pr-2">
              {cart.map(({ item, set, quantity }) => (
                <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-serif text-sm text-brand-charcoal leading-tight">{set.name}</h4>
                    <span className="text-[10px] text-brand-muted block font-sans">Color: {item.color} (Qty: {quantity})</span>
                    <span className="text-[8px] text-zinc-400 font-mono block">SKU: {item.sku}</span>
                  </div>
                  <span className="font-bold text-zinc-800 font-sans">
                    ₹{(item.price * quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-zinc-150 pt-4 space-y-2 text-zinc-500 font-sans">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-800">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured shipping</span>
                <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Local GST</span>
                <span className="font-bold text-zinc-800">₹0</span>
              </div>
              
              <div className="border-t border-zinc-150 pt-4 flex justify-between items-center text-base font-serif text-brand-charcoal">
                <span>Grand Total</span>
                <span className="font-sans font-bold text-brand-ruby text-lg">
                  ₹{cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-brand-cream border border-[#E6E0D5] rounded-xs font-sans text-brand-muted leading-relaxed">
              <h5 className="font-bold text-brand-charcoal uppercase tracking-wider text-[9px] mb-1">Shipping Protection Plan</h5>
              All shipments are hand-packed, insured, and verified via OTP delivery. Dispatch confirmation will be dispatched via email.
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
