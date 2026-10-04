Ember Dust — PRD & Technical Specification
Version 1.0 · Next.js (App Router) · Tailwind · TypeScript · Supabase · Vercel
1. Executive Summary & Product Goals
Ember Dust sells premium organic wood/plant ash for two audiences: gardeners (potassium boost, soil pH correction, pest deterrent) and ceramicists (glaze ash, flux). The site is an ultra-premium, installable storefront where ordering is frictionless (WhatsApp) and the owner controls everything from a CMS, with no developer needed.
Goals
#	Goal	Success metric
G1	Convert visitors to WhatsApp orders	≥ 6% visit→WhatsApp-click; ≥ 40% click→confirmed order
G2	Instant price clarity at any weight	Calculator interaction < 100 ms; zero pricing errors
G3	Owner self-sufficiency	100% of copy, pricing, banners, products editable in admin
G4	Mobile/PWA quality	Lighthouse: Perf ≥ 90, PWA ✔, A11y ≥ 95; LCP < 2.2 s on 4G
G5	Scalable catalog	New category/product live with zero code changes
Non-goals (v1): online payment gateway, multi-currency, customer accounts, inventory forecasting. (Schema leaves room for all.)
Key assumptions: Orders are confirmed and paid manually via WhatsApp (UPI/bank/COD). The order is also logged in Supabase before the WhatsApp redirect so nothing is lost.
2. Personas
Asha, the Home Gardener (primary). 28–55, urban/peri-urban, grows vegetables and roses. Wants a natural potassium source, buys 1–10 kg, mobile-first, trusts WhatsApp more than checkout forms. Needs: usage guidance (dose per m², what not to use it on), clear price per kg.
Ravi, the Potter/Ceramic Artist. 25–50, studio or workshop. Needs consistent, sieved, clean ash for glazes; buys 5–100 kg. Needs: bulk pricing, ash type/source detail, fast reorder.
Meera, the Eco-conscious Consumer. 22–45, values provenance and sustainability. Needs: story, sourcing transparency, premium packaging, share-worthy design.
Owner/Admin (internal). Non-technical; manages orders and content from a phone. Needs: a simple dashboard, real-time new-order alerts, one-tap status updates.
Core journey: Land → read hero → pick weight → see live total → tap WhatsApp → order auto-logged → owner confirms → status updated → delivered.
3. Information Architecture & Database Schema
Sitemap (public): / (hero, calculator, benefits, uses, story, FAQ) · /shop · /shop/[category] · /product/[slug] · /about · /offline Sitemap (admin): /admin/login · /admin (orders) · /admin/orders/[id] · /admin/products · /admin/categories · /admin/content · /admin/settings
Supabase SQL (Postgres)
create extension if not exists "pgcrypto";

-- Admin roles (Supabase Auth users flagged as admin)
create table admin_users (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'admin' check (role in ('admin','staff'))
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories on delete set null,
  slug text unique not null,
  name text not null,
  short_description text,
  description_md text,
  images text[] default '{}',
  unit text not null default 'kg',            -- kg | piece | litre ...
  pricing_mode text not null default 'tiered' -- 'tiered' | 'per_unit' | 'fixed'
    check (pricing_mode in ('tiered','per_unit','fixed')),
  base_price numeric(10,2) not null,          -- price per unit (default tier)
  min_qty numeric(10,2) default 1,
  max_qty numeric(10,2) default 1000,
  qty_step numeric(10,2) default 1,
  preset_quantities numeric[] default '{1,5,100}',
  attributes jsonb default '{}',              -- e.g. {"ash_type":"hardwood","sieved":true}
  stock_status text default 'in_stock' check (stock_status in ('in_stock','low','out_of_stock')),
  is_featured boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bulk tiers: price per unit by min quantity
create table price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products on delete cascade,
  min_qty numeric(10,2) not null,
  price_per_unit numeric(10,2) not null,
  label text,                                 -- "Bulk", "Studio"
  unique (product_id, min_qty)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,          -- ED-20261004-0001 (generated via trigger/function)
  customer_name text,
  customer_phone text,
  delivery_address text,
  notes text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  currency text default 'INR',
  status text not null default 'pending'
    check (status in ('pending','processing','shipped','delivered','cancelled')),
  source text default 'whatsapp',
  tracking_info text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete cascade,
  product_id uuid references products on delete set null,
  product_name text not null,                 -- snapshot
  quantity numeric(10,2) not null,
  unit text not null,
  unit_price numeric(10,2) not null,          -- snapshot of tier price applied
  line_total numeric(10,2) not null
);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete cascade,
  status text not null,
  changed_by uuid references auth.users,
  changed_at timestamptz default now()
);

-- Key/value CMS: hero, whatsapp, branding, SEO, FAQ, etc.
create table site_settings (
  key text primary key,                       -- 'hero', 'whatsapp', 'seo', 'announcement', 'faq'
  value jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users
);

create index on products (category_id, is_active, sort_order);
create index on orders (status, created_at desc);
create index on order_items (order_id);
Sample site_settings rows
// key: "hero"
{
  "eyebrow": "Small-batch · Organic",
  "headline": "Pure Ash. Rich Earth.",
  "subheadline": "Premium wood ash for soil that thrives and clay that sings.",
  "background_image": "https://…/hero.jpg",
  "overlay_opacity": 0.45,
  "cta_label": "Order on WhatsApp",
  "featured_product_id": "uuid",
  "show_calculator": true
}
// key: "whatsapp"
{ "number": "91XXXXXXXXXX", "template": "…", "business_name": "Ember Dust", "greeting": "Hello Ember Dust 👋" }
Row Level Security
alter table categories enable row level security;
alter table products enable row level security;
alter table price_tiers enable row level security;
alter table site_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create function is_admin() returns boolean language sql stable security definer as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- Public read of active catalog + settings
create policy "public read categories" on categories for select using (is_active);
create policy "public read products"   on products   for select using (is_active);
create policy "public read tiers"      on price_tiers for select using (true);
create policy "public read settings"   on site_settings for select using (true);

-- Admin full access
create policy "admin all categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin all products"   on products   for all using (is_admin()) with check (is_admin());
create policy "admin all tiers"      on price_tiers for all using (is_admin()) with check (is_admin());
create policy "admin all settings"   on site_settings for all using (is_admin()) with check (is_admin());
create policy "admin all orders"     on orders      for all using (is_admin()) with check (is_admin());
create policy "admin all items"      on order_items for all using (is_admin()) with check (is_admin());
-- Order creation happens ONLY through a server route using the service role (never direct anon inserts).
4. Detailed Feature Specifications
4.1 Dynamic Hero + Pricing Calculator
Hero (CMS-driven): reads site_settings.hero. Admin edits headline, subheadline, CTA label, background image (Supabase Storage upload), overlay opacity, featured product. Changes appear within seconds via revalidateTag('settings') on save.
Calculator behaviour
Controls: preset chips (from preset_quantities: 1 kg, 5 kg, 100 kg), a range slider, and a numeric input. All three stay in sync.
Slider is non-linear (log-scaled) so 1 kg and 1000 kg are both easy to hit; the numeric input accepts any value within min_qty–max_qty and the step.
Price engine (pure function, shared by client and server):
export function calcPrice(qty: number, base: number, tiers: Tier[]) {
  const tier = [...tiers].sort((a,b)=>b.min_qty-a.min_qty).find(t => qty >= t.min_qty);
  const unit = tier?.price_per_unit ?? base;
  return { unit, total: Math.round(unit * qty * 100) / 100, tierLabel: tier?.label, saving: (base-unit)*qty };
}
Display: animated count-up total, active tier badge ("Bulk rate applied"), "You save ₹X" line, per-kg price.
Validation: clamp out-of-range values, show inline hint; qty above max_qty swaps CTA to "Request bulk quote".
The server recomputes the price when logging an order; client totals are never trusted.
4.2 WhatsApp Order Integration
Floating button: fixed bottom-right (bottom: calc(1.25rem + env(safe-area-inset-bottom))), 56 px, brand green-gold glass style, CSS pulse ring (prefers-reduced-motion disables it), tooltip "Order on WhatsApp".
Flow: user taps "Order via WhatsApp" → POST /api/orders (server validates qty/price, inserts orders + order_items, returns order_number) → client opens https://wa.me/<number>?text=<encoded message>. If the API fails, WhatsApp still opens with an unlogged message (graceful degradation).
Message template (editable in admin):
Hello Ember Dust 👋
I'd like to place an order:

🧾 Order: {order_number}
🌿 Product: {product_name}
⚖️ Quantity: {qty} {unit}
💰 Rate: ₹{unit_price}/{unit}
✅ Total: ₹{total}

📍 Delivery city/pincode: ________
Name: ________
The floating button (no selection) sends a generic enquiry; on a product page it carries the current selection.
Rate-limit /api/orders (e.g., 5/min per IP) with honeypot field to prevent spam.
4.3 PWA Workflow
Manifest (app/manifest.ts): name "Ember Dust", display: standalone, theme_color #1F2124, background_color #EDE6DA, maskable 192/512 icons, shortcuts ("Order now", "Shop").
Service worker (Serwist or next-pwa compatible with App Router):
Precache app shell, fonts, icons, /offline.
Strategies: static assets → CacheFirst; catalog/settings API → StaleWhileRevalidate; HTML navigations → NetworkFirst with /offline fallback; admin routes and /api/orders are never cached.
Update flow: toast "New version available — Refresh".
Offline page: branded, shows last-cached product prices (marked "as of …") and a WhatsApp link that still works.
Install prompt: capture beforeinstallprompt; show a glass bottom-sheet after ≥ 2 page views or 30 s engagement, dismissible, re-prompt after 14 days. iOS Safari gets an instruction sheet (Share → Add to Home Screen). Hide when already display-mode: standalone.
4.4 Admin Panel / CMS
Auth: Supabase Auth (email + password, optional magic link). Middleware blocks /admin/* unless session user exists in admin_users. No public signup.
Orders dashboard
Kanban + table toggle with columns Pending · Processing · Shipped · Delivered (plus Cancelled filter).
Real-time: Supabase Realtime subscription on orders; new order triggers a toast, sound, and badge; optional Web Push to the owner's installed PWA.
Order detail: items, totals, customer info, notes, tracking field, status timeline (from order_status_history), one-tap "Message customer on WhatsApp".
Status changes write history; filters by date/status; search by order number/phone; CSV export.
Manual order entry (for orders taken directly on WhatsApp).
Content tab
Hero editor with live preview.
Pricing: edit base price, per-kg tiers, presets and min/max per product.
Products: CRUD, image upload (multiple), reorder, active/featured toggles, stock status, custom attributes.
Categories: CRUD, reorder, activate.
Site settings: WhatsApp number/template, announcement bar, SEO, FAQ, footer, contact info.
Every save triggers revalidateTag, so the storefront updates without a redeploy.
5. UI/UX Design System
Principles: quiet luxury, generous whitespace, tactile materials (ash, stone, clay), motion that confirms rather than distracts.
Palette
Token	Hex	Use
ash-50	#F6F2EA	Page background (warm beige)
ash-100	#EDE6DA	Cards, sections
sand-300	#D8CBB6	Borders, dividers
slate-500	#6B7178	Secondary text
slate-700	#3B4046	Body text, glass dark
charcoal-900	#1F2124	Headings, dark sections, nav
gold-500	#B8935A	Primary accent, CTA highlights
rust-500	#A4553A	Secondary accent, active states, alerts
whatsapp	#25D366	WhatsApp button only (muted with gold ring)
Contrast: body text on ash-50 ≥ 7:1; gold used for large text/icons or on charcoal only.
Typography
Display: Cormorant Garamond (or Playfair Display) — 500/600, tight tracking, sizes clamp(2.5rem, 6vw, 5rem).
UI/Body: Inter or DM Sans — 400/500/600, 16 px base, 1.6 line height.
Eyebrows: uppercase, 12 px, +0.18em tracking, gold.
Glassmorphism spec
.glass { background: rgba(246,242,234,.55); backdrop-filter: blur(18px) saturate(140%);
         border: 1px solid rgba(255,255,255,.35); box-shadow: 0 8px 32px rgba(31,33,36,.12); }
.glass-dark { background: rgba(31,33,36,.55); border: 1px solid rgba(255,255,255,.08); }
Always provide a solid-color fallback when backdrop-filter is unsupported.
Layout: 12-col grid, max-width 1200 px, 8-pt spacing scale, radii 16/24 px, mobile-first breakpoints (sm 640, md 768, lg 1024, xl 1280). Large tap targets (≥ 44 px).
Micro-interactions (Framer Motion): fade-up on scroll (400 ms, ease-out), count-up on price, slider thumb glow, button press scale 0.98, skeleton shimmers, WhatsApp pulse (2.4 s). All respect prefers-reduced-motion.
Accessibility: WCAG 2.2 AA, visible focus rings (gold), semantic landmarks, labelled slider (aria-valuetext="5 kilograms"), alt text on all CMS images (required field).
6. Technical Architecture & File Structure
Architecture
Next.js App Router with Server Components for catalog pages (ISR + tag-based revalidation); Client Components only for calculator, install prompt, admin interactivity.
Supabase: Postgres + Auth + Storage (media bucket) + Realtime. Server-only service_role key used in route handlers/server actions; browser uses anon key under RLS.
Vercel: edge middleware for admin gating; image optimization via next/image; environment variables per environment.
Validation: Zod schemas shared across forms and API routes. Data fetching: @supabase/ssr helpers.
Observability: Vercel Analytics, Sentry, Supabase logs.
Environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # server only
NEXT_PUBLIC_SITE_URL=
VAPID_PUBLIC_KEY= / VAPID_PRIVATE_KEY=   # optional web push
File structure
ember-dust/
├─ app/
│  ├─ (site)/
│  │  ├─ layout.tsx                # nav, footer, WhatsAppFab, InstallPrompt
│  │  ├─ page.tsx                  # Hero + calculator + sections
│  │  ├─ shop/page.tsx
│  │  ├─ shop/[category]/page.tsx
│  │  ├─ product/[slug]/page.tsx
│  │  ├─ about/page.tsx
│  │  └─ offline/page.tsx
│  ├─ admin/
│  │  ├─ login/page.tsx
│  │  ├─ (dashboard)/
│  │  │  ├─ layout.tsx             # auth guard + sidebar
│  │  │  ├─ page.tsx               # live orders
│  │  │  ├─ orders/[id]/page.tsx
│  │  │  ├─ products/page.tsx
│  │  │  ├─ products/[id]/page.tsx
│  │  │  ├─ categories/page.tsx
│  │  │  ├─ content/page.tsx       # hero + pricing editor
│  │  │  └─ settings/page.tsx
│  ├─ api/
│  │  ├─ orders/route.ts           # validate, price, insert, return order_number
│  │  └─ revalidate/route.ts
│  ├─ manifest.ts
│  ├─ sw.ts                        # service worker source
│  ├─ globals.css
│  └─ layout.tsx                   # fonts, metadata, providers
├─ components/
│  ├─ ui/                          # Button, Card, Glass, Slider, Toast…
│  ├─ site/                        # Hero, PriceCalculator, WhatsAppFab, InstallPrompt, ProductCard
│  └─ admin/                       # OrderBoard, OrderTable, HeroEditor, TierEditor, ImageUploader
├─ lib/
│  ├─ supabase/{client,server,admin}.ts
│  ├─ pricing.ts                   # calcPrice (shared)
│  ├─ whatsapp.ts                  # buildMessage, buildUrl
│  ├─ validators.ts                # Zod schemas
│  └─ settings.ts                  # typed getSettings(key)
├─ hooks/                          # useRealtimeOrders, useInstallPrompt
├─ types/database.ts               # generated via supabase gen types
├─ middleware.ts                   # admin route protection
├─ public/icons/                   # maskable icons, favicon
├─ supabase/migrations/            # SQL above, versioned
├─ tailwind.config.ts              # tokens from §5
└─ next.config.ts
Key flows
Order: Calculator → POST /api/orders (Zod validate → recompute price from DB tiers → insert order + items → return number) → wa.me redirect.
Admin update: Server action writes site_settings/products → revalidateTag → storefront refreshes.
Realtime: Admin client subscribes to postgres_changes on orders → UI + notification.
Security: RLS everywhere; service role never in the client; admin whitelist table; rate limiting and honeypot on orders; sanitize Markdown descriptions; image MIME/size limits on upload; HTTPS-only, CSP headers.
Delivery plan
Phase	Scope	Est.
0	Design tokens, Supabase schema + RLS, seeding	3 days
1	Storefront, hero, calculator, WhatsApp flow	1.5 wks
2	Admin auth, orders dashboard (realtime), content tab	1.5 wks
3	PWA (SW, offline, install), performance, a11y QA	1 wk
4	Launch, analytics, post-launch tuning	3 days
Future roadmap: Razorpay/Stripe checkout, customer accounts and reorder, inventory counts, discount codes, multi-language, push notifications for customers, blog/SEO content hub.
Open questions for the owner: currency/regions served, delivery fee logic, minimum order, GST/invoice needs, packaging sizes and ash sourcing claims (for compliance-safe copy).