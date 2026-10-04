"use client";

import React from "react";
import {
  Layers,
  Flame,
  Filter,
  Sparkles,
  Droplets,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { useOrder } from "@/context/OrderContext";

export default function CeramicsSection() {
  const { openOrderModal } = useOrder();
  const ceramicProduct =
    PRODUCTS.find((p) => p.category === "ceramics") || PRODUCTS[1];

  return (
    <section id="ceramics" className="py-20 bg-[#F6F2EA] border-b border-[#D8CBB6]/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#181A1D] text-[#B8935A] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Studio Ceramics & High-Fire Glazes</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#181A1D] tracking-tight">
            Predictable Flux for Art That Endures
          </h2>
          <p className="text-sm sm:text-base text-[#6B7178]">
            Every studio potter knows the heartbreak of variable fireplace ash: unpredictable fluxing, pinholing, and blistering. Ember Dust is double-washed, kiln-desiccated, and screened through 100-mesh brass wire.
          </p>
        </div>

        {/* 3 Studio Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 p-7 rounded-3xl border border-[#D8CBB6] space-y-4 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#B8935A]/15 text-[#B8935A] flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#181A1D]">
              100-Mesh Sieve Precision
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
              No unburnt charcoal chunks or silica pebbles to ruin your bisque. Our ash passes through pharmaceutical-grade vibrating sieves for micro-fine slurry suspension.
            </p>
          </div>

          <div className="bg-white/80 p-7 rounded-3xl border border-[#D8CBB6] space-y-4 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#A4553A]/15 text-[#A4553A] flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#181A1D]">
              Cone 8 to 11 High-Fire Melt
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
              With 38% active calcium oxide (CaO) and natural alkaline eutectic matrices, our ash melts into a fluid, buttery glass between 1240°C and 1300°C in reduction or oxidation.
            </p>
          </div>

          <div className="bg-white/80 p-7 rounded-3xl border border-[#D8CBB6] space-y-4 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#181A1D]/10 text-[#181A1D] flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#181A1D]">
              Caustic-Neutralized Washing
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
              Pre-washed to remove excess harsh soluble lye (KOH) that irritates potters’ hands and causes flocculation in bucket glazes, then re-dried for shelf stability.
            </p>
          </div>
        </div>

        {/* Glaze Showcase Cards */}
        <div className="bg-[#181A1D] text-[#EDE6DA] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8935A]">
                Formulation Guide
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Classic Wood Ash Glaze Recipes
              </h3>
            </div>
            <button
              onClick={() => openOrderModal(ceramicProduct, 5)}
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-3 rounded-full text-xs font-extrabold transition-all shadow-lg hover:shadow-green-500/20"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>⚡ Buy Studio Ash (5kg @ ₹725)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Celadon */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#25D366]">
                Reduction Celadon
              </div>
              <h4 className="text-lg font-bold text-white">
                Pale Olive Wood-Ash Celadon
              </h4>
              <p className="text-xs text-[#8E959E]">
                Soft jade-green optical depth with subtle micro-crazing over porcelain or stoneware body.
              </p>
              <div className="text-[11px] bg-black/40 rounded-xl p-3 font-mono text-white/90 space-y-1">
                <div>• Ember Dust Ash: 40%</div>
                <div>• Potash Feldspar: 40%</div>
                <div>• Ball Clay / Kaolin: 20%</div>
                <div>• Red Iron Oxide: 1.2%</div>
              </div>
            </div>

            {/* Tenmoku */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#B8935A]">
                Crystalline & Metallic
              </div>
              <h4 className="text-lg font-bold text-white">
                Tenmoku Oil-Spot Glaze
              </h4>
              <p className="text-xs text-[#8E959E]">
                Mirror-black glass breaking to burnt russet and amber along rims and throwing ridges.
              </p>
              <div className="text-[11px] bg-black/40 rounded-xl p-3 font-mono text-white/90 space-y-1">
                <div>• Ember Dust Ash: 30%</div>
                <div>• Silica (Quartz): 30%</div>
                <div>• Feldspar (Custer/Potash): 30%</div>
                <div>• Red Iron Oxide: 8.5%</div>
              </div>
            </div>

            {/* Nuka */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#DCBC85]">
                Opalescent Matte
              </div>
              <h4 className="text-lg font-bold text-white">
                Milky White Nuka Satin
              </h4>
              <p className="text-xs text-[#8E959E]">
                Tactile, cloud-like satin melt with delicate bluish gas-reduction phase separation.
              </p>
              <div className="text-[11px] bg-black/40 rounded-xl p-3 font-mono text-white/90 space-y-1">
                <div>• Ember Dust Ash: 50%</div>
                <div>• Silica 200-Mesh: 40%</div>
                <div>• Kaolin: 10%</div>
                <div>• Firing: Cone 10 (1280°C)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
