"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReceiptText, Mail, Phone, MapPin } from "lucide-react";

interface OrderItemRecord {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  price: number;
  sku?: string;
  color?: string;
  set_name?: string;
}

interface OrderRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  total_amount: number;
  status: string; // pending, paid, shipped, cancelled
  payment_id?: string;
  created_at: string;
  items: OrderItemRecord[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("admin_api_key");
    if (!key) {
      router.push("/admin/login");
    } else {
      setApiKey(key);
    }
  }, [router]);

  // Fetch Orders Query
  const { data: orders, isLoading } = useQuery<OrderRecord[]>({
    queryKey: ["admin_orders", apiKey],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/orders/`, {
        headers: { "x-api-key": apiKey! },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!apiKey,
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { orderId: string; status: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/orders/${data.orderId}/status?status=${data.status}`,
        {
          method: "PUT",
          headers: {
            "x-api-key": apiKey!,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (updatedOrder: OrderRecord) => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
      // Update local detailed overlay
      setSelectedOrder(updatedOrder);
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading || !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">Loading purchase ledger...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Orders List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-zinc-200 rounded-sm shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-600">
              <thead className="bg-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-center">Items Count</th>
                  <th className="px-6 py-4 text-right">Total Billing</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-medium">
                {orders && orders.length > 0 ? (
                  orders.map((order) => {
                    const itemsCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                    return (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className={`hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                          selectedOrder?.id === order.id ? "bg-[#FAF7F2] border-l-2 border-brand-gold" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-mono text-[10px] text-zinc-500 max-w-[100px] truncate">{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-800">{order.customer_name}</div>
                          <div className="text-[10px] text-zinc-400 font-sans">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-700">{itemsCount}</td>
                        <td className="px-6 py-4 text-right font-bold text-zinc-800">₹{order.total_amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            order.status === "paid" 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                              : order.status === "shipped"
                              ? "bg-blue-50 text-blue-850 border-blue-100"
                              : order.status === "cancelled"
                              ? "bg-zinc-50 text-zinc-450 border-zinc-200"
                              : "bg-amber-50 text-brand-marigold border-amber-100"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-brand-gold hover:underline font-bold text-[10px] uppercase tracking-wide">
                            View &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                      <ReceiptText className="w-10 h-10 text-[#E6E0D5] mx-auto mb-2" />
                      No client orders have been placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="lg:col-span-1">
        {selectedOrder ? (
          <div className="bg-white border border-zinc-200 rounded-sm p-6 space-y-6 shadow-xs animate-fade-in sticky top-28">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Active Record Detail</span>
                <h3 className="font-serif text-base text-zinc-800 truncate max-w-[200px]" title={selectedOrder.id}>
                  Order #{selectedOrder.id.substring(0, 8)}
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {new Date(selectedOrder.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Customer info */}
            <div className="space-y-3 text-xs font-sans">
              <h4 className="font-bold text-zinc-700 uppercase tracking-wide text-[10px]">Client Coordinates</h4>
              <div className="space-y-2 text-zinc-600 bg-zinc-50 p-3 rounded-xs border border-zinc-150">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-semibold text-zinc-850">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedOrder.customer_email}</span>
                </div>
                {selectedOrder.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 pt-1 border-t border-zinc-200 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{selectedOrder.shipping_address}</span>
                </div>
              </div>
            </div>

            {/* UPI Payment Verification */}
            <div className="space-y-3 text-xs font-sans border-t border-zinc-150 pt-4">
              <h4 className="font-bold text-zinc-700 uppercase tracking-wide text-[10px]">UPI Payment Verification</h4>
              <div className="space-y-2 text-zinc-650 bg-[#FAF7F2] p-3 rounded-xs border border-[#E6E0D5]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Transaction ID / UTR:</span>
                  <span className="font-mono font-bold text-brand-charcoal text-[11px] bg-white border border-zinc-200 px-2.5 py-0.5 rounded-sm">
                    {selectedOrder.payment_id || "None Provided"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-zinc-100">
                  <span>Match Status:</span>
                  <span className={selectedOrder.status === "paid" || selectedOrder.status === "shipped" ? "text-emerald-800 font-bold uppercase tracking-wider text-[9px]" : "text-amber-800 font-bold uppercase tracking-wider text-[9px]"}>
                    {selectedOrder.status === "paid" || selectedOrder.status === "shipped" ? "Verified & Confirmed" : "Pending Check"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3 border-t border-zinc-150 pt-4">
              <h4 className="font-bold text-zinc-700 uppercase tracking-wide text-[10px] font-sans">Purchase Summary</h4>
              <div className="divide-y divide-zinc-100 text-xs">
                {selectedOrder.items && selectedOrder.items.map((lineItem) => (
                  <div key={lineItem.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-serif text-zinc-800 font-bold block text-sm">
                        {lineItem.set_name || "Saree SKU Variant"}
                      </span>
                      <span className="text-[10px] text-zinc-500 block font-sans">
                        Color: {lineItem.color || "N/A"}
                      </span>
                      <span className="font-mono text-zinc-400 block text-[9px]">
                        SKU: {lineItem.sku || lineItem.item_id.substring(0, 8) + "..."}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 block text-[10px]">Qty: {lineItem.quantity}</span>
                      <span className="font-bold text-zinc-800">₹{lineItem.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-3 flex justify-between items-center text-sm font-serif text-zinc-800">
                  <span>Grand Total</span>
                  <span className="font-sans font-bold text-brand-ruby text-base">₹{selectedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Change Status Controls */}
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <h4 className="font-bold text-zinc-700 uppercase tracking-wide text-[10px] font-sans">Update Status Workflow</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, "paid")}
                  disabled={selectedOrder.status === "paid"}
                  className="py-2 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 rounded-sm hover:bg-emerald-50 text-emerald-800 disabled:opacity-40 disabled:bg-emerald-50/55 transition-colors"
                >
                  Mark Paid
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, "shipped")}
                  disabled={selectedOrder.status === "shipped"}
                  className="py-2 text-[10px] font-bold uppercase tracking-wider border border-blue-200 rounded-sm hover:bg-blue-50 text-blue-800 disabled:opacity-40 disabled:bg-blue-50/55 transition-colors"
                >
                  Mark Shipped
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
                  disabled={selectedOrder.status === "cancelled"}
                  className="py-2 text-[10px] font-bold uppercase tracking-wider border border-rose-200 rounded-sm hover:bg-rose-50 text-brand-ruby disabled:opacity-40 disabled:bg-rose-50/55 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-150 border border-zinc-250 rounded-sm p-8 text-center text-brand-muted h-64 flex flex-col items-center justify-center">
            <ReceiptText className="w-10 h-10 text-zinc-350 mb-2" />
            <p className="text-xs font-semibold uppercase tracking-wider">Select an order card to review details and shipment actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
