import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_SITE_CONFIG, SiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("key, value");

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        config: DEFAULT_SITE_CONFIG,
        isDefault: true,
      });
    }

    // Merge database settings with defaults
    let mergedConfig: SiteConfig = { ...DEFAULT_SITE_CONFIG };

    for (const item of data) {
      if (item.key === "full_site_config" && item.value) {
        mergedConfig = { ...mergedConfig, ...item.value };
      } else if (item.key === "hero" && item.value) {
        mergedConfig.hero = { ...mergedConfig.hero, ...item.value };
      } else if (item.key === "announcement" && item.value) {
        mergedConfig.announcement = { ...mergedConfig.announcement, ...item.value };
      } else if (item.key === "whatsapp" && item.value) {
        mergedConfig.whatsapp = { ...mergedConfig.whatsapp, ...item.value };
      } else if (item.key === "shipping" && item.value) {
        mergedConfig.shipping = { ...mergedConfig.shipping, ...item.value };
      } else if (item.key === "products" && item.value) {
        mergedConfig.products = item.value;
      } else if (item.key === "categories" && item.value) {
        mergedConfig.categories = item.value;
      } else if (item.key === "securityPin" && item.value) {
        mergedConfig.securityPin = item.value;
      } else if (item.key === "story" && item.value) {
        mergedConfig.story = { ...mergedConfig.story, ...item.value };
      }
    }

    return NextResponse.json({ config: mergedConfig, isDefault: false });
  } catch (err: any) {
    console.error("Failed to load settings:", err);
    return NextResponse.json({
      config: DEFAULT_SITE_CONFIG,
      isDefault: true,
      error: err.message,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: SiteConfig = body.config;

    if (!config) {
      return NextResponse.json(
        { error: "Configuration object required" },
        { status: 400 }
      );
    }

    // Store in Supabase site_settings table as 'full_site_config'
    const { error: upsertError } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        {
          key: "full_site_config",
          value: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (upsertError) {
      console.warn("Supabase upsert warning:", upsertError.message);
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (err: any) {
    console.error("Save settings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
