"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ShieldCheck, Sparkles, ArrowRight, LogOut } from "lucide-react";

export default function ShopLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("customer_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setPhone(parsed.phone || "");
        setHasSession(true);
      } catch {
        localStorage.removeItem("customer_session");
      }
    }
  }, []);

  const saveSession = () => {
    localStorage.setItem(
      "customer_session",
      JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email to continue.");
      return;
    }

    saveSession();
    router.push("/shop/checkout");
  };

  const handleContinueAsGuest = () => {
    localStorage.removeItem("customer_session");
    router.push("/shop/checkout");
  };

  const handleSignOut = () => {
    localStorage.removeItem("customer_session");
    setName("");
    setEmail("");
    setPhone("");
    setHasSession(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-brand-cream">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-sm border border-[#E6E0D5] shadow-xs">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold text-brand-charcoal mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif tracking-widest text-brand-charcoal">Customer Sign In</h2>
          <p className="mt-2 text-xs font-sans tracking-widest text-brand-gold uppercase font-bold">
            Save your details for a faster checkout experience.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        {hasSession && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-800">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Saved customer session detected.</span>
            </div>
            <p className="text-[11px] text-zinc-600">Your name and email will be reused for checkout if you continue.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/shop/checkout")}
                className="flex-1 bg-brand-charcoal text-white rounded-sm text-xs uppercase tracking-wider py-2"
              >
                Continue to Checkout
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 border border-zinc-300 rounded-sm text-xs uppercase tracking-wider py-2 text-zinc-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="mt-2 w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="mt-2 w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-2 w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-charcoal text-white rounded-sm py-3 text-xs uppercase tracking-widest font-bold"
          >
            Save and Continue
          </button>
        </form>

        <div className="relative flex items-center justify-center py-4">
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#E6E0D5]" />
          <span className="relative px-3 bg-white text-[10px] uppercase tracking-widest text-zinc-400">
            OR
          </span>
        </div>

        <button
          type="button"
          onClick={handleContinueAsGuest}
          className="w-full border border-[#E6E0D5] rounded-sm py-3 text-xs uppercase tracking-widest font-bold text-brand-charcoal hover:border-brand-gold"
        >
          Continue as Guest
        </button>

        <div className="pt-6 text-center text-[11px] text-zinc-500">
          <p>
            Need staff access? Use <Link href="/admin/login" className="font-bold text-brand-charcoal underline">Admin Login</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
