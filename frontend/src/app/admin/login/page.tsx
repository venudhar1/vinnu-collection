"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, Sparkles, Check } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem("admin_api_key")) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const verifyAndLogin = async (keyToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/sets", {
        headers: {
          "x-api-key": keyToVerify,
        },
      });

      if (response.ok) {
        localStorage.setItem("admin_api_key", keyToVerify);
        router.push("/admin/dashboard");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || "Authentication failed. Invalid API Key.");
      }
    } catch {
      setError("Cannot connect to backend server. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("Please enter your secret API key.");
      return;
    }
    verifyAndLogin(apiKey.trim());
  };

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/auth/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Local Staff App",
          scopes: "read,write,admin",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedKey(data.key);
        setApiKey(data.key); // Auto fill
      } else {
        setError("Failed to generate key. Ensure backend server is running.");
      }
    } catch {
      setError("Cannot connect to backend server. Make sure FastAPI is running on port 8000.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-sm border border-[#E6E0D5] shadow-xs">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-widest text-brand-charcoal">VINNU</h2>
          <p className="mt-2 text-xs font-sans tracking-widest text-brand-gold uppercase font-bold">
            Staff Portal Authentication
          </p>
          <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed">
            This portal is for staff only. Customer-facing login is available at <span className="font-semibold text-brand-charcoal">/shop/login</span>.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-sm bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-brand-ruby flex-shrink-0 mt-0.5" />
            <p className="font-sans font-medium">{error}</p>
          </div>
        )}

        {generatedKey && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Check className="w-4 h-4" />
              <span>API Key Generated Successfully!</span>
            </div>
            <p className="text-zinc-600 font-sans">Copy and save this key. It won&apos;t be displayed again:</p>
            <div className="p-2 bg-white rounded border border-emerald-100 font-mono text-[10px] select-all break-all text-brand-emerald">
              {generatedKey}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-xs font-semibold text-brand-charcoal tracking-wide uppercase">
              Secret API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                name="apiKey"
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_live_..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF7F2] border border-[#E6E0D5] rounded-sm focus:outline-hidden focus:border-brand-gold font-mono"
              />
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-sm text-xs font-bold uppercase tracking-wider text-white bg-brand-charcoal hover:bg-zinc-800 focus:outline-hidden transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Verifying Credentials..." : "Authenticate Session"}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E6E0D5]" />
          </div>
          <span className="relative px-3 bg-white text-[10px] uppercase font-bold tracking-wider text-brand-muted">
            First Time Setup?
          </span>
        </div>

        <button
          onClick={handleGenerateKey}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[#E6E0D5] rounded-sm text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-charcoal hover:border-brand-charcoal transition-all disabled:opacity-50 bg-[#FAF7F2]"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-swatch-pulse" />
          {isGenerating ? "Requesting Key..." : "Generate New API Key"}
        </button>
      </div>
    </div>
  );
}
