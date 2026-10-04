"use client";

import React from "react";
import {
  PackageCheck,
  MessageSquare,
  Truck,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  CreditCard,
} from "lucide-react";
import { useOrder } from "@/context/OrderContext";

export default function HowItWorksSection() {
  const { openOrderModal } = useOrder();

  const steps = [
    {
      number: "01",
      icon: PackageCheck,
      title: "Choose Your Size & Blend",
      description:
        "Select from 1 kg starter packs, 5 kg garden packs (Save 20%), or 25+ kg studio bulk bags. Instant transparent pricing.",
      badge: "Step 1",
    },
    {
      number: "02",
      icon: MessageSquare,
      title: "Enter Address & WhatsApp",
      description:
        "Fill your city, pincode, and mobile number. No payment gateway hassle or card details required upfront.",
      badge: "Step 2",
    },
    {
      number: "03",
      icon: Truck,
      title: "Verified Dispatch & Easy Pay",
      description:
        "Your order number (ED-XXXX) is logged in our system. You receive instant WhatsApp confirmation and pay safely via UPI or COD upon delivery.",
      badge: "Step 3",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#EDE6DA]/70 border-b border-[#D8CBB6]/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181A1D] text-[#B8935A] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-[#B8935A]" />
            <span>Frictionless Order Flow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#181A1D] tracking-tight">
            How Ordering Works in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-[#6B7178]">
            We designed Ember Dust to be completely painless. No account creation, no password remembering, zero advance payment risk.
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-[#D8CBB6] rounded-3xl p-7 relative flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-[#B8935A] transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-extrabold text-3xl sm:text-4xl text-[#D8CBB6] group-hover:text-[#B8935A] transition-colors">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-[#181A1D] text-[#B8935A] flex items-center justify-center shadow">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8935A]">
                    {step.badge}
                  </span>
                  <h3 className="text-xl font-bold text-[#181A1D] mt-1 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7178] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D8CBB6]/40 flex items-center gap-1.5 text-xs font-bold text-[#25D366]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Guaranteed Safe & Verified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action Card */}
        <div className="bg-[#181A1D] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#25D366]">
              <Clock className="w-4 h-4" />
              <span>Takes less than 30 seconds</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to enrich your garden or kiln?
            </h4>
            <p className="text-xs sm:text-sm text-[#8E959E]">
              Fresh mountain autumn batch ready for direct express dispatch across India.
            </p>
          </div>

          <button
            onClick={() => openOrderModal()}
            className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-4 px-8 rounded-full font-extrabold text-sm sm:text-base shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Buy Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
