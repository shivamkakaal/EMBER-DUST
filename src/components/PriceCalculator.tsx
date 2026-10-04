"use client";

import React, { useState, useId } from "react";
import Image from "next/image";
import {
  Sparkles,
  Percent,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Scale,
  Leaf,
  Layers,
  Zap,
} from "lucide-react";
import { PRODUCTS, Product } from "@/lib/products";
import {
  calcPrice,
  sliderToWeight,
  weightToSlider,
} from "@/lib/pricing";
import { useOrder } from "@/context/OrderContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

interface PriceCalculatorProps {
  initialProductSlug?: string;
  className?: string;
}

export default function PriceCalculator({
  initialProductSlug,
  className = "",
}: PriceCalculatorProps) {
  const sliderId = useId();
  const inputId = useId();
  const { openOrderModal } = useOrder();
  const { config } = useSiteConfig();

  const productList: Product[] = (config.products && config.products.length > 0 ? config.products : PRODUCTS).map((cp) => {
    const base = PRODUCTS.find((p) => p.slug === cp.slug || p.id === cp.id) || PRODUCTS[0];
    return {
      ...base,
      ...cp,
      tiers: base.tiers,
      specifications: ("specs" in cp && cp.specs) ? (cp.specs as any) : base.specifications,
    };
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    const found = productList.find((p) => p.slug === initialProductSlug);
    return found ? found.id : productList[0]?.id || PRODUCTS[0].id;
  });

  const selectedProduct = productList.find((p) => p.id === selectedProductId) || productList[0] || PRODUCTS[0];

  // Current weight in kg
  const [weight, setWeight] = useState<number>(5);
  // Slider position (0 - 100)
  const [sliderPos, setSliderPos] = useState<number>(() =>
    weightToSlider(5)
  );

  // Handle direct number input
  const handleWeightChange = (newWeight: number) => {
    const clamped = Math.max(1, Math.min(1000, newWeight));
    setWeight(clamped);
    setSliderPos(weightToSlider(clamped));
  };

  // Handle slider drag
  const handleSliderChange = (newSliderVal: number) => {
    setSliderPos(newSliderVal);
    const calculatedWeight = sliderToWeight(newSliderVal);
    setWeight(calculatedWeight);
  };

  // Handle preset chip click
  const handlePresetClick = (presetQty: number) => {
    setWeight(presetQty);
    setSliderPos(weightToSlider(presetQty));
  };

  // Calculate pricing
  const pricing = calcPrice(
    weight,
    selectedProduct.basePrice,
    selectedProduct.tiers
  );

  return (
    <div
      id="calculator"
      className={`glass border border-[#D8CBB6]/80 rounded-3xl p-6 sm:p-9 shadow-xl relative overflow-hidden font-sans ${className}`}
    >
      {/* Decorative accent glow */}
      <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#B8935A]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 border-b border-[#D8CBB6]/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181A1D] text-[#B8935A] text-xs font-bold tracking-wider uppercase mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Interactive Price Calculator</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#181A1D] tracking-tight">
            Calculate Quantity & Bulk Savings
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7178] mt-1">
            Choose your application. Instant tiered bulk discounts applied automatically.
          </p>
        </div>

        {/* Product Switcher Pills */}
        <div className="flex flex-wrap gap-1 p-1 bg-[#EDE6DA] rounded-2xl border border-[#D8CBB6] self-start sm:self-center">
          {productList.map((p) => {
            const isSelected = selectedProduct.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#181A1D] text-white shadow-sm"
                    : "text-[#6B7178] hover:text-[#181A1D]"
                }`}
              >
                {p.category === "gardening" ? (
                  <Leaf className="w-3.5 h-3.5 text-[#B8935A]" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-[#B8935A]" />
                )}
                <span className="truncate max-w-[120px] sm:max-w-none">{p.name.split(" ")[0]} {p.name.split(" ")[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Sliders, Inputs & Presets */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Product Headline */}
          <div className="bg-white/70 border border-[#D8CBB6]/80 rounded-2xl p-4 flex items-center gap-4">
            {selectedProduct.image && (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#D8CBB6] shadow-sm bg-black">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B7178] mb-1">
                <span>Selected Blend:</span>
                <span className="text-[#B8935A] font-extrabold">
                  Base ₹{selectedProduct.basePrice}/kg
                </span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[#181A1D] truncate">
                {selectedProduct.name}
              </div>
              <div className="text-xs text-[#6B7178] mt-0.5 line-clamp-1">
                {selectedProduct.shortDescription}
              </div>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7178] mb-2">
              Popular Order Sizes:
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedProduct.presetQuantities.map((preset) => {
                const isSelected = weight === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      isSelected
                        ? "bg-[#B8935A] text-white border-[#B8935A] shadow-sm"
                        : "bg-white/70 border-[#D8CBB6] text-[#3B4046] hover:bg-white hover:border-[#B8935A]"
                    }`}
                  >
                    {preset} kg
                  </button>
                );
              })}
              <button
                onClick={() => handlePresetClick(250)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  weight === 250
                    ? "bg-[#B8935A] text-white border-[#B8935A] shadow-sm"
                    : "bg-white/70 border-[#D8CBB6] text-[#3B4046] hover:bg-white hover:border-[#B8935A]"
                }`}
              >
                250 kg (Farm/Studio)
              </button>
            </div>
          </div>

          {/* Log-Scale Range Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#6B7178]">
              <label htmlFor={sliderId}>Fine Weight Adjustment (Log Scaled):</label>
              <span className="text-[#181A1D] font-extrabold">{weight} kg Selected</span>
            </div>
            <input
              id={sliderId}
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              aria-label="Weight in kilograms"
              aria-valuetext={`${weight} kilograms`}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8E959E] font-medium pt-1 px-1">
              <span>1 kg (Sample)</span>
              <span>25 kg (Grower)</span>
              <span>100 kg (Bulk)</span>
              <span>1000 kg (Estate)</span>
            </div>
          </div>

          {/* Direct Weight Input */}
          <div className="flex items-center gap-3 bg-[#EDE6DA]/80 border border-[#D8CBB6] rounded-2xl p-3">
            <span className="text-xs font-bold text-[#3B4046] pl-2 shrink-0">
              Exact Weight:
            </span>
            <div className="relative flex-1">
              <input
                id={inputId}
                type="number"
                min="1"
                max="1000"
                value={weight}
                onChange={(e) => handleWeightChange(Number(e.target.value))}
                className="w-full bg-white border border-[#D8CBB6] rounded-xl px-3 py-2 text-right text-lg font-extrabold text-[#181A1D] focus:outline-none focus:border-[#B8935A]"
              />
              <span className="absolute right-12 top-2.5 text-xs text-[#8E959E] font-bold pointer-events-none">
                kg
              </span>
            </div>
            <span className="text-xs text-[#6B7178] pr-2 shrink-0 hidden sm:inline">
              ({((weight * 2.20462)).toFixed(1)} lbs)
            </span>
          </div>
        </div>

        {/* Right Column: Dynamic Price Summary Card */}
        <div className="lg:col-span-5 bg-[#181A1D] text-[#EDE6DA] rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-6">
          {/* Subtle gold accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B8935A] via-[#E2D7C5] to-[#B8935A]" />

          {/* Pricing Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8935A]">
                Instant Live Quote
              </span>
              {pricing.discountPercentage > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-[#25D366]/20 text-[#25D366] px-2.5 py-0.5 rounded-full border border-[#25D366]/30">
                  <Percent className="w-3 h-3" />
                  <span>{pricing.discountPercentage}% OFF Base</span>
                </span>
              )}
            </div>

            {/* Total Price with Big Number */}
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl text-[#B8935A] font-bold">
                  ₹
                </span>
                <span>{pricing.total.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-xs text-[#8E959E] mt-1 flex items-center justify-between">
                <span>
                  Effective Rate: <strong className="text-white">₹{pricing.unit.toFixed(2)}/kg</strong>
                </span>
                <span>({weight} kg selected)</span>
              </div>
            </div>

            {/* Bulk Tier Notification Banner */}
            {pricing.tierLabel ? (
              <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#B8935A]">
                  <Sparkles className="w-4 h-4 text-[#B8935A]" />
                  <span>{pricing.tierLabel}</span>
                </div>
                {pricing.saving > 0 && (
                  <p className="text-xs text-white/80">
                    You save <strong>₹{pricing.saving.toLocaleString("en-IN")}</strong> compared to single kilo starter rate!
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-xs text-[#8E959E]">
                Add 5 kg or more to unlock volume bulk rate tier.
              </div>
            )}

            {/* Delivery & Assurance Perks */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#25D366]" />
                <span>
                  <strong className="text-[#25D366]">Free Doorstep Shipping Across India</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#B8935A]" />
                <span>Triple-Screened Clean Powder (Zero Debris)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8935A]" />
                <span>Pay on delivery via UPI/Cash after WhatsApp confirmation</span>
              </div>
            </div>
          </div>

          {/* Big Green Buy Now CTA Button */}
          <div>
            <button
              onClick={() => openOrderModal(selectedProduct, weight)}
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-4 px-6 rounded-2xl font-extrabold text-base shadow-xl hover:shadow-green-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-98"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>⚡ Buy Now · Total ₹{pricing.total.toLocaleString("en-IN")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-white/50 mt-2 font-medium">
              Takes 30 seconds · No advance payment needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
