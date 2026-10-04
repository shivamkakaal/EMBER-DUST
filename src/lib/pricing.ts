export interface Tier {
  min_qty: number;
  price_per_unit: number;
  label?: string;
}

export interface PricingResult {
  unit: number;
  total: number;
  tierLabel?: string;
  saving: number;
  baseTotal: number;
  discountPercentage: number;
  activeTier?: Tier;
}

/**
 * Pure price calculation engine shared by client and server.
 * Formula from PRD:
 * unit = tier?.price_per_unit ?? base;
 * total = Math.round(unit * qty * 100) / 100;
 * saving = (base - unit) * qty;
 */
export function calcPrice(
  qty: number,
  basePrice: number,
  tiers: Tier[] = []
): PricingResult {
  const safeQty = Math.max(1, isNaN(qty) ? 1 : qty);
  const sorted = [...tiers].sort((a, b) => b.min_qty - a.min_qty);
  const tier = sorted.find((t) => safeQty >= t.min_qty);

  const unit = tier?.price_per_unit ?? basePrice;
  const total = Math.round(unit * safeQty * 100) / 100;
  const baseTotal = Math.round(basePrice * safeQty * 100) / 100;
  const saving = Math.max(0, Math.round((baseTotal - total) * 100) / 100);
  const discountPercentage =
    basePrice > 0 ? Math.round(((basePrice - unit) / basePrice) * 100) : 0;

  return {
    unit,
    total,
    tierLabel: tier?.label,
    saving,
    baseTotal,
    discountPercentage,
    activeTier: tier,
  };
}

/**
 * Logarithmic mapping for slider (1 kg to 1000 kg).
 * Makes it effortless to pick 2 kg or 500 kg with fine granularity at lower weights.
 */
export function sliderToWeight(val: number): number {
  // val from 0 to 100
  // maps 0 -> 1kg, 25 -> 5kg, 50 -> 25kg, 75 -> 100kg, 100 -> 1000kg
  if (val <= 0) return 1;
  if (val >= 100) return 1000;

  const minLog = Math.log(1);
  const maxLog = Math.log(1000);
  const scale = (maxLog - minLog) / 100;
  const rawWeight = Math.exp(minLog + scale * val);

  if (rawWeight < 10) return Math.round(rawWeight);
  if (rawWeight < 50) return Math.round(rawWeight / 5) * 5;
  if (rawWeight < 200) return Math.round(rawWeight / 10) * 10;
  return Math.round(rawWeight / 25) * 25;
}

export function weightToSlider(weight: number): number {
  if (weight <= 1) return 0;
  if (weight >= 1000) return 100;

  const minLog = Math.log(1);
  const maxLog = Math.log(1000);
  const scale = (maxLog - minLog) / 100;
  return Math.round((Math.log(weight) - minLog) / scale);
}
