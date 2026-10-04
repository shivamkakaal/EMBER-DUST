import { PRODUCTS, Product } from "./products";
import { DEFAULT_WHATSAPP_NUMBER } from "./whatsapp";

export interface CustomCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface CustomProduct {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  category: string;
  basePrice: number;
  unit: string;
  badge: string;
  stockStatus: "in_stock" | "low" | "out_of_stock";
  shortDescription: string;
  image: string;
  specs: { label: string; value: string }[];
}

export interface SiteConfig {
  announcement: {
    enabled: boolean;
    text: string;
    highlightText: string;
    linkUrl: string;
  };
  hero: {
    eyebrow: string;
    headlinePart1: string;
    headlineHighlight: string;
    headlinePart2: string;
    subheadline: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    badge1: string;
    badge2: string;
    badge3: string;
  };
  whatsapp: {
    number: string;
    businessName: string;
    greeting: string;
  };
  shipping: {
    freeShippingThreshold: number;
    expressDeliveryFee: number;
    estimatedDeliveryDays: string;
  };
  categories: CustomCategory[];
  products: CustomProduct[];
  story: {
    eyebrow: string;
    headline: string;
    paragraph1: string;
    paragraph2: string;
    originLocation: string;
  };
  securityPin: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  announcement: {
    enabled: true,
    text: "Small-batch, triple-screened organic ash.",
    highlightText: "Free Doorstep Shipping over ₹999 across India.",
    linkUrl: "#products",
  },
  hero: {
    eyebrow: "Small-Batch · Triple-Screened · 100% Organic",
    headlinePart1: "Pure Ash. Rich Earth.",
    headlineHighlight: "Radiant Glazes.",
    headlinePart2: "",
    subheadline:
      "Chemical-free mountain wood ash for high-potassium garden fruiting, soil pH correction, and artisanal studio ceramic glaze flux.",
    primaryCtaText: "Buy Now",
    secondaryCtaText: "Custom Weight Calculator",
    badge1: "Free Delivery Over ₹999",
    badge2: "Pay on Delivery (UPI / COD)",
    badge3: "Lab Verified Pure",
  },
  whatsapp: {
    number: DEFAULT_WHATSAPP_NUMBER,
    businessName: "Ember Dust",
    greeting: "Hello Ember Dust 👋 I want to order pure organic wood ash.",
  },
  shipping: {
    freeShippingThreshold: 999,
    expressDeliveryFee: 80,
    estimatedDeliveryDays: "2-4 Business Days",
  },
  categories: [
    {
      id: "cat-1",
      slug: "gardening",
      name: "Gardening & Soil",
      description: "Potassium enrichment, alkaline pH balancing, and natural slug barrier.",
    },
    {
      id: "cat-2",
      slug: "ceramics",
      name: "Pottery & Ceramics",
      description: "100-Mesh fine screened calcium flux for high-fire celadon and tenmoku glazes.",
    },
    {
      id: "cat-3",
      slug: "specialty",
      name: "Specialty & Bamboo",
      description: "Bio-silica botanical blends for crop defense and textured artistic pottery.",
    },
  ],
  products: PRODUCTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryName: p.categoryName,
    category: p.category,
    basePrice: p.basePrice,
    unit: p.unit,
    badge: p.badge || "",
    stockStatus: p.stockStatus,
    shortDescription: p.shortDescription,
    image: p.image || "/images/products/hardwood-ash.jpg",
    specs: p.specifications.slice(0, 4),
  })),
  story: {
    eyebrow: "Mountain Provenance & Processing",
    headline: "Ethically Sourced from Chemical-Free Deciduous Forest Kilns",
    paragraph1:
      "Unlike municipal fly ash or industrial incinerator waste which contain toxic heavy metals and high salinity, Ember Dust originates solely from virgin Himalayan hardwoods (oak, rhododendron, wild apple, and eucalyptus).",
    paragraph2:
      "Burned at sustained high temperatures to completely incinerate volatile hydrocarbons, then sifted through multi-stage brass sieves down to 100 mesh.",
    originLocation: "Himalayan Foothills, Himachal Pradesh",
  },
  securityPin: "8899",
};
