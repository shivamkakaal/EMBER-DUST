"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Truck,
  CreditCard,
  Banknote,
  Check,
  Scale,
  Leaf,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Product, PRODUCTS } from "@/lib/products";
import { calcPrice } from "@/lib/pricing";
import { DEFAULT_WHATSAPP_NUMBER } from "@/lib/whatsapp";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  quantity?: number;
}

export default function OrderModal({
  isOpen,
  onClose,
  product: initialProduct,
  quantity: initialQuantity = 5,
}: OrderModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    initialProduct || PRODUCTS[0]
  );
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod" | "whatsapp">("upi");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    total: number;
    unitPrice: number;
    whatsappUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  // Active pricing calculation
  const pricing = calcPrice(quantity, selectedProduct.basePrice, selectedProduct.tiers);

  const popularPacks = [
    { qty: 1, label: "1 kg Starter", badge: "Trial Size" },
    { qty: 5, label: "5 kg Garden Pack", badge: "⭐ Most Popular", save: "20% OFF" },
    { qty: 25, label: "25 kg Bulk Bag", badge: "Orchard/Studio", save: "37% OFF" },
    { qty: 100, label: "100 kg Commercial", badge: "Farm Estate", save: "54% OFF" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerPhone || customerPhone.replace(/[^0-9]/g, "").length < 10) {
      alert("Please enter a valid 10-digit WhatsApp phone number so we can confirm your order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${deliveryAddress}${pincode ? ` - Pincode: ${pincode}` : ""}`;
      const paymentNote = `Payment Mode: ${paymentMethod.toUpperCase()}${notes ? ` | Notes: ${notes}` : ""}`;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: selectedProduct.slug,
          quantity,
          customerName,
          customerPhone,
          deliveryAddress: fullAddress,
          deliveryCityPincode: pincode,
          notes: paymentNote,
          honeypot,
        }),
      });

      const data = await response.json();

      if (data.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#25D366", "#B8935A", "#1F2124", "#F6F2EA"],
          });
        } catch {
          // Ignore
        }

        setOrderResult({
          orderNumber: data.orderNumber,
          total: data.total,
          unitPrice: data.unitPrice,
          whatsappUrl: data.whatsappUrl,
        });

        // Open WhatsApp directly
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank");
        }
      } else {
        alert(data.error || "Order submitted. Redirecting to WhatsApp.");
      }
    } catch (err) {
      console.error("Order submit failed:", err);
      // Fallback
      window.open(
        `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hello Ember Dust, I want to order ${quantity} kg of ${selectedProduct.name}. My Name is ${customerName}, Phone: ${customerPhone}, Address: ${deliveryAddress}.`
        )}`,
        "_blank"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-[#181A1D] border border-white/15 rounded-3xl p-5 sm:p-7 text-[#EDE6DA] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderResult ? (
          <div>
            {/* Header */}
            <div className="mb-5 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#B8935A] shadow-md bg-black shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="Ember Dust Logo"
                    fill
                    sizes="44px"
                    className="object-cover scale-110"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B8935A]/20 text-[#B8935A] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Direct 1-Click Order</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Quick Checkout
                  </h2>
                </div>
              </div>
              <p className="text-xs text-[#8E959E] mt-1">
                Zero advance payment. Pay on delivery via UPI/Cash after order verification on WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Spam Honeypot */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Step 1: Select Blend */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E959E] mb-2">
                  1. Select Ash Blend:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRODUCTS.map((p) => {
                    const isSelected = selectedProduct.id === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-2 rounded-2xl border text-left transition-all flex flex-col justify-between relative group cursor-pointer ${
                          isSelected
                            ? "bg-[#B8935A]/25 border-[#B8935A] text-white shadow-lg ring-2 ring-[#B8935A]"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {/* Product Image */}
                        <div className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden mb-2 bg-black shrink-0">
                          {p.image && (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-[#25D366] text-white rounded-full p-0.5 shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="space-y-0.5">
                          <div className="text-[11px] sm:text-xs font-bold text-white line-clamp-1 leading-snug">
                            {p.name.replace("Pure Organic ", "").replace(" (Ultra-Fine)", "")}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-[#B8935A] font-extrabold">
                            ₹{p.basePrice}/kg
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Quantity / Pack */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8E959E]">
                    2. Choose Pack Size:
                  </label>
                  <span className="text-xs font-bold text-[#B8935A]">
                    {quantity} kg selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {popularPacks.map((pack) => {
                    const isSelected = quantity === pack.qty;
                    const packPrice = calcPrice(pack.qty, selectedProduct.basePrice, selectedProduct.tiers);
                    return (
                      <button
                        type="button"
                        key={pack.qty}
                        onClick={() => setQuantity(pack.qty)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-white text-[#181A1D] border-white font-bold shadow-lg"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        {pack.save && (
                          <span className="text-[9px] uppercase tracking-wide font-extrabold text-[#25D366] block">
                            {pack.save}
                          </span>
                        )}
                        <div className="text-xs font-bold mt-0.5">{pack.qty} kg</div>
                        <div className={`text-xs mt-0.5 ${isSelected ? "text-[#181A1D] font-extrabold" : "text-[#B8935A]"}`}>
                          ₹{packPrice.total}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Weight Input */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 px-3">
                  <span className="text-xs text-white/70">Or type custom kg:</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-center font-bold text-white text-xs focus:outline-none focus:border-[#B8935A]"
                  />
                  <span className="text-xs text-[#8E959E]">kg</span>
                </div>
              </div>

              {/* Step 3: Delivery Details Form */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E959E]">
                  3. Your Delivery Details:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#B8935A]"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="WhatsApp Mobile Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#B8935A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Delivery Address (House/Street/City) *"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#B8935A]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Pincode *"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#B8935A]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Payment Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E959E] mb-2">
                  4. Payment Preference (Pay After Delivery Verification):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                      paymentMethod === "upi"
                        ? "bg-[#25D366]/20 border-[#25D366] text-white font-bold"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 mx-auto mb-1 text-[#25D366]" />
                    <span>UPI / GPay / PhonePe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                      paymentMethod === "cod"
                        ? "bg-[#25D366]/20 border-[#25D366] text-white font-bold"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 mx-auto mb-1 text-[#25D366]" />
                    <span>Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("whatsapp")}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                      paymentMethod === "whatsapp"
                        ? "bg-[#25D366]/20 border-[#25D366] text-white font-bold"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mx-auto mb-1 text-[#25D366]" />
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Order Total & Price Summary Box */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  {selectedProduct.image && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black">
                      <Image
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">
                      {selectedProduct.name}
                    </div>
                    <div className="text-[11px] text-[#B8935A]">
                      {quantity} kg pouch pack ({selectedProduct.categoryName})
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-white/70">
                  <span>Item Subtotal ({quantity} kg × ₹{pricing.unit.toFixed(2)}):</span>
                  <span>₹{pricing.total}</span>
                </div>

                {pricing.saving > 0 && (
                  <div className="flex justify-between items-center text-xs text-[#25D366] font-bold">
                    <span>Bulk Tier Savings:</span>
                    <span>-₹{pricing.saving}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-white/70">
                  <span>Shipping & Packaging:</span>
                  <span className="text-[#25D366] font-bold">FREE (Express Pan-India)</span>
                </div>

                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-white/70 uppercase">Final Total Amount:</span>
                    <div className="text-[10px] text-[#8E959E]">Inclusive of all taxes & packing</div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#B8935A]">
                    ₹{pricing.total.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base shadow-xl hover:shadow-green-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registering Order in System...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order · ₹{pricing.total.toLocaleString("en-IN")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-white/50 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Instant confirmation · Real-time WhatsApp tracking · No hidden charges</span>
              </div>
            </form>
          </div>
        ) : (
          /* Success Receipt Screen */
          <div className="text-center py-4 space-y-5 animate-scale-up">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#25D366] shadow-2xl bg-black mx-auto">
              <Image
                src="/logo.jpg"
                alt="Ember Dust Logo"
                fill
                sizes="64px"
                className="object-cover scale-110"
              />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#25D366]">
                Order Confirmed & Logged!
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                {orderResult.orderNumber}
              </h3>
              <p className="text-xs text-[#8E959E] mt-2 max-w-sm mx-auto">
                Your order has been registered in our database. We have sent the confirmation to your WhatsApp chat!
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between text-white/70">
                <span>Product:</span>
                <span className="font-bold text-white">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Quantity:</span>
                <span className="font-bold text-white">{quantity} kg</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Customer:</span>
                <span className="font-bold text-white">{customerName} ({customerPhone})</span>
              </div>
              <div className="flex justify-between text-white/70 border-t border-white/10 pt-2">
                <span>Total Amount:</span>
                <span className="font-extrabold text-[#B8935A] text-base">
                  ₹{orderResult.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <a
                href={orderResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-4 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Open WhatsApp to Track Delivery</span>
              </a>

              <button
                onClick={onClose}
                className="w-full text-xs text-white/60 hover:text-white py-2"
              >
                Close & Return to Store
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
