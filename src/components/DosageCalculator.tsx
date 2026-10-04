"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { useOrder } from "@/context/OrderContext";

export default function DosageCalculator() {
  const [calculationMode, setCalculationMode] = useState<"area" | "pots">("area");
  const [areaSize, setAreaSize] = useState<number>(25); // in sq meters
  const [potCount, setPotCount] = useState<number>(12);
  const [soilType, setSoilType] = useState<"acidic" | "neutral" | "heavy_clay">("acidic");
  const { openOrderModal } = useOrder();

  let recommendedKg = 1;

  if (calculationMode === "area") {
    const ratePerSqMeter =
      soilType === "heavy_clay" ? 0.09 : soilType === "acidic" ? 0.08 : 0.055;
    recommendedKg = Math.max(1, Math.round(areaSize * ratePerSqMeter * 10) / 10);
  } else {
    recommendedKg = Math.max(1, Math.round((potCount * 0.02 * 2) * 10) / 10);
  }

  const roundedOrderQty = Math.max(1, Math.ceil(recommendedKg));
  const gardenProduct = PRODUCTS[0];

  return (
    <section id="dosage" className="py-20 bg-[#EDE6DA]/60 border-b border-[#D8CBB6]/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white/90 border border-[#D8CBB6] rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B8935A]">
              <Calculator className="w-3.5 h-3.5" />
              <span>Precise Agronomy Tool</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#181A1D] tracking-tight">
              Soil Application Dosage Calculator
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7178]">
              Wood ash is potent natural mineral fertilizer. Calculate the exact safe application rate for your garden size or container pots to avoid over-alkalizing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Input Controls */}
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex p-1 bg-[#EDE6DA] border border-[#D8CBB6] rounded-2xl">
                <button
                  onClick={() => setCalculationMode("area")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    calculationMode === "area"
                      ? "bg-[#181A1D] text-white shadow-sm"
                      : "text-[#6B7178] hover:text-[#181A1D]"
                  }`}
                >
                  Garden Bed / Lawn Area
                </button>
                <button
                  onClick={() => setCalculationMode("pots")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    calculationMode === "pots"
                      ? "bg-[#181A1D] text-white shadow-sm"
                      : "text-[#6B7178] hover:text-[#181A1D]"
                  }`}
                >
                  Potted Plants & Terrace
                </button>
              </div>

              {calculationMode === "area" ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#3B4046]">
                    <label>Garden Bed Area (Square Metres):</label>
                    <span className="text-base text-[#181A1D] font-extrabold">
                      {areaSize} m² (approx {Math.round(areaSize * 10.764)} sq ft)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={areaSize}
                    onChange={(e) => setAreaSize(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#8E959E] font-medium">
                    <span>5 m² (Kitchen Garden)</span>
                    <span>50 m² (Backyard)</span>
                    <span>200 m² (Orchard)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#3B4046]">
                    <label>Number of 8"–14" Container Pots:</label>
                    <span className="text-base text-[#181A1D] font-extrabold">
                      {potCount} pots
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    step="2"
                    value={potCount}
                    onChange={(e) => setPotCount(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#8E959E] font-medium">
                    <span>4 pots (Balcony)</span>
                    <span>25 pots (Terrace)</span>
                    <span>100 pots (Nursery)</span>
                  </div>
                </div>
              )}

              {/* Soil Condition Selector */}
              {calculationMode === "area" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7178]">
                    Current Soil Condition:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSoilType("acidic")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        soilType === "acidic"
                          ? "bg-[#B8935A] text-white border-[#B8935A]"
                          : "bg-white border-[#D8CBB6] text-[#3B4046] hover:bg-white"
                      }`}
                    >
                      Acidic Soil
                      <span className="block text-[10px] font-normal opacity-80">(pH &lt; 6.0)</span>
                    </button>
                    <button
                      onClick={() => setSoilType("neutral")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        soilType === "neutral"
                          ? "bg-[#B8935A] text-white border-[#B8935A]"
                          : "bg-white border-[#D8CBB6] text-[#3B4046] hover:bg-white"
                      }`}
                    >
                      Balanced Loam
                      <span className="block text-[10px] font-normal opacity-80">(pH 6.5–7.0)</span>
                    </button>
                    <button
                      onClick={() => setSoilType("heavy_clay")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        soilType === "heavy_clay"
                          ? "bg-[#B8935A] text-white border-[#B8935A]"
                          : "bg-white border-[#D8CBB6] text-[#3B4046] hover:bg-white"
                      }`}
                    >
                      Heavy Clay
                      <span className="block text-[10px] font-normal opacity-80">(High density)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation Result Card */}
            <div className="bg-[#181A1D] text-[#EDE6DA] rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5 shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8935A]">
                Recommended Dose
              </span>

              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white flex items-baseline gap-2">
                  <span>{recommendedKg}</span>
                  <span className="text-xl sm:text-2xl text-[#B8935A] font-bold">
                    kg of Pure Ash
                  </span>
                </div>
                <p className="text-xs text-[#8E959E] mt-1">
                  Ideal seasonal quantity for optimum flowering and microbial life without excess salt build-up.
                </p>
              </div>

              <div className="space-y-2 text-xs text-white/80 border-t border-white/10 pt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <span>
                    Rake gently into the top 2 inches of soil or sprinkle before watering.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <span>
                    Re-apply a light dusting after 3 to 4 months during heavy fruiting.
                  </span>
                </div>
              </div>

              <button
                onClick={() => openOrderModal(gardenProduct, roundedOrderQty)}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-4 px-5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-green-500/30 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>⚡ Order Recommended {roundedOrderQty} kg Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
