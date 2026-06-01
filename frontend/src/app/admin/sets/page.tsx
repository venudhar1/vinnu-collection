"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Edit2, Trash2, FolderHeart, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SetItem {
  id: string;
  name: string;
  description?: string;
  total_items: number;
  total_available: number;
  total_sold: number;
  created_at: string;
}

export default function AdminSetsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<SetItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("admin_api_key");
    if (!key) {
      router.push("/admin/login");
    } else {
      setApiKey(key);
    }
  }, [router]);

  // Fetch Sets Query
  const { data: sets, isLoading } = useQuery<SetItem[]>({
    queryKey: ["admin_sets", apiKey],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/sets", {
        headers: { "x-api-key": apiKey! },
      });
      if (!res.ok) throw new Error("Failed to fetch sets");
      return res.json();
    },
    enabled: !!apiKey,
  });

  // Create Set Mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await fetch("http://localhost:8000/sets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create set");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_sets"] });
      resetForm();
    },
    onError: (err) => {
      setFormError((err as Error).message);
    },
  });

  // Update Set Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) => {
      const res = await fetch(`http://localhost:8000/sets/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
        },
        body: JSON.stringify({ name: data.name, description: data.description }),
      });
      if (!res.ok) throw new Error("Failed to update set");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_sets"] });
      resetForm();
    },
    onError: (err) => {
      setFormError((err as Error).message);
    },
  });

  // Delete Set Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:8000/sets/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey! },
      });
      if (!res.ok) throw new Error("Failed to delete set");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_sets"] });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingSet(null);
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleEditClick = (set: SetItem) => {
    setEditingSet(set);
    setName(set.name);
    setDescription(set.description || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Collection name is required.");
      return;
    }
    if (editingSet) {
      updateMutation.mutate({ id: editingSet.id, name, description });
    } else {
      createMutation.mutate({ name, description });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this collection and all its saree items?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading || !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">Loading collections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-brand-muted font-sans font-medium">Add, edit, or delete saree collection sets.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-charcoal text-white px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-brand-gold" />
          Create Collection
        </button>
      </div>

      {/* Editor Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white p-8 rounded-sm border border-[#E6E0D5] w-full max-w-md space-y-6 shadow-xl animate-slide-up">
            <h3 className="font-serif text-lg text-brand-charcoal">
              {editingSet ? "Modify Saree Collection" : "Create Saree Collection"}
            </h3>
            
            {formError && (
              <p className="text-xs font-bold text-brand-ruby bg-rose-50 p-2.5 border border-rose-200">{formError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Collection Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Banarasi Silk, Kanchipuram Brocade"
                  className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal tracking-wide uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the fabric, design aesthetic, and region origins..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold text-sm"
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
                  {editingSet ? "Save Changes" : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sets && sets.length > 0 ? (
          sets.map((set) => (
            <div
              key={set.id}
              className="bg-white border border-zinc-200 rounded-sm shadow-xs hover:border-brand-gold/60 transition-all flex flex-col justify-between"
            >
              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-brand-cream border border-[#E6E0D5] rounded-sm text-brand-gold">
                    <FolderHeart className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClick(set)}
                      className="p-1.5 text-zinc-400 hover:text-brand-gold hover:bg-zinc-100 rounded-md transition-colors"
                      title="Edit Collection Name/Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(set.id)}
                      className="p-1.5 text-zinc-400 hover:text-brand-ruby hover:bg-zinc-100 rounded-md transition-colors"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-base text-zinc-800 truncate">{set.name}</h4>
                  <p className="text-xs text-brand-muted font-sans line-clamp-2 h-8 leading-relaxed">
                    {set.description || "No description provided for this collection."}
                  </p>
                </div>

                {/* Statistics Row */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-zinc-100 text-[10px] font-sans font-bold uppercase text-zinc-400">
                  <div className="bg-zinc-50 p-2 rounded-xs">
                    <span className="block text-zinc-700 text-xs font-semibold">{set.total_items}</span>
                    Total Colors
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-xs text-brand-emerald">
                    <span className="block text-emerald-800 text-xs font-bold">{set.total_available}</span>
                    In Stock
                  </div>
                  <div className="bg-rose-50/50 p-2 rounded-xs text-brand-ruby">
                    <span className="block text-rose-800 text-xs font-bold">{set.total_sold}</span>
                    Units Sold
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="border-t border-zinc-100 px-6 py-4 bg-zinc-50">
                <Link
                  href={`/admin/sets/${set.id}/items`}
                  className="flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider text-brand-gold hover:text-yellow-600 transition-colors"
                >
                  Manage Color SKUs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-12 border border-zinc-200 text-center rounded-sm space-y-4">
            <Info className="w-12 h-12 text-[#E6E0D5] mx-auto" />
            <p className="text-sm font-medium text-brand-muted">No saree collections exist. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
