"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Menu, X, Sparkles, Zap, ArrowRight, Package } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openOrderModal } = useOrder();
  const { config } = useSiteConfig();

  const directChatUrl = buildWhatsAppUrl(
    config.whatsapp.number,
    config.whatsapp.greeting || "Hello Ember Dust 👋 I'd like to ask a quick question about your organic wood ash for gardening / ceramics."
  );

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 font-sans">
      {/* Top Announcement Bar - Ultra sleek on mobile */}
      {config.announcement.enabled && (
        <div className="bg-[#181A1D] text-[#EDE6DA] py-1 sm:py-2 px-3 sm:px-4 border-b border-white/10 text-center tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#B8935A] shrink-0 animate-pulse" />
            {/* Mobile short & sweet single-line */}
            <span className="sm:hidden text-[10.5px] font-bold text-white/90 truncate">
              {config.announcement.highlightText || "Free Shipping over ₹999 across India"}
            </span>
            {/* Desktop full message */}
            <span className="hidden sm:inline text-xs font-semibold leading-tight">
              {config.announcement.text}{" "}
              <strong className="text-[#25D366]">{config.announcement.highlightText}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="bg-[#F6F2EA]/95 border-b border-[#D8CBB6]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between">
          {/* Brand Logo - Compact on mobile, rich on desktop */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#B8935A] shadow-md bg-black shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.jpg"
                alt="Ember Dust Logo"
                fill
                sizes="(max-width: 640px) 32px, 44px"
                className="object-cover scale-110"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-2xl font-black tracking-tight text-[#181A1D] group-hover:text-[#B8935A] transition-colors leading-none">
                EMBER DUST
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-[#6B7178] font-bold mt-1">
                Organic Earth & Glaze Ash
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#3B4046] uppercase tracking-wider">
            <a
              href="#gardening"
              className="hover:text-[#B8935A] transition-colors py-1"
            >
              Gardeners
            </a>
            <a
              href="#ceramics"
              className="hover:text-[#B8935A] transition-colors py-1"
            >
              Ceramics
            </a>
            <a
              href="#calculator"
              className="hover:text-[#B8935A] transition-colors py-1"
            >
              Price Calculator
            </a>
            <a
              href="#dosage"
              className="hover:text-[#B8935A] transition-colors py-1"
            >
              Dosage Guide
            </a>
            <a
              href="#products"
              className="hover:text-[#B8935A] transition-colors py-1"
            >
              Products
            </a>
            <a
              href="#order-history"
              className="hover:text-[#B8935A] transition-colors py-1 flex items-center gap-1 text-[#B8935A]"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </a>
            <a
              href="#faq"
              className="hover:text-[#B8935A] transition-colors py-1"
            >
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Desktop Buy Now Button (Hidden on mobile to eliminate clutter) */}
            <button
              onClick={() => openOrderModal()}
              className="hidden sm:flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2.5 rounded-full text-xs font-extrabold shadow-lg hover:shadow-green-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>⚡ Buy Now</span>
            </button>

            <a
              href={directChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 bg-[#181A1D] hover:bg-[#3B4046] text-[#EDE6DA] px-3.5 py-2.5 rounded-full text-xs font-bold border border-white/10 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
              <span>WhatsApp</span>
            </a>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#181A1D] hover:bg-black/5 active:bg-black/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F6F2EA] border-b border-[#D8CBB6] px-5 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-2.5 text-sm font-bold text-[#3B4046]">
            {/* Products Section highlighted at the top */}
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 bg-[#181A1D] text-[#EDE6DA] rounded-2xl shadow-sm border border-black/10 hover:border-[#B8935A] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📦</span>
                <span className="text-white font-extrabold text-sm">Products & Blends</span>
              </div>
              <span className="text-[10px] bg-[#B8935A] text-[#181A1D] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Store Catalog
              </span>
            </a>

            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#B8935A] py-1.5 px-1 border-b border-[#D8CBB6]/40 flex items-center justify-between"
            >
              <span>Interactive Price Calculator</span>
              <span className="text-xs text-[#B8935A]">⚡</span>
            </a>

            <a
              href="#order-history"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#B8935A] py-1.5 px-1 border-b border-[#D8CBB6]/40 flex items-center justify-between text-[#B8935A] font-bold"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#B8935A]" />
                <span>Track Order & History</span>
              </span>
              <span className="text-[10px] bg-[#B8935A]/15 text-[#B8935A] px-2 py-0.5 rounded-full font-bold">
                Live Status
              </span>
            </a>

            <a
              href="#gardening"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#B8935A] py-1.5 px-1 border-b border-[#D8CBB6]/40"
            >
              For Gardeners & Soil (Potassium)
            </a>

            <a
              href="#ceramics"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#B8935A] py-1.5 px-1 border-b border-[#D8CBB6]/40"
            >
              For Studio Ceramicists (Glaze Flux)
            </a>

            <a
              href="#dosage"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#B8935A] py-1.5 px-1 border-b border-[#D8CBB6]/40"
            >
              Soil Dosage Calculator
            </a>

            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#B8935A] py-1.5 px-1 border-b border-[#D8CBB6]/40"
            >
              Frequently Asked Questions
            </a>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openOrderModal();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full text-sm font-extrabold shadow cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
