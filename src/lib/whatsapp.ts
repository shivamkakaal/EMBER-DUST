export interface OrderMessageParams {
  orderNumber: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  deliveryCityPincode?: string;
  notes?: string;
}

export const DEFAULT_WHATSAPP_NUMBER = "919876543210";

/**
 * Builds the WhatsApp order text per PRD specifications.
 */
export function buildOrderMessage(params: OrderMessageParams): string {
  const lines = [
    "Hello Ember Dust 👋",
    "I'd like to place an order:",
    "",
    `🧾 Order: ${params.orderNumber}`,
    `🌿 Product: ${params.productName}`,
    `⚖️ Quantity: ${params.quantity} ${params.unit}`,
    `💰 Rate: ₹${params.unitPrice.toFixed(2)}/${params.unit}`,
    `✅ Total: ₹${params.total.toFixed(2)}`,
    "",
    `📍 Delivery city/pincode: ${params.deliveryCityPincode || "________________"}`,
    `👤 Name: ${params.customerName || "________________"}`,
  ];

  if (params.customerPhone) {
    lines.push(`📞 Phone: ${params.customerPhone}`);
  }

  if (params.notes && params.notes.trim()) {
    lines.push(`📝 Notes: ${params.notes.trim()}`);
  }

  return lines.join("\n");
}

/**
 * Generates the direct WhatsApp click-to-chat URL.
 */
export function buildWhatsAppUrl(
  phoneNumber: string = DEFAULT_WHATSAPP_NUMBER,
  text: string
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
