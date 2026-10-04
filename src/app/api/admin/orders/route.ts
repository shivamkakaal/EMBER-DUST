import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase orders query error (returning demo orders):", error.message);
      return NextResponse.json({
        orders: getDemoOrders(),
        isDemo: true,
      });
    }

    return NextResponse.json({
      orders: orders && orders.length > 0 ? orders : getDemoOrders(),
      isDemo: !orders || orders.length === 0,
    });
  } catch (err: any) {
    return NextResponse.json({
      orders: getDemoOrders(),
      isDemo: true,
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, trackingInfo } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        tracking_info: trackingInfo || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getDemoOrders() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return [
    {
      id: "demo-1",
      order_number: `ED-${today}-1042`,
      customer_name: "Asha Sharma",
      customer_phone: "9876543210",
      delivery_address: "Koramangala, Bangalore 560034",
      notes: "Please deliver before Friday for weekend tomato planting.",
      subtotal: 475.0,
      delivery_fee: 0,
      total: 475.0,
      status: "pending",
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      order_items: [
        {
          id: "item-1",
          product_name: "Pure Organic Hardwood Ash",
          quantity: 5,
          unit: "kg",
          unit_price: 95.0,
          line_total: 475.0,
        },
      ],
    },
    {
      id: "demo-2",
      order_number: `ED-${today}-0982`,
      customer_name: "Ravi Pottery Studio",
      customer_phone: "9811223344",
      delivery_address: "Studio 4, Hauz Khas Village, New Delhi",
      notes: "Need 100-mesh fine powder for celadon reduction firing.",
      subtotal: 2200.0,
      delivery_fee: 0,
      total: 2200.0,
      status: "processing",
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      order_items: [
        {
          id: "item-2",
          product_name: "Studio Ceramic Glaze Ash (Ultra-Fine)",
          quantity: 20,
          unit: "kg",
          unit_price: 110.0,
          line_total: 2200.0,
        },
      ],
    },
    {
      id: "demo-3",
      order_number: `ED-${today}-0814`,
      customer_name: "Meera Krishnan",
      customer_phone: "9944001122",
      delivery_address: "Indiranagar, Bangalore 560038",
      notes: "Packed in 1kg separate bags if possible.",
      subtotal: 120.0,
      delivery_fee: 50,
      total: 170.0,
      status: "shipped",
      tracking_info: "DELHIVERY-AWB-984102941",
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      order_items: [
        {
          id: "item-3",
          product_name: "Pure Organic Hardwood Ash",
          quantity: 1,
          unit: "kg",
          unit_price: 120.0,
          line_total: 120.0,
        },
      ],
    },
  ];
}
