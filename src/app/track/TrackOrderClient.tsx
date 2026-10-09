"use client";

import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import OrderHistorySection from "@/components/OrderHistorySection";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import OrderModal from "@/components/OrderModal";
import { OrderProvider, useOrder } from "@/context/OrderContext";

function TrackContent() {
  const { isModalOpen, closeOrderModal, selectedProduct, selectedQuantity } = useOrder();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#141618] text-[#EDE6DA] font-sans selection:bg-[#B8935A] selection:text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Track Stream */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh] bg-[#181A1D] flex items-center justify-center text-[#B8935A]">Loading tracking portal...</div>}>
          <OrderHistorySection isDedicatedPage={true} />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFab />

      {/* Global Quick Order Checkout Modal (For re-orders) */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        product={selectedProduct}
        quantity={selectedQuantity}
      />
    </div>
  );
}

export default function TrackOrderClient() {
  return (
    <OrderProvider>
      <TrackContent />
    </OrderProvider>
  );
}
