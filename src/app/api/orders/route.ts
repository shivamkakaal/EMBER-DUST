import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calcPrice } from "@/lib/pricing";
import { PRODUCTS, getProductBySlug } from "@/lib/products";
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productSlug,
      quantity,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryCityPincode,
      notes,
      honeypot,
    } = body;

    // Spam honeypot protection (PRD 4.2)
    if (honeypot) {
      return NextResponse.json(
        { error: "Spam request rejected" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "Invalid quantity provided" },
        { status: 400 }
      );
    }

    // Locate product and pricing tiers
    const product = getProductBySlug(productSlug) || PRODUCTS[0];
    const clampedQty = Math.min(Math.max(product.minQty, qty), product.maxQty);

    // Recompute price server-side (PRD: client totals are never trusted)
    const pricing = calcPrice(clampedQty, product.basePrice, product.tiers);

    // Generate fallback order number (ED-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let orderNumber = `ED-${dateStr}-${randomSuffix}`;
    let orderId: string | null = null;

    // Attempt to log order in Supabase
    try {
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: customerName || "Guest Customer",
          customer_phone: customerPhone || null,
          delivery_address: deliveryAddress || deliveryCityPincode || null,
          notes: notes || null,
          subtotal: pricing.total,
          delivery_fee: 0,
          total: pricing.total,
          currency: "INR",
          status: "pending",
          source: "whatsapp",
        })
        .select("id, order_number")
        .single();

      if (!orderError && orderData) {
        orderNumber = orderData.order_number;
        orderId = orderData.id;

        // Insert order items
        await supabaseAdmin.from("order_items").insert({
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          quantity: clampedQty,
          unit: product.unit,
          unit_price: pricing.unit,
          line_total: pricing.total,
        });
      } else if (orderError) {
        console.warn("Supabase order insert warning (falling back gracefully):", orderError.message);
      }
    } catch (dbErr) {
      console.warn("Database error during order logging (graceful degradation):", dbErr);
    }

    // Retrieve WhatsApp number from site_settings or fallback
    let whatsappPhone = DEFAULT_WHATSAPP_NUMBER;
    try {
      const { data: settingData } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "whatsapp")
        .maybeSingle();

      if (settingData?.value?.number) {
        whatsappPhone = settingData.value.number;
      }
    } catch {
      // Use default WhatsApp number
    }

    // Build formatted message
    const message = buildOrderMessage({
      orderNumber,
      productName: product.name,
      quantity: clampedQty,
      unit: product.unit,
      unitPrice: pricing.unit,
      total: pricing.total,
      customerName,
      customerPhone,
      deliveryCityPincode,
      notes,
    });

    const whatsappUrl = buildWhatsAppUrl(whatsappPhone, message);

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      quantity: clampedQty,
      unitPrice: pricing.unit,
      total: pricing.total,
      saving: pricing.saving,
      tierLabel: pricing.tierLabel,
      whatsappUrl,
      message,
    });
  } catch (error: any) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
