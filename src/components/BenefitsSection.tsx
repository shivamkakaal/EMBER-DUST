"use client";

import React from "react";
import {
  Leaf,
  ShieldAlert,
  Sparkles,
  Droplets,
  Sun,
  CheckCircle2,
  XCircle,
  Bug,
  Activity,
} from "lucide-react";

export default function BenefitsSection() {
  return (
    <section id="gardening" className="py-20 bg-[#EDE6DA]/45 border-y border-[#D8CBB6]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8935A]">
            Agronomy & Soil Science
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1F2124]">
            Why Modern Gardeners Rely on Wood Ash
          </h2>
          <p className="text-sm sm:text-base text-[#6B7178] font-light">
            Before synthetic petrochemical fertilizers existed, ash was the farmer’s most prized soil amendment. Ember Dust delivers raw, unadulterated botanical minerals in balanced micro-crystalline form.
          </p>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Pillar 1 */}
          <div className="glass p-6 sm:p-7 rounded-3xl border border-[#D8CBB6] space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#B8935A]/15 text-[#B8935A] flex items-center justify-center">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#1F2124]">
              Potassium (K₂O) Surge
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
              Contains 7% to 10% naturally water-soluble potassium. Accelerates blossom setting, thickens fruit skins, and prevents blossom-end rot in tomatoes and eggplants.
            </p>
            <div className="text-[11px] text-[#B8935A] font-semibold tracking-wide uppercase pt-2 border-t border-[#D8CBB6]/40">
              No Chlorine or Salts
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="glass p-6 sm:p-7 rounded-3xl border border-[#D8CBB6] space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#1F2124]">
              Gentle pH Neutralizer
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
              With a solution pH of 9.8–10.4, wood ash acts twice as fast as agricultural lime (CaCO₃) to neutralize sour, acidic soils without hardening the soil structure.
            </p>
            <div className="text-[11px] text-[#25D366] font-semibold tracking-wide uppercase pt-2 border-t border-[#D8CBB6]/40">
              Optimal pH 6.5–7.0
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="glass p-6 sm:p-7 rounded-3xl border border-[#D8CBB6] space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#A4553A]/15 text-[#A4553A] flex items-center justify-center">
              <Bug className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#1F2124]">
              Slug & Snail Mineral Shield
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
              Dry ash particles irritate the soft bellies of gastropods and cutworms, creating an impenetrable chemical-free perimeter around tender brassicas and seedlings.
            </p>
            <div className="text-[11px] text-[#A4553A] font-semibold tracking-wide uppercase pt-2 border-t border-[#D8CBB6]/40">
              100% Non-Toxic
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="glass p-6 sm:p-7 rounded-3xl border border-[#D8CBB6] space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#1F2124]/10 text-[#1F2124] flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#1F2124]">
              13+ Trace Micronutrients
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
              Loaded with bio-available Calcium (30%), Magnesium (4%), Phosphorus, Iron, Boron, and Silica that commercial N-P-K bags omit completely.
            </p>
            <div className="text-[11px] text-[#1F2124] font-semibold tracking-wide uppercase pt-2 border-t border-[#D8CBB6]/40">
              Full Spectrum Soil Food
            </div>
          </div>
        </div>

        {/* Companion Planting Guide: Who loves it vs Who avoids it */}
        <div className="bg-[#1F2124] text-[#EDE6DA] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8935A]">
              Practical Garden Application
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-semibold text-white mt-1">
              Which Plants Crave Ember Dust?
            </h3>
            <p className="text-xs sm:text-sm text-[#8E959E] mt-2">
              Because wood ash elevates pH and is alkaline, apply it generously to potassium-hungry, lime-loving vegetables while avoiding acid-soil specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plants that LOVE ash */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 text-[#25D366] font-semibold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Heavy Feeders That Love Wood Ash</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#B8935A] font-bold">🍅 Tomatoes & Peppers:</span>
                  <span>Huge potassium demand for flowering and blossom-end rot prevention.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8935A] font-bold">🧄 Garlic & Onions:</span>
                  <span>Promotes dense bulb formation and long shelf-life post harvest.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8935A] font-bold">🥦 Brassicas (Broccoli, Kale, Cabbage):</span>
                  <span>Prevents clubroot disease by maintaining higher alkaline soil pH.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8935A] font-bold">🌹 Rose Bushes & Fruit Trees:</span>
                  <span>Strengthens stems against wind breakage and powdery mildew fungal attacks.</span>
                </li>
              </ul>
            </div>

            {/* Plants to AVOID */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 text-[#A4553A] font-semibold text-base">
                <XCircle className="w-5 h-5" />
                <span>Acid-Loving Plants (Do NOT Apply)</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#A4553A] font-bold">🫐 Blueberries & Strawberries:</span>
                  <span>Require strongly acidic soil (pH 4.5–5.5). Wood ash raises pH too high.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4553A] font-bold">🥔 Potatoes:</span>
                  <span>Alkaline soil can encourage potato scab fungus; avoid direct furrow dusting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4553A] font-bold">🌺 Azaleas, Rhododendrons & Camellias:</span>
                  <span>Acid lovers that display iron chlorosis if soil pH climbs above 6.0.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4553A] font-bold">🌱 Fresh Seed Germination:</span>
                  <span>Keep concentrated ash away from sprouting seeds until true leaves emerge.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
