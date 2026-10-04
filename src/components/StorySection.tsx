"use client";

import React from "react";
import { TreePine, Flame, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";

import { useSiteConfig } from "@/context/SiteConfigContext";

export default function StorySection() {
  const { config } = useSiteConfig();
  const story = config.story;

  return (
    <section id="story" className="py-20 bg-[#EDE6DA]/45 border-b border-[#D8CBB6]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8935A]">
              {story.eyebrow || "Small-Batch Provenance"}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1F2124] leading-tight">
              {story.headline}
            </h2>

            <p className="text-sm sm:text-base text-[#6B7178] leading-relaxed font-light">
              {story.paragraph1}
            </p>

            <p className="text-sm sm:text-base text-[#3B4046] leading-relaxed">
              {story.paragraph2}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="glass p-4 rounded-2xl border border-[#D8CBB6]">
                <TreePine className="w-5 h-5 text-[#B8935A] mb-2" />
                <div className="font-serif text-base font-semibold text-[#1F2124]">
                  Zero Painted Wood
                </div>
                <div className="text-[11px] text-[#6B7178] mt-0.5">
                  100% bark and heartwood, zero chemicals.
                </div>
              </div>

              <div className="glass p-4 rounded-2xl border border-[#D8CBB6]">
                <Flame className="w-5 h-5 text-[#A4553A] mb-2" />
                <div className="font-serif text-base font-semibold text-[#1F2124]">
                  Thermal Clean Fire
                </div>
                <div className="text-[11px] text-[#6B7178] mt-0.5">
                  Complete combustion with lowest carbon residue.
                </div>
              </div>

              <div className="glass p-4 rounded-2xl border border-[#D8CBB6]">
                <Sparkles className="w-5 h-5 text-[#25D366] mb-2" />
                <div className="font-serif text-base font-semibold text-[#1F2124]">
                  100-Mesh Sieve
                </div>
                <div className="text-[11px] text-[#6B7178] mt-0.5">
                  Velvety micro-powder, zero grit or stones.
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 bg-[#1F2124] text-[#EDE6DA] rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#B8935A]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B8935A]">
                Quality Assurance Seal
              </span>
              <h3 className="font-serif text-2xl font-semibold text-white">
                The Ember Dust Standard
              </h3>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-white/80">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#B8935A] shrink-0 mt-0.5" />
                <span>
                  <strong>Independent Lab Verified:</strong> Screened for Arsenic, Cadmium, Lead, and Mercury. Guaranteed non-detectable.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#B8935A] shrink-0 mt-0.5" />
                <span>
                  <strong>Moisture Controlled:</strong> Desiccated below 1.5% moisture to prevent clumping, caking, or mold during transit.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#B8935A] shrink-0 mt-0.5" />
                <span>
                  <strong>Double Sealed Packaging:</strong> Multi-layer foil-lined kraft bags that keep ambient humid air away from the ash.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#B8935A] shrink-0 mt-0.5" />
                <span>
                  <strong>Fair Orchard Partnerships:</strong> Prunings purchased directly from smallholder orchard farmers in Himachal and Uttarakhand.
                </span>
              </li>
            </ul>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#8E959E]">
              <span>Small Batch No: ED-2026-HIM</span>
              <span className="text-[#25D366] font-semibold">100% Certified Organic Raw</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
