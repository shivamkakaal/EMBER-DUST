"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  FileText,
  X,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Zap,
  Copy,
  Check,
  Radio,
} from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { PRODUCTS, getProductBySlug } from "@/lib/products";
import { DEFAULT_WHATSAPP_NUMBER, buildWhatsAppUrl } from "@/lib/whatsapp";
import { playOrderChime } from "@/lib/admin-notifications";
import { createClient } from "@/utils/supabase/client";

interface OrderItem {
  id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price?: number;
  line_total?: number;
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total: number;
  subtotal?: number;
  delivery_fee?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  tracking_info?: string;
  created_at: string;
  product_name?: string;
  quantity?: number;
  unit?: string;
  order_items?: OrderItem[];
}

interface OrderHistorySectionProps {
  isDedicatedPage?: boolean;
}

interface StatusAlertPayload {
  orderNumber: string;
  oldStatus?: string;
  newStatus: string;
  trackingInfo?: string;
  message: string;
}

export default function OrderHistorySection({ isDedicatedPage = false }: OrderHistorySectionProps) {
  const { openOrderModal } = useOrder();

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CustomerOrder[] | null>(null);
  const [savedOrders, setSavedOrders] = useState<CustomerOrder[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<CustomerOrder | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "delivered">("all");

  // Real-time synchronization states
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [statusAlert, setStatusAlert] = useState<StatusAlertPayload | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // References to prevent race conditions during background sync
  const activeSearchQueryRef = useRef<string>("");
  const isSyncingRef = useRef<boolean>(false);
  const prevStatusesRef = useRef<Map<string, { status: string; tracking: string | null }>>(new Map());

  const getStatusBadge = (status: CustomerOrder["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "Verification Pending",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          step: 1,
        };
      case "processing":
        return {
          label: "In Processing / Sieving",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          step: 2,
        };
      case "shipped":
        return {
          label: "Dispatched / In Transit",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          step: 3,
        };
      case "delivered":
        return {
          label: "Delivered to Doorstep",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          step: 4,
        };
      case "cancelled":
        return {
          label: "Order Cancelled",
          color: "bg-red-500/10 text-red-400 border-red-500/30",
          step: 0,
        };
      default:
        return {
          label: "Order Placed",
          color: "bg-white/10 text-white border-white/20",
          step: 1,
        };
    }
  };

  // Inspect incoming orders for live status changes and notify customer
  const checkAndNotifyChanges = useCallback((freshOrders: CustomerOrder[]) => {
    for (const fresh of freshOrders) {
      const existing = prevStatusesRef.current.get(fresh.order_number);
      if (existing) {
        const statusChanged = existing.status !== fresh.status;
        const trackingChanged = Boolean(
          fresh.tracking_info && existing.tracking !== fresh.tracking_info
        );

        if (statusChanged || trackingChanged) {
          // Play acoustic order chime
          playOrderChime(0.65);

          const badge = getStatusBadge(fresh.status);
          const msg = statusChanged
            ? `Consignment #${fresh.order_number} status updated to: "${badge.label}"!`
            : `Courier tracking details added for #${fresh.order_number}: ${fresh.tracking_info}`;

          setStatusAlert({
            orderNumber: fresh.order_number,
            oldStatus: existing.status,
            newStatus: fresh.status,
            trackingInfo: fresh.tracking_info,
            message: msg,
          });

          // Auto-clear alert banner after 8 seconds
          setTimeout(() => {
            setStatusAlert((curr) => (curr?.orderNumber === fresh.order_number ? null : curr));
          }, 8000);
        }
      }

      // Record latest snapshot in map
      prevStatusesRef.current.set(fresh.order_number, {
        status: fresh.status,
        tracking: fresh.tracking_info || null,
      });
    }
  }, []);

  // Primary background sync routine
  const syncOrders = useCallback(
    async (isSilent = true) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      if (!isSilent) setIsAutoSyncing(true);

      try {
        // 1. Sync active search query if present
        const activeQ = activeSearchQueryRef.current.trim();
        if (activeQ) {
          const res = await fetch(`/api/orders?query=${encodeURIComponent(activeQ)}`);
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            checkAndNotifyChanges(data.orders);
            setSearchResults(data.orders);
          }
        }

        // 2. Sync saved local orders
        const stored = typeof window !== "undefined" ? localStorage.getItem("ember_customer_orders") : null;
        if (stored) {
          try {
            const localOrders: CustomerOrder[] = JSON.parse(stored);
            if (localOrders.length > 0) {
              const promises = localOrders.slice(0, 5).map(async (o) => {
                try {
                  const r = await fetch(`/api/orders?query=${encodeURIComponent(o.order_number)}`);
                  const d = await r.json();
                  return d.orders?.[0] || null;
                } catch {
                  return null;
                }
              });

              const fetched = (await Promise.all(promises)).filter(Boolean) as CustomerOrder[];
              if (fetched.length > 0) {
                checkAndNotifyChanges(fetched);
                setSavedOrders((prev) => {
                  const updated = prev.map((old) => {
                    const fresh = fetched.find((f) => f.order_number === old.order_number);
                    return fresh
                      ? {
                          ...old,
                          status: fresh.status,
                          tracking_info: fresh.tracking_info,
                          total: fresh.total || old.total,
                          order_items: fresh.order_items || old.order_items,
                        }
                      : old;
                  });
                  try {
                    localStorage.setItem("ember_customer_orders", JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            }
          } catch {
            // Ignore JSON parse errors
          }
        }

        setLastSyncedAt(new Date());
      } catch (err) {
        console.warn("Background order sync warning:", err);
      } finally {
        isSyncingRef.current = false;
        setIsAutoSyncing(false);
      }
    },
    [checkAndNotifyChanges]
  );

  // Load orders saved locally on this customer's device
  const loadSavedOrders = useCallback(() => {
    try {
      const stored = localStorage.getItem("ember_customer_orders");
      if (stored) {
        const parsed: CustomerOrder[] = JSON.parse(stored);
        setSavedOrders(parsed);

        // Seed current statuses into map
        parsed.forEach((o) => {
          if (!prevStatusesRef.current.has(o.order_number)) {
            prevStatusesRef.current.set(o.order_number, {
              status: o.status,
              tracking: o.tracking_info || null,
            });
          }
        });

        // Background refresh from server for live status updates
        if (parsed.length > 0) {
          syncOrders(true);
        }
      }
    } catch {
      // Ignore
    }
  }, [syncOrders]);

  useEffect(() => {
    loadSavedOrders();

    const handleUpdate = () => loadSavedOrders();
    window.addEventListener("ember_orders_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ember_orders_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadSavedOrders]);

  // Check URL search parameters on client mount (e.g. /track?phone=... or /track?query=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("query") || params.get("order") || params.get("phone");
      if (urlQuery && urlQuery.trim()) {
        const clean = urlQuery.trim();
        setQuery(clean);
        activeSearchQueryRef.current = clean;
        setIsSearching(true);
        setHasSearched(true);
        fetch(`/api/orders?query=${encodeURIComponent(clean)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.orders) {
              checkAndNotifyChanges(data.orders);
              setSearchResults(data.orders);
              setLastSyncedAt(new Date());
            }
          })
          .catch(() => {})
          .finally(() => setIsSearching(false));
      }
    }
  }, [checkAndNotifyChanges]);

  // Periodic Auto-Polling (Every 4 seconds for true live tracking)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        syncOrders(true);
      }
    }, 4000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncOrders(true);
      }
    };

    const handleFocus = () => {
      syncOrders(true);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleFocus);
    };
  }, [syncOrders]);

  // Supabase Real-time postgres_changes listener for instantaneous push updates
  useEffect(() => {
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("customer-tracking-live-stream")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            syncOrders(true);
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime subscription fallback to polling:", err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [syncOrders]);

  // Seconds ago tick counter for UI badge
  useEffect(() => {
    const tick = setInterval(() => {
      if (lastSyncedAt) {
        const diff = Math.max(0, Math.floor((Date.now() - lastSyncedAt.getTime()) / 1000));
        setSecondsAgo(diff);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [lastSyncedAt]);

  // Handle Search Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    activeSearchQueryRef.current = cleanQuery;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders?query=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();
      if (data.orders) {
        checkAndNotifyChanges(data.orders);
        setSearchResults(data.orders);
        setLastSyncedAt(new Date());
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Order search error:", err);
      // Fallback search in local orders
      const localMatches = savedOrders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(cleanQuery.toLowerCase()) ||
          o.customer_phone.includes(cleanQuery)
      );
      setSearchResults(localMatches);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    activeSearchQueryRef.current = "";
    setSearchResults(null);
    setHasSearched(false);
  };

  const handleCopyTracking = (trackingText: string) => {
    if (!trackingText) return;
    navigator.clipboard.writeText(trackingText);
    setCopiedTrackingId(trackingText);
    setTimeout(() => {
      setCopiedTrackingId(null);
    }, 2500);
  };

  // Determine list of orders to display
  const displayedOrders = searchResults !== null ? searchResults : savedOrders;

  const filteredOrders = displayedOrders.filter((order) => {
    if (filterTab === "active") {
      return ["pending", "processing", "shipped"].includes(order.status);
    }
    if (filterTab === "delivered") {
      return order.status === "delivered";
    }
    return true;
  });

  const handleReorder = (order: CustomerOrder) => {
    const matchedProduct =
      (order.order_items?.[0] &&
        PRODUCTS.find((p) => p.name === order.order_items?.[0].product_name)) ||
      (order.product_name && PRODUCTS.find((p) => p.name === order.product_name)) ||
      PRODUCTS[0];

    const qty = order.order_items?.[0]?.quantity || order.quantity || 5;
    openOrderModal(matchedProduct, qty);
  };

  return (
    <section id="order-history" className="py-20 sm:py-28 bg-[#181A1D] text-[#EDE6DA] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8935A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Dedicated Page Breadcrumb / Navigation */}
        {isDedicatedPage && (
          <div className="mb-8 pt-2 flex items-center justify-between border-b border-white/10 pb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#D8CBB6] hover:text-[#B8935A] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-[#8E959E] font-medium hidden sm:inline">
                Ember Dust Live Consignment Tracking
              </span>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8935A]/15 border border-[#B8935A]/30 text-[#B8935A] text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#25D366]" />
            <span>Live Consignment Tracking &amp; History</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Track Your Wood Ash Orders
          </h2>

          <p className="text-sm sm:text-base text-[#8E959E] leading-relaxed">
            Enter your <strong className="text-white">Order ID</strong> (e.g. ED-20261009-XXXX) or{" "}
            <strong className="text-white">Mobile Number</strong> to check real-time dispatch status, courier AWB tracking, and digital receipt.
          </p>
        </div>

        {/* Search Bar Card */}
        <div className="max-w-2xl mx-auto mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center gap-2 bg-[#222429] p-2 rounded-2xl border border-white/10 shadow-2xl focus-within:border-[#B8935A] transition-all"
          >
            <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
              <Search className="w-4 h-4 text-[#8E959E] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (ED-XXXX) or Phone Number (e.g. 7006506721)..."
                className="bg-transparent text-white placeholder-[#8E959E] text-sm font-medium w-full focus:outline-none py-2"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-[#B8935A] hover:bg-[#A37F46] disabled:opacity-50 text-[#181A1D] font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[#181A1D] border-t-transparent animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Badges */}
          <div className="flex items-center justify-between text-xs text-[#8E959E] mt-3 px-2">
            <span>
              {savedOrders.length > 0 ? (
                <span className="text-[#25D366] font-semibold">
                  ✓ {savedOrders.length} order(s) placed on this device
                </span>
              ) : (
                "Search anytime using your 10-digit mobile number"
              )}
            </span>

            {hasSearched && (
              <button
                onClick={handleClearSearch}
                className="text-[#B8935A] hover:underline font-bold"
              >
                Reset to My Orders
              </button>
            )}
          </div>
        </div>

        {/* Live Real-time Status Sync Banner */}
        {displayedOrders.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#222429]/90 border border-emerald-500/30 px-4 py-2.5 rounded-2xl shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
                </span>
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                  <span className="text-emerald-400">Live Real-time Sync Active</span>
                  <span className="hidden sm:inline text-[#8E959E] font-normal">• Auto-syncs every 4s</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#8E959E] font-mono">
                  {isAutoSyncing ? (
                    <span className="text-[#F5C26B] font-semibold flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 animate-spin" /> Syncing...
                    </span>
                  ) : lastSyncedAt ? (
                    <span>Synced {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}</span>
                  ) : (
                    <span>Connected</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => syncOrders(false)}
                  disabled={isAutoSyncing}
                  title="Force refresh live status now"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isAutoSyncing ? "animate-spin text-[#B8935A]" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Status Change Alert Banner */}
        {statusAlert && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#222429] to-emerald-950/90 border border-emerald-500/50 shadow-2xl flex items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Status Update
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    #{statusAlert.orderNumber}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-100 mt-1">
                  {statusAlert.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setStatusAlert(null)}
              className="p-1 rounded-full text-emerald-300/60 hover:text-emerald-100 hover:bg-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        {displayedOrders.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === "all"
                  ? "bg-[#B8935A] text-[#181A1D] shadow-md"
                  : "bg-white/5 text-[#8E959E] hover:text-white"
              }`}
            >
              All Orders ({displayedOrders.length})
            </button>
            <button
              onClick={() => setFilterTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === "active"
                  ? "bg-[#B8935A] text-[#181A1D] shadow-md"
                  : "bg-white/5 text-[#8E959E] hover:text-white"
              }`}
            >
              In Transit / Active
            </button>
            <button
              onClick={() => setFilterTab("delivered")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === "delivered"
                  ? "bg-[#B8935A] text-[#181A1D] shadow-md"
                  : "bg-white/5 text-[#8E959E] hover:text-white"
              }`}
            >
              Delivered
            </button>
          </div>
        )}

        {/* Orders Listing */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const itemsList =
                order.order_items && order.order_items.length > 0
                  ? order.order_items
                  : [
                      {
                        product_name: order.product_name || "Organic Hardwood Ash",
                        quantity: order.quantity || 5,
                        unit: order.unit || "kg",
                        line_total: order.total,
                      },
                    ];

              const whatsappInquiryUrl = buildWhatsAppUrl(
                DEFAULT_WHATSAPP_NUMBER,
                `Hello Ember Dust 👋 I would like to get a live update on my consignment ${order.order_number}. Customer Name: ${order.customer_name}.`
              );

              return (
                <div
                  key={order.order_number || order.id}
                  className="bg-[#222429] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl hover:border-white/20 transition-all space-y-6 relative overflow-hidden"
                >
                  {/* Card Top: Order Number, Date, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-[#F5C26B]">
                          {order.order_number}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8E959E] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span>UPI / Pay on Delivery</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#8E959E]">Consignment Total</div>
                      <div className="text-xl font-black text-white">
                        ₹{order.total.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Visual Fulfillment Step Pipeline with Pulsing Active Step */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1: Received */}
                      <div className="space-y-1.5">
                        <div
                          className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            badge.step === 1
                              ? "bg-[#25D366] text-black ring-4 ring-[#25D366]/30 animate-pulse font-black"
                              : badge.step > 1
                              ? "bg-[#25D366] text-black"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {badge.step > 1 ? "✓" : "1"}
                        </div>
                        <div className={`font-bold text-[11px] ${badge.step >= 1 ? "text-white" : "text-white/40"}`}>
                          Order Placed
                        </div>
                      </div>

                      {/* Step 2: Processing */}
                      <div className="space-y-1.5">
                        <div
                          className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            badge.step === 2
                              ? "bg-[#25D366] text-black ring-4 ring-[#25D366]/30 animate-pulse font-black"
                              : badge.step > 2
                              ? "bg-[#25D366] text-black"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {badge.step > 2 ? "✓" : "2"}
                        </div>
                        <div className={`font-bold text-[11px] ${badge.step >= 2 ? "text-white" : "text-white/40"}`}>
                          Triple-Sieved
                        </div>
                      </div>

                      {/* Step 3: Shipped */}
                      <div className="space-y-1.5">
                        <div
                          className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            badge.step === 3
                              ? "bg-[#25D366] text-black ring-4 ring-[#25D366]/30 animate-pulse font-black"
                              : badge.step > 3
                              ? "bg-[#25D366] text-black"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {badge.step > 3 ? "✓" : "3"}
                        </div>
                        <div className={`font-bold text-[11px] ${badge.step >= 3 ? "text-white" : "text-white/40"}`}>
                          Dispatched
                        </div>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="space-y-1.5">
                        <div
                          className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            badge.step === 4
                              ? "bg-[#25D366] text-black ring-4 ring-[#25D366]/30 font-black"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {badge.step === 4 ? "✓" : "4"}
                        </div>
                        <div className={`font-bold text-[11px] ${badge.step >= 4 ? "text-white" : "text-white/40"}`}>
                          Delivered
                        </div>
                      </div>
                    </div>

                    {/* Progress Connecting Bar */}
                    <div className="relative mt-2.5 h-1.5 bg-white/10 rounded-full overflow-hidden mx-6">
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-[#25D366] transition-all duration-700 ease-out rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(15, (badge.step / 4) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Courier Tracking info with Copy Action */}
                  {order.tracking_info && (
                    <div className="bg-[#181A1D] border border-[#B8935A]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-[#B8935A] shrink-0" />
                        <div>
                          <span className="text-[#8E959E]">Courier AWB / Tracking ID: </span>
                          <strong className="text-white font-mono">{order.tracking_info}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(order.tracking_info || "")}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D8CBB6] hover:text-white border border-white/10 flex items-center gap-1.5 text-[11px] font-bold cursor-pointer transition-all"
                        >
                          {copiedTrackingId === order.tracking_info ? (
                            <>
                              <Check className="w-3 h-3 text-[#25D366]" />
                              <span className="text-[#25D366]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                          Live Courier Sync
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Consignment Items */}
                  <div className="bg-[#1A1C20] rounded-2xl p-4 border border-white/5 space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-[#8E959E] font-bold">
                      Package Contents:
                    </div>
                    {itemsList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-white"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#B8935A]" />
                          <span className="font-bold">{item.product_name}</span>
                        </div>
                        <span className="text-[#8E959E] font-mono">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-[#8E959E] flex items-start gap-1.5 max-w-md">
                      <MapPin className="w-3.5 h-3.5 text-[#B8935A] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {order.delivery_address || "Customer address logged on file"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* WhatsApp Support Button */}
                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#25D366] text-white hover:text-black border border-white/10 text-xs font-bold transition-all cursor-pointer"
                        title="Inquire directly on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Help</span>
                      </a>

                      {/* Digital Receipt Button */}
                      <button
                        onClick={() => setActiveReceiptOrder(order)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                        title="View printable digital receipt"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#B8935A]" />
                        <span>Receipt</span>
                      </button>

                      {/* Re-order / Buy Again */}
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B8935A] hover:bg-[#A37F46] text-[#181A1D] text-xs font-extrabold transition-all shadow-md cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Buy Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search / No Orders State */
          <div className="bg-[#222429] border border-white/10 rounded-3xl p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 shadow-xl">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#B8935A]/10 border border-[#B8935A]/30 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-[#B8935A]" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              {hasSearched ? "No Orders Found" : "No Saved Orders Yet"}
            </h3>

            <p className="text-xs text-[#8E959E] leading-relaxed">
              {hasSearched
                ? `We couldn't find any orders matching "${query}". Please check the phone number or order number, or contact us directly on WhatsApp.`
                : "You haven't placed an order from this device yet. Explore our artisanal wood ash catalog and place an order with instant WhatsApp confirmation!"}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#products"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#B8935A] hover:bg-[#A37F46] text-[#181A1D] font-extrabold text-xs transition-all shadow-md inline-block text-center"
              >
                Browse Wood Ash Blends
              </Link>

              <a
                href={buildWhatsAppUrl(
                  DEFAULT_WHATSAPP_NUMBER,
                  "Hello Ember Dust, I need help finding my past order."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      {activeReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181A1D] border border-white/15 rounded-3xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl relative">
            <button
              onClick={() => setActiveReceiptOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8935A]/20 border border-[#B8935A]/40 flex items-center justify-center text-[#B8935A] font-bold">
                ED
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">Ember Dust Consignment Receipt</h4>
                <div className="font-mono text-xs text-[#B8935A] font-bold">
                  {activeReceiptOrder.order_number}
                </div>
              </div>
            </div>

            <div className="bg-[#222429] p-4 rounded-2xl border border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Date:</span>
                <span className="text-white font-medium">
                  {new Date(activeReceiptOrder.created_at).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Customer:</span>
                <span className="text-white font-medium">{activeReceiptOrder.customer_name}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Phone:</span>
                <span className="text-white font-medium">{activeReceiptOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Destination:</span>
                <span className="text-white font-medium text-right max-w-[200px] truncate">
                  {activeReceiptOrder.delivery_address}
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold">
                <span>Total Amount Paid / COD:</span>
                <span className="text-base text-[#25D366]">
                  ₹{activeReceiptOrder.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setActiveReceiptOrder(null)}
                className="flex-1 py-3 bg-[#B8935A] text-[#181A1D] rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
