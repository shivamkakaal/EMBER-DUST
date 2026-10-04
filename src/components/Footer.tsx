"use client";

import React from "react";
import Image from "next/image";
import { MessageSquare, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { DEFAULT_WHATSAPP_NUMBER, buildWhatsAppUrl } from "@/lib/whatsapp";

export default function Footer() {
  const whatsappUrl = buildWhatsAppUrl(
    DEFAULT_WHATSAPP_NUMBER,
    "Hello Ember Dust 👋 I'd like to get in touch regarding your organic wood ash products."
  );

  return (
    <footer className="bg-[#181A1D] text-[#EDE6DA] pt-16 pb-12 border-t border-white/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#B8935A] shadow-xl bg-black shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Ember Dust Logo"
                  fill
                  sizes="48px"
                  className="object-cover scale-110"
                />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                EMBER DUST
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8E959E] leading-relaxed max-w-sm">
              Artisanal, small-batch wood ash sieved for soil health and studio pottery glazes. Sourced from chemical-free, sustainable orchard wood prunings in the Himalayan foothills.
            </p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2 rounded-full text-xs font-semibold shadow transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp: +91 98765 43210</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#B8935A]">
              For Gardeners
            </h4>
            <ul className="space-y-2 text-xs text-[#8E959E]">
              <li>
                <a href="#gardening" className="hover:text-white transition-colors">
                  Potassium Enrichment
                </a>
              </li>
              <li>
                <a href="#dosage" className="hover:text-white transition-colors">
                  Soil Dosage Calculator
                </a>
              </li>
              <li>
                <a href="#gardening" className="hover:text-white transition-colors">
                  Natural Slug Shield
                </a>
              </li>
              <li>
                <a href="#gardening" className="hover:text-white transition-colors">
                  Tomato & Rose Feeding
                </a>
              </li>
            </ul>
          </div>

          {/* For Potters */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#B8935A]">
              For Potters
            </h4>
            <ul className="space-y-2 text-xs text-[#8E959E]">
              <li>
                <a href="#ceramics" className="hover:text-white transition-colors">
                  100-Mesh Glaze Ash
                </a>
              </li>
              <li>
                <a href="#ceramics" className="hover:text-white transition-colors">
                  High-Fire Cone 8–11
                </a>
              </li>
              <li>
                <a href="#ceramics" className="hover:text-white transition-colors">
                  Celadon & Tenmoku Recipes
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  Studio Bulk Orders
                </a>
              </li>
            </ul>
          </div>

          {/* Company & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#B8935A]">
              Information
            </h4>
            <ul className="space-y-2 text-xs text-[#8E959E]">
              <li>
                <a href="#story" className="hover:text-white transition-colors">
                  Our Provenance
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-[#B8935A] transition-colors font-medium">
                  Bulk & Wholesale Inquiries
                </a>
              </li>
              <li>
                <span className="text-white/40 text-[11px]">
                  FSSAI & Lab Standards Compliant
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimers */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E959E]">
          <div>
            © {new Date().getFullYear()} Ember Dust. All rights reserved. Registered under Sustainable Agri-Residue Biowaste Management.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#8E959E]">Direct Pan-India Dispatch</span>
            <span>•</span>
            <span className="text-[#B8935A]">Zero Artificial Additives</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
