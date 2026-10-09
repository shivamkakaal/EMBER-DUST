"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import ScrollSequenceHero from "@/components/ScrollSequenceHero";
import Hero from "@/components/Hero";
import HowItWorksSection from "@/components/HowItWorksSection";
import BenefitsSection from "@/components/BenefitsSection";
import CeramicsSection from "@/components/CeramicsSection";
import DosageCalculator from "@/components/DosageCalculator";
import ProductGrid from "@/components/ProductGrid";
import StorySection from "@/components/StorySection";
import OrderHistorySection from "@/components/OrderHistorySection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import StickyBuyBar from "@/components/StickyBuyBar";
import OrderModal from "@/components/OrderModal";
import { OrderProvider, useOrder } from "@/context/OrderContext";

function MainContent() {
  const { isModalOpen, closeOrderModal, selectedProduct, selectedQuantity } = useOrder();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F6F2EA]">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Stream */}
      <main className="flex-1">
        {/* Frame-by-frame GSAP ScrollTrigger Sequence */}
        <ScrollSequenceHero
          folderPath="/images/sequence"
          frameCount={135}
          framePrefix="frame_"
          frameExtension=".webp"
          scrollDistance={2000}
          showOverlays={true}
        />

        {/* Storefront Hero with Persona Switcher & Calculator */}
        <Hero />

        {/* How Ordering Works in 3 Simple Steps */}
        <HowItWorksSection />

        {/* Agronomy & Soil Science */}
        <BenefitsSection />

        {/* Ceramics & High-Fire Glaze Science */}
        <CeramicsSection />

        {/* Soil Dosage Calculator */}
        <DosageCalculator />

        {/* Catalog of Blends with Direct Buy Now Buttons */}
        <ProductGrid />

        {/* Sourcing Provenance */}
        <StorySection />

        {/* Live Consignment Tracking & Order History */}
        <OrderHistorySection />

        {/* Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Sticky Quick Buy Bar */}
      <StickyBuyBar />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFab />

      {/* Global Quick Order Checkout Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        product={selectedProduct}
        quantity={selectedQuantity}
      />
    </div>
  );
}

export default function Home() {
  return (
    <OrderProvider>
      <MainContent />
    </OrderProvider>
  );
}
