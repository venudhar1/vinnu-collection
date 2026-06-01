"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, FolderHeart, Sparkles, PlusCircle, ArrowRight, ReceiptText } from "lucide-react";

interface SummaryData {
  total_sets: number;
  total_colors: number;
  total_available: number;
  total_sold: number;
  sets: Array<{
    name: string;
    total_items: number;
    total_available: number;
    total_sold: number;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("admin_api_key");
    if (!key) {
      router.push("/admin/login");
    } else {
      setApiKey(key);
    }
  }, [router]);

  const { data: summary, isLoading, isError, error } = useQuery<SummaryData>({
    queryKey: ["admin_summary", apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("No API key configured");
      const res = await fetch("http://localhost:8000/bulk/inventory/summary", {
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_api_key");
          router.push("/admin/login");
        }
        throw new Error("Failed to fetch dashboard summary");
      }
      return res.json();
    },
    enabled: !!apiKey,
  });

  if (isLoading || !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">Loading Dashboard Stats...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs max-w-lg mx-auto mt-12">
        <p className="font-bold">Error loading summary data:</p>
        <p className="font-mono mt-1">{(error as Error)?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-brand-charcoal text-white p-8 rounded-sm border border-brand-gold/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif text-brand-gold">Hello, Staff Member</h2>
          <p className="text-xs text-zinc-300 font-sans mt-1">Here is a quick snapshot of the Saree database and sales activity today.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/sets"
            className="flex items-center gap-2 bg-brand-gold text-brand-charcoal px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-yellow-600 transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Add Collection
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            <ReceiptText className="w-4 h-4 text-brand-gold" />
            View Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 border border-zinc-200 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Saree Collections</span>
            <span className="text-3xl font-serif text-brand-charcoal block mt-1">{summary?.total_sets || 0}</span>
          </div>
          <div className="p-3.5 bg-brand-cream border border-[#E6E0D5] rounded-sm text-brand-gold">
            <FolderHeart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 border border-zinc-200 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Active SKUs (Colors)</span>
            <span className="text-3xl font-serif text-brand-charcoal block mt-1">{summary?.total_colors || 0}</span>
          </div>
          <div className="p-3.5 bg-brand-cream border border-[#E6E0D5] rounded-sm text-brand-gold">
            <Sparkles className="w-6 h-6 animate-swatch-pulse" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 border border-zinc-200 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Available Stock</span>
            <span className="text-3xl font-serif text-brand-charcoal block mt-1">{summary?.total_available || 0}</span>
          </div>
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-sm text-brand-emerald">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 border border-zinc-200 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Total Sold</span>
            <span className="text-3xl font-serif text-brand-charcoal block mt-1">{summary?.total_sold || 0}</span>
          </div>
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-sm text-brand-ruby">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Collection Breakdown Tables */}
      <div className="bg-white border border-zinc-200 rounded-sm shadow-xs">
        <div className="px-6 py-5 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <h3 className="font-serif text-base text-zinc-800">Inventory Status by Collection</h3>
          <Link href="/admin/sets" className="text-xs text-brand-gold hover:underline font-bold">
            Manage All Inventory &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-600">
            <thead className="bg-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Collection Name</th>
                <th className="px-6 py-3.5 text-center">Total Item Variants</th>
                <th className="px-6 py-3.5 text-center">Available Stock</th>
                <th className="px-6 py-3.5 text-center">Sold Units</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium">
              {summary?.sets && summary.sets.length > 0 ? (
                summary.sets.map((set, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-serif text-zinc-800 text-sm">{set.name}</td>
                    <td className="px-6 py-4 text-center">{set.total_items}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                        set.total_available > 0 
                          ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100" 
                          : "bg-rose-50 text-brand-ruby font-bold border border-rose-100"
                      }`}>
                        {set.total_available}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-400">{set.total_sold}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href="/admin/sets" 
                        className="inline-flex items-center gap-1.5 text-brand-gold hover:text-yellow-600 font-bold"
                      >
                        Adjust Inventory
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-muted">
                    No saree collections are configured yet. Click &quot;Add Collection&quot; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
