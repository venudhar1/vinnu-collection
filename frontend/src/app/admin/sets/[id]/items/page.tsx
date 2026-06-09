"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, Edit2, Trash2, ArrowLeft, Info, 
  Check, RefreshCcw, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

interface Item {
  id: string;
  set_id: string;
  color: string;
  sku: string;
  quantity: number;
  price: number;
  status: string; // available, sold, reserved
  item_metadata?: string; // JSON containing { material, notes, images }
}

interface SetItem {
  id: string;
  name: string;
  description?: string;
  total_items: number;
  total_available: number;
  total_sold: number;
}

export default function AdminItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: setId } = use(params);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [color, setColor] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(1200);
  const [status, setStatus] = useState("available");
  const [material, setMaterial] = useState("Silk");
  const [notes, setNotes] = useState("");
  const [imagesText, setImagesText] = useState(""); // Comma separated image URLs
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk operation states
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkQtyChange, setBulkQtyChange] = useState(0);

  useEffect(() => {
    const key = localStorage.getItem("admin_api_key");
    if (!key) {
      router.push("/admin/login");
    } else {
      setApiKey(key);
    }
  }, [router]);

  // Fetch Set Details
  const { data: setObj, isLoading: isSetLoading } = useQuery<SetItem>({
    queryKey: ["admin_set_detail", setId, apiKey],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/sets/${setId}`, {
        headers: { "x-api-key": apiKey! },
      });
      if (!res.ok) throw new Error("Failed to fetch set details");
      return res.json();
    },
    enabled: !!apiKey,
  });

  // Fetch Items Query
  const { data: items, isLoading: isItemsLoading } = useQuery<Item[]>({
    queryKey: ["admin_set_items", setId, apiKey],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/sets/${setId}/items`, {
        headers: { "x-api-key": apiKey! },
      });
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    enabled: !!apiKey,
  });

  // Create Item Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`http://localhost:8000/sets/${setId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to add color variant");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_set_items"] });
      queryClient.invalidateQueries({ queryKey: ["admin_set_detail"] });
      resetForm();
    },
    onError: (err) => {
      setFormError((err as Error).message);
    },
  });

  // Update Item Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { itemId: string; body: any }) => {
      const res = await fetch(`http://localhost:8000/sets/${setId}/items/${data.itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
        },
        body: JSON.stringify(data.body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update color variant");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_set_items"] });
      queryClient.invalidateQueries({ queryKey: ["admin_set_detail"] });
      resetForm();
    },
    onError: (err) => {
      setFormError((err as Error).message);
    },
  });

  // Delete Item Mutation
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`http://localhost:8000/sets/${setId}/items/${itemId}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey! },
      });
      if (!res.ok) throw new Error("Failed to delete variant");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_set_items"] });
      queryClient.invalidateQueries({ queryKey: ["admin_set_detail"] });
    },
  });

  // Bulk Mark Sold Mutation
  const bulkMarkSoldMutation = useMutation({
    mutationFn: async (itemsList: Array<{ set_id: string; item_id: string }>) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/bulk/mark-sold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
        },
        body: JSON.stringify({ items: itemsList }),
      });
      if (!res.ok) throw new Error("Bulk status update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_set_items"] });
      queryClient.invalidateQueries({ queryKey: ["admin_set_detail"] });
      setSelectedItemIds([]);
    },
  });

  // Bulk Quantity Adjust Mutation
  const bulkAdjustMutation = useMutation({
    mutationFn: async (adjustments: Array<{ item_id: string; quantity_change: number }>) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/bulk/adjust-inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
        },
        body: JSON.stringify({ adjustments }),
      });
      if (!res.ok) throw new Error("Bulk quantity adjustment failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_set_items"] });
      setSelectedItemIds([]);
      setBulkQtyChange(0);
    },
  });

  const resetForm = () => {
    setColor("");
    setSku("");
    setQuantity(1);
    setPrice(1200);
    setStatus("available");
    setMaterial("Silk");
    setNotes("");
    setImagesText("");
    setEditingItem(null);
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setColor(item.color);
    setSku(item.sku);
    setQuantity(item.quantity);
    setPrice(item.price);
    setStatus(item.status);

    // Parse metadata
    if (item.item_metadata) {
      try {
        const meta = JSON.parse(item.item_metadata);
        setMaterial(meta.material || "Silk");
        setNotes(meta.notes || "");
        if (meta.images && Array.isArray(meta.images)) {
          setImagesText(meta.images.join(", "));
        } else {
          setImagesText("");
        }
      } catch {
        setMaterial("Silk");
        setNotes("");
        setImagesText("");
      }
    } else {
      setMaterial("Silk");
      setNotes("");
      setImagesText("");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!color.trim() || !sku.trim()) {
      setFormError("Color and SKU are required fields.");
      return;
    }

    const imagesList = imagesText
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload = {
      color,
      sku,
      quantity,
      price,
      status,
      metadata: {
        material,
        notes,
        images: imagesList,
      },
    };

    if (editingItem) {
      updateMutation.mutate({ itemId: editingItem.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (itemId: string) => {
    if (confirm("Remove this color variant from the database?")) {
      deleteMutation.mutate(itemId);
    }
  };

  const handleSelectToggle = (itemId: string) => {
    setSelectedItemIds((prev) => 
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (!items) return;
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  };

  const handleBulkMarkSold = () => {
    if (selectedItemIds.length === 0) return;
    const itemsList = selectedItemIds.map((itemId) => ({
      set_id: setId,
      item_id: itemId,
    }));
    bulkMarkSoldMutation.mutate(itemsList);
  };

  const handleBulkAdjustQty = () => {
    if (selectedItemIds.length === 0 || bulkQtyChange === 0) return;
    const adjustments = selectedItemIds.map((itemId) => ({
      item_id: itemId,
      quantity_change: bulkQtyChange,
    }));
    bulkAdjustMutation.mutate(adjustments);
  };

  if (isSetLoading || isItemsLoading || !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">Loading collection details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Go Back */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/sets"
            className="p-2 border border-zinc-200 hover:bg-zinc-100 rounded-md transition-colors text-zinc-500 hover:text-brand-charcoal"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-serif text-zinc-800">{setObj?.name}</h2>
            <p className="text-xs text-brand-muted font-sans font-medium">{setObj?.description || "No description provided."}</p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            // Pre-fill a template SKU based on set name prefix
            const cleanPrefix = (setObj?.name || "SET").substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "S");
            setSku(`${cleanPrefix}-${Math.floor(100 + Math.random() * 900)}`);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-charcoal text-white px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-brand-gold" />
          Add Color SKU
        </button>
      </div>

      {/* Editor Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white p-8 rounded-sm border border-[#E6E0D5] w-full max-w-lg space-y-6 shadow-xl overflow-y-auto max-h-[90vh] animate-slide-up">
            <h3 className="font-serif text-lg text-brand-charcoal">
              {editingItem ? "Edit Color Variant SKU" : "Add Color Variant SKU"}
            </h3>

            {formError && (
              <p className="text-xs font-bold text-brand-ruby bg-rose-50 p-2.5 border border-rose-200">{formError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Saree Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Deep Red, Mustard Gold"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Unique SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. BAN-RED-001"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Quantity (Stock)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Price (INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs h-8"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Material / Fabric</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. Pure Silk, Katan Silk, Zari Embroidery"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Image URLs (Comma Separated)</label>
                <textarea
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="https://example.com/saree1.jpg, https://example.com/saree2.jpg"
                  rows={2}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Merchandising Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add specific notes about the design, weave history, or care guidelines..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-xs"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-[#E6E0D5] text-brand-muted hover:text-brand-charcoal rounded-sm font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 bg-brand-charcoal hover:bg-zinc-800 text-white rounded-sm font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {editingItem ? "Save Changes" : "Add SKU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Operations Toolbar */}
      {selectedItemIds.length > 0 && (
        <div className="bg-brand-cream border border-brand-gold/40 p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-charcoal text-brand-gold">
              {selectedItemIds.length} Selected
            </span>
            <span className="text-brand-charcoal font-semibold">Bulk Actions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBulkMarkSold}
              disabled={bulkMarkSoldMutation.isPending}
              className="flex items-center gap-1.5 bg-brand-ruby text-white px-3 py-2 rounded-xs font-bold uppercase tracking-wider hover:bg-rose-950 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Mark Sold
            </button>

            <div className="flex items-center gap-2 border border-[#E6E0D5] bg-white rounded-xs p-1">
              <input
                type="number"
                value={bulkQtyChange}
                onChange={(e) => setBulkQtyChange(Number(e.target.value))}
                className="w-12 text-center py-1 text-xs focus:outline-hidden"
                placeholder="0"
              />
              <button
                onClick={handleBulkAdjustQty}
                disabled={bulkAdjustMutation.isPending || bulkQtyChange === 0}
                className="flex items-center gap-1 bg-brand-charcoal text-white px-3 py-1.5 rounded-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-40"
              >
                <RefreshCcw className="w-3 h-3" />
                Adjust Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white border border-zinc-200 rounded-sm shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-600">
            <thead className="bg-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 w-4">
                  <input
                    type="checkbox"
                    checked={items && items.length > 0 && selectedItemIds.length === items.length}
                    onChange={handleSelectAll}
                    className="rounded-xs border-[#E6E0D5] focus:ring-brand-gold text-brand-charcoal"
                  />
                </th>
                <th className="px-6 py-4">Saree SKU</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4 text-center">Available Stock</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Material & Media</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium">
              {items && items.length > 0 ? (
                items.map((item) => {
                  let materialName = "Silk";
                  let hasImages = false;

                  if (item.item_metadata) {
                    try {
                      const meta = JSON.parse(item.item_metadata);
                      materialName = meta.material || "Silk";
                      hasImages = meta.images && meta.images.length > 0;
                    } catch {}
                  }

                  return (
                    <tr key={item.id} className={`hover:bg-zinc-50 transition-colors ${
                      selectedItemIds.includes(item.id) ? "bg-[#FAF7F2]" : ""
                    }`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => handleSelectToggle(item.id)}
                          className="rounded-xs border-[#E6E0D5] focus:ring-brand-gold text-brand-charcoal"
                        />
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-zinc-700 text-sm">{item.sku}</td>
                      <td className="px-6 py-4 font-serif text-sm">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-4 h-4 rounded-full border border-zinc-200 flex-shrink-0"
                            style={{ backgroundColor: item.color.toLowerCase() }}
                          />
                          {item.color}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-sans font-bold text-zinc-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-sans font-bold text-zinc-800">₹{item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          item.status === "available" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                            : item.status === "sold"
                            ? "bg-rose-50 text-brand-ruby border-rose-100"
                            : "bg-amber-50 text-brand-marigold border-amber-100"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="text-zinc-500 font-sans">{materialName}</div>
                        {hasImages && (
                          <div className="flex items-center gap-1 text-[10px] text-brand-gold font-sans font-bold">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Media attached
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 text-zinc-400 hover:text-brand-gold hover:bg-zinc-100 rounded-md transition-colors"
                            title="Edit Variant Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-zinc-400 hover:text-brand-ruby hover:bg-zinc-100 rounded-md transition-colors"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-brand-muted">
                    <Info className="w-10 h-10 text-[#E6E0D5] mx-auto mb-2" />
                    No color SKU variants are configured for this saree collection yet.
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
