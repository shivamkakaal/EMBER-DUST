"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PRODUCTS, Product } from "@/lib/products";
import { Zap, ShieldCheck, Sparkles, Scale, Check, ShoppingCart, Info, Award } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { calcPrice } from "@/lib/pricing";

export default function ProductGrid() {
  const { openOrderModal } = useOrder();
  const { config } = useSiteConfig();

  // Keep track of selected weight for each product card
  const [selectedWeights, setSelectedWeights] = useState<Record<string, number>>({
    "33333333-3333-3333-3333-333333333333": 5, // 5kg default for Hardwood
    "44444444-4444-4444-4444-444444444444": 5, // 5kg default for Studio Glaze
    "55555555-5555-5555-5555-555555555555": 5, // 5kg default for Bio-Silica
  });

  const handleSelectWeight = (productId: string, weight: number) => {
    setSelectedWeights((prev) => ({ ...prev, [productId]: weight }));
  };

  const productList = config.products && config.products.length > 0 ? config.products : PRODUCTS;

  return (
    <section id="products" className="py-20 sm:py-28 bg-[#F6F2EA] border-b border-[#D8CBB6]/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181A1D] text-[#B8935A] text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#B8935A]" />
            <span>Small-Batch Reserve Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#181A1D] tracking-tight">
            Artisanal Ash Blends
          </h2>
          <p className="text-sm sm:text-base text-[#6B7178] leading-relaxed">
            Every kilo is independently lab-tested for heavy metals, moisture content, and particle uniformity. Shipped directly from the kiln in moisture-barrier sealed pouches across India.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {productList.map((customP) => {
            const baseProduct = PRODUCTS.find((p) => p.slug === customP.slug || p.id === customP.id) || PRODUCTS[0];
            const product: Product = {
              ...baseProduct,
              ...customP,
              specifications: (customP as any).specs || baseProduct.specifications,
            };
            const currentWeight = selectedWeights[product.id] || 5;
            const pricing = calcPrice(currentWeight, product.basePrice, product.tiers);
            const isDiscounted = pricing.discountPercentage > 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-[#D8CBB6] overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:border-[#B8935A]/80 transition-all duration-300 relative group"
              >
                <div>
                  {/* Product Image Showcase */}
                  <div
                    className="relative w-full h-[230px] sm:h-[280px] min-h-[220px] overflow-hidden bg-[#181A1D] border-b border-[#D8CBB6]/60 shrink-0"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="eager"
                      />
                    )}

                    {/* Gradient Overlay for subtle text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Top Floating Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4 bg-[#181A1D]/90 backdrop-blur-md text-[#B8935A] text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#B8935A]/50 shadow-md">
                        {product.badge}
                      </div>
                    )}

                    {/* In-Stock Floating Pill */}
                    <div className="absolute top-4 right-4">
                      {product.stockStatus === "in_stock" ? (
                        <div className="bg-emerald-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Ready to Ship</span>
                        </div>
                      ) : product.stockStatus === "low" ? (
                        <div className="bg-amber-950/80 backdrop-blur-md text-amber-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>Low Stock</span>
                        </div>
                      ) : (
                        <div className="bg-red-950/80 backdrop-blur-md text-red-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-500/40 flex items-center gap-1">
                          <span>Sold Out</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Category & Pack Title overlay at bottom of image */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B8935A] bg-[#181A1D]/80 px-2 py-0.5 rounded-md">
                          {product.categoryName}
                        </span>
                      </div>
                      <div className="text-right bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="text-[10px] text-white/70 block">From</span>
                        <span className="text-sm font-extrabold text-[#F5C26B]">₹{product.tiers[product.tiers.length - 1].price_per_unit}/kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Details Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#181A1D] group-hover:text-[#B8935A] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#6B7178] mt-1.5 leading-relaxed line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>

                    {/* Weight Pack Selector */}
                    <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#D8CBB6]/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#181A1D] flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-[#B8935A]" />
                          <span>Select Quantity:</span>
                        </span>
                        <span className="text-[11px] text-[#25D366] font-extrabold">
                          {isDiscounted ? `Save ${pricing.discountPercentage}%` : "Starter Pack"}
                        </span>
                      </div>

                      {/* Weight Chips */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {product.presetQuantities.map((qty) => {
                          const isSelected = currentWeight === qty;
                          return (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => handleSelectWeight(product.id, qty)}
                              className={`py-1.5 px-1 rounded-xl text-center text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-[#181A1D] text-[#F5C26B] shadow-md border border-[#B8935A]"
                                  : "bg-white text-[#3B4046] border border-[#D8CBB6]/60 hover:bg-[#EDE6DA]"
                              }`}
                            >
                              <span>{qty} {product.unit}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Live Price Calculation based on selected weight */}
                      <div className="pt-2 border-t border-[#D8CBB6]/50 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-[#8E959E]">
                            Order Total ({currentWeight}kg):
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-[#181A1D]">
                              ₹{pricing.total}
                            </span>
                            <span className="text-xs text-[#6B7178] font-medium">
                              (₹{pricing.unit}/{product.unit})
                            </span>
                          </div>
                        </div>

                        {pricing.saving > 0 && (
                          <div className="text-right">
                            <span className="inline-block bg-[#25D366]/15 text-[#188038] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#25D366]/30">
                              You Save ₹{pricing.saving}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Lab Specs Quick Pills */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7178] flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#B8935A]" />
                        <span>Certified Mineral Profile</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {product.specifications.slice(0, 4).map((spec, i) => (
                          <div
                            key={i}
                            className="bg-[#EDE6DA]/40 px-2.5 py-1.5 rounded-lg border border-[#D8CBB6]/50 flex flex-col"
                          >
                            <span className="text-[10px] text-[#6B7178] truncate">{spec.label}</span>
                            <span className="font-extrabold text-[#181A1D]">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Order Action Buttons */}
                <div className="p-6 pt-0 space-y-2">
                  <button
                    onClick={() => openOrderModal(product, currentWeight)}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 px-5 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>⚡ Buy Now ({currentWeight}kg • ₹{pricing.total})</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7178] px-1 pt-1">
                    <span className="flex items-center gap-1 text-[#25D366] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Free delivery over ₹999
                    </span>
                    <button
                      onClick={() => openOrderModal(product, currentWeight)}
                      className="text-[#181A1D] font-extrabold hover:text-[#B8935A] underline underline-offset-2"
                    >
                      WhatsApp Checkout →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
