"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Layers,
  Zap,
  Truck,
  HelpCircle,
} from "lucide-react";
import PriceCalculator from "./PriceCalculator";
import { useOrder } from "@/context/OrderContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Hero() {
  const [activePersona, setActivePersona] = useState<"gardening" | "ceramics">(
    "gardening"
  );
  const { openOrderModal } = useOrder();
  const { config } = useSiteConfig();
  const hero = config.hero;

  return (
    <section id="store" className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 font-sans">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#EDE6DA]/90 via-[#EDE6DA]/40 to-transparent -z-10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow & Badges */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDE6DA] border border-[#D8CBB6] text-[#3B4046] text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span className="uppercase tracking-[0.18em] text-[#B8935A]">
              {hero.eyebrow}
            </span>
          </div>

          {/* Main Modern Bold Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#181A1D] leading-[1.08]">
            {hero.headlinePart1} <br />
            <span className="text-[#B8935A]">
              {hero.headlineHighlight}
            </span>
            {hero.headlinePart2 && ` ${hero.headlinePart2}`}
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-[#6B7178] leading-relaxed max-w-2xl font-normal">
            {hero.subheadline}
          </p>

          {/* Direct Hero Quick Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            <button
              onClick={() => openOrderModal()}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 px-6 rounded-full font-extrabold text-sm shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{hero.primaryCtaText || "Buy Now"}</span>
            </button>

            <a
              href="#calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#181A1D] hover:bg-[#3B4046] text-white py-3.5 px-6 rounded-full font-bold text-sm transition-all"
            >
              <span>{hero.secondaryCtaText || "Custom Weight Calculator"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Value Assurance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#6B7178] pt-1">
            <span className="flex items-center gap-1.5 text-[#25D366]">
              <Truck className="w-3.5 h-3.5" />
              <span>{hero.badge1 || "Free Delivery Over ₹999"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#3B4046]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B8935A]" />
              <span>{hero.badge2 || "Pay on Delivery (UPI / COD)"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#3B4046]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
              <span>{hero.badge3 || "Lab Verified Pure"}</span>
            </span>
          </div>

          {/* Persona Toggle Bar (Gardener vs Ceramicist) */}
          <div className="inline-flex p-1.5 bg-[#EDE6DA] rounded-2xl border border-[#D8CBB6] shadow-sm mt-4">
            <button
              onClick={() => setActivePersona("gardening")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activePersona === "gardening"
                  ? "bg-[#181A1D] text-white shadow"
                  : "text-[#6B7178] hover:text-[#181A1D]"
              }`}
            >
              <Leaf className="w-4 h-4 text-[#25D366]" />
              <span>For Home Gardeners & Orchards</span>
            </button>
            <button
              onClick={() => setActivePersona("ceramics")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activePersona === "ceramics"
                  ? "bg-[#181A1D] text-white shadow"
                  : "text-[#6B7178] hover:text-[#181A1D]"
              }`}
            >
              <Layers className="w-4 h-4 text-[#B8935A]" />
              <span>For Ceramicists & Studio Potters</span>
            </button>
          </div>

          {/* Persona Dynamic Micro-Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-2">
            {activePersona === "gardening" ? (
              <>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#B8935A] text-xl font-extrabold">7–10%</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    Soluble Potash (K₂O) for Fruit & Root Growth
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#B8935A] text-xl font-extrabold">10.2 pH</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    Natural Alkaline Buffer for Acidic Soils
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#25D366] text-xl font-extrabold">Slug Shield</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    Mineral Desiccant Barrier Against Slugs & Snails
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#181A1D] text-xl font-extrabold">Zero Chem</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    100% Raw Biomass, Zero Treated Timber
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#B8935A] text-xl font-extrabold">100 Mesh</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    Double-Sieved Ultra-Fine Powder
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#B8935A] text-xl font-extrabold">Cone 8–11</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    Reliable High-Fire Melting Point (1240–1300°C)
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#B8935A] text-xl font-extrabold">38% CaO</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    Natural Calcium Flux for Celadon & Tenmoku
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D8CBB6] text-left shadow-sm">
                  <div className="text-[#25D366] text-xl font-extrabold">Pre-Washed</div>
                  <div className="text-[11px] text-[#6B7178] font-bold leading-tight">
                    Oven-Desiccated, Minimal LOI (&lt; 4.2%)
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Embedded Interactive Price Calculator */}
        <div className="mt-4">
          <PriceCalculator
            initialProductSlug={
              activePersona === "gardening"
                ? "pure-hardwood-ash"
                : "studio-glaze-ash"
            }
          />
        </div>
      </div>
    </section>
  );
}
