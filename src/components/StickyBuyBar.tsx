"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, ShieldCheck } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { calcPrice } from "@/lib/pricing";

export default function StickyBuyBar() {
  const { openOrderModal, selectedProduct } = useOrder();
  const { config } = useSiteConfig();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 320px
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  // Compute pricing for 5kg default pack
  const pricing = calcPrice(5, selectedProduct.basePrice, selectedProduct.tiers);

  return (
    <aside
      aria-label="Quick order bar"
      className="fixed z-40 transition-all duration-300 font-sans
        bottom-0 left-0 right-0 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-xl
        animate-slide-up"
    >
      <div className="bg-[#181A1D]/95 text-white backdrop-blur-xl border-t sm:border border-white/20 sm:rounded-full px-4 py-2.5 sm:px-6 sm:py-3 shadow-2xl flex items-center justify-between gap-3 sm:gap-6 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:pb-3">
        {/* Product Photo & Details */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-[#B8935A]/60 shadow-md bg-black shrink-0">
            <Image
              src={selectedProduct.image || "/logo.jpg"}
              alt={selectedProduct.name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
              <span className="truncate max-w-[150px] sm:max-w-[220px]">{selectedProduct.name}</span>
              <span className="hidden sm:inline-block text-[9px] bg-[#25D366]/20 text-[#25D366] px-1.5 py-0.5 rounded font-extrabold shrink-0">
                SAVE 20%
              </span>
            </div>
            <div className="text-[11px] text-[#8E959E] truncate">
              ₹{pricing.total} for 5 kg · <strong className="text-[#25D366]">Free Delivery</strong>
            </div>
          </div>
        </div>

        {/* Primary CTA Buy Now Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openOrderModal(selectedProduct, 5)}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>⚡ Buy Now</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
