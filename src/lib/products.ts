import { Tier } from "./pricing";

export interface ProductAttribute {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  descriptionMd: string;
  category: "gardening" | "ceramics" | "specialty" | string;
  categoryName: string;
  unit: string;
  basePrice: number;
  minQty: number;
  maxQty: number;
  qtyStep: number;
  presetQuantities: number[];
  tiers: Tier[];
  attributes: Record<string, string>;
  specifications: ProductAttribute[];
  specs?: ProductAttribute[];
  stockStatus: "in_stock" | "low" | "out_of_stock";
  isFeatured: boolean;
  badge?: string;
  image?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "pure-hardwood-ash",
    name: "Pure Organic Hardwood Ash",
    shortDescription:
      "Small-batch, triple-screened organic hardwood ash. Rich in potassium and calcium for vigorous fruiting and alkaline pH balancing.",
    descriptionMd: `## Pure Organic Hardwood Ash

Derived strictly from clean, chemical-free oak, eucalyptus, and deciduous hardwoods burned at sustained temperatures. Triple-sieved through 40-mesh screens to ensure zero charcoal chunks, stones, or grit.

### Agronomy & Benefits:
- **Potassium Powerhouse (K₂O 7–10%)**: Fuels blossoming, fruit swelling, and cold/heat stress resilience.
- **pH Correction**: Gently raises acidic soils towards the sweet spot (pH 6.5–7.0) without synthetic liming agents.
- **Natural Slug & Pest Deterrent**: Mineral crystals create an abrasive, desiccant barrier around stems and vegetable beds.
- **Trace Minerals**: Natural calcium (CaCO₃), magnesium, boron, and zinc replenished in every dusting.`,
    category: "gardening",
    categoryName: "Gardening & Soil",
    unit: "kg",
    basePrice: 120.0,
    minQty: 1,
    maxQty: 1000,
    qtyStep: 1,
    presetQuantities: [1, 5, 25, 100],
    badge: "Bestseller for Gardeners",
    image: "/images/products/hardwood-ash.jpg",
    tiers: [
      { min_qty: 1, price_per_unit: 120.0, label: "Starter Trial" },
      { min_qty: 5, price_per_unit: 95.0, label: "Home Garden (Save 20%)" },
      { min_qty: 25, price_per_unit: 75.0, label: "Orchard / Grower (Save 37%)" },
      { min_qty: 100, price_per_unit: 55.0, label: "Farm & Bulk (Save 54%)" },
      { min_qty: 500, price_per_unit: 45.0, label: "Commercial Scale (Save 62%)" },
    ],
    attributes: {
      ash_type: "Hardwood (Oak, Apple, Pine Blend)",
      ph_level: "9.8 – 10.4",
      mesh_sieve: "40 Mesh (Clean fine powder)",
      moisture: "< 1.5%",
      origin: "Himalayan Foothills, Himachal",
    },
    specifications: [
      { label: "Potassium (K₂O)", value: "7.2% – 9.8%" },
      { label: "Calcium Oxide (CaO)", value: "28.5% – 34.0%" },
      { label: "Magnesium (MgO)", value: "3.5% – 5.1%" },
      { label: "Phosphorus (P₂O₅)", value: "1.4% – 2.2%" },
      { label: "pH in Solution", value: "10.2 (Buffered)" },
      { label: "Heavy Metals", value: "Nil (Food-Grade Source)" },
    ],
    stockStatus: "in_stock",
    isFeatured: true,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    slug: "studio-glaze-ash",
    name: "Studio Ceramic Glaze Ash (Ultra-Fine)",
    shortDescription:
      "Double-washed, 100-mesh screened hardwood ash with reliable calcium flux chemistry. Formulated for classic Celadon, Tenmoku, and Nuka wood-fired glazes.",
    descriptionMd: `## Studio Ceramic Glaze Ash

Processed specifically for high-temperature studio ceramics and wood-firing kilns. Carefully washed to balance soluble alkali content, then oven-dried and passed through a 100-mesh brass sieve.

### Ceramic Properties & Firing Range:
- **Fluxing Agent (Cone 8 – Cone 11, 1240°C – 1310°C)**: Lowers melting points of refractory quartz and feldspar naturally.
- **Glaze Formulations**: Excellent foundation for Chun blue, oil-spot Tenmoku, olive celadon, and soft matte Nuka glazes.
- **Consistent Mesh**: 100-mesh ensures fluid melt without pinholing or specking unless intentionally textured.`,
    category: "ceramics",
    categoryName: "Pottery & Ceramics",
    unit: "kg",
    basePrice: 180.0,
    minQty: 1,
    maxQty: 500,
    qtyStep: 1,
    presetQuantities: [1, 5, 20, 50],
    badge: "Studio Choice",
    image: "/images/products/studio-glaze-ash.jpg",
    tiers: [
      { min_qty: 1, price_per_unit: 180.0, label: "Studio Sample" },
      { min_qty: 5, price_per_unit: 145.0, label: "Kiln Batch (Save 19%)" },
      { min_qty: 20, price_per_unit: 110.0, label: "Studio Studio (Save 38%)" },
      { min_qty: 50, price_per_unit: 85.0, label: "Master Ceramicist (Save 52%)" },
    ],
    attributes: {
      ash_type: "Washed High-Calcium Hardwood",
      mesh_sieve: "100 Mesh Ultra-Fine",
      firing_cone: "Cone 8 to Cone 11 (1240°C - 1300°C)",
      preparation: "Pre-screened & Oven-Desiccated",
    },
    specifications: [
      { label: "Calcium (CaO)", value: "38.2%" },
      { label: "Silica (SiO₂)", value: "24.6%" },
      { label: "Alumina (Al₂O₃)", value: "7.8%" },
      { label: "Iron (Fe₂O₃)", value: "1.9% (Natural amber tint)" },
      { label: "Loss on Ignition (LOI)", value: "< 4.2%" },
      { label: "Mesh Pass-Through", value: "> 98% through 100 Mesh" },
    ],
    stockStatus: "in_stock",
    isFeatured: true,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    slug: "bio-silica-plant-ash",
    name: "Bio-Silica Plant & Bamboo Ash",
    shortDescription:
      "High-silicon ash engineered for fungal resistance in horticulture and textured volcanic satins in artistic pottery.",
    descriptionMd: `## Bio-Silica Plant & Bamboo Ash

Rich in amorphous plant-available silicon (SiO₂). Absorbed by plant cell walls to form a physical microscopic shield against aphids, powdery mildew, and leaf spot. In pottery, creates tactile satin-matte crawls and crater glazes.`,
    category: "specialty",
    categoryName: "Dual Purpose / Specialty",
    unit: "kg",
    basePrice: 150.0,
    minQty: 1,
    maxQty: 300,
    qtyStep: 1,
    presetQuantities: [1, 5, 20],
    badge: "High Bio-Silica",
    image: "/images/products/bio-silica-ash.jpg",
    tiers: [
      { min_qty: 1, price_per_unit: 150.0, label: "Individual Jar" },
      { min_qty: 5, price_per_unit: 120.0, label: "Crop Guard (Save 20%)" },
      { min_qty: 20, price_per_unit: 95.0, label: "Estate Pack (Save 36%)" },
    ],
    attributes: {
      ash_type: "Grass & Bamboo Botanical Blend",
      mesh_sieve: "60 Mesh",
      bio_silicon: "38.5% Plant-available SiO₂",
    },
    specifications: [
      { label: "Amorphous Silica", value: "38.5%" },
      { label: "Potassium (K₂O)", value: "8.1%" },
      { label: "Magnesium (MgO)", value: "4.2%" },
      { label: "pH in Water", value: "9.6" },
    ],
    stockStatus: "in_stock",
    isFeatured: false,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProduct(): Product {
  return PRODUCTS.find((p) => p.isFeatured) || PRODUCTS[0];
}
