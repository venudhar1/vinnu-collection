"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, LogOut, ReceiptText, ShieldCheck, KeyRound } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("admin_api_key");
    if (!key && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setApiKey(key);
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_api_key");
    router.push("/admin/login");
  };

  // If loading authentication state, show a clean loader
  if (!isAuthorized && pathname !== "/admin/login") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-xs font-sans text-brand-muted uppercase tracking-wider font-semibold">Authenticating Staff Session...</span>
        </div>
      </div>
    );
  }

  // Login page doesn't render the admin shell sidebar
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-brand-cream">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col flex-shrink-0 border-r border-zinc-800">
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-2 px-6 border-b border-zinc-850">
          <ShieldCheck className="w-6 h-6 text-brand-gold" />
          <div>
            <span className="font-serif text-lg tracking-widest text-brand-gold block -mb-1">VENU</span>
            <span className="text-[9px] font-sans tracking-widest text-zinc-400 font-bold uppercase">Staff Admin Panel</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-sans font-medium tracking-wide uppercase transition-colors ${
              pathname === "/admin/dashboard"
                ? "bg-brand-gold text-brand-charcoal"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/sets"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-sans font-medium tracking-wide uppercase transition-colors ${
              pathname.startsWith("/admin/sets")
                ? "bg-brand-gold text-brand-charcoal"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Manage Inventory
          </Link>

          <Link
            href="/admin/orders"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-sans font-medium tracking-wide uppercase transition-colors ${
              pathname.startsWith("/admin/orders")
                ? "bg-brand-gold text-brand-charcoal"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            Customer Orders
          </Link>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-850 flex flex-col gap-2">
          {apiKey && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-850 text-[10px] font-mono text-zinc-500 truncate">
              <KeyRound className="w-3 h-3 text-brand-gold flex-shrink-0" />
              <span className="truncate">{apiKey.substring(0, 12)}...</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-xs font-medium tracking-wide uppercase text-rose-400 hover:text-white hover:bg-rose-950/30 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-serif text-zinc-800">
            {pathname === "/admin/dashboard" && "Performance Summary"}
            {pathname.startsWith("/admin/sets") && "Saree Inventory Database"}
            {pathname.startsWith("/admin/orders") && "Client Purchase Ledger"}
          </h1>
          <div className="flex items-center gap-4 text-xs font-sans">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Live Connection
            </span>
            <Link 
              href="/shop" 
              className="text-brand-gold hover:underline font-bold"
              target="_blank"
            >
              Preview Storefront &rarr;
            </Link>
          </div>
        </header>
        
        <main className="p-8 max-w-7xl w-full mx-auto animate-fade-in flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
