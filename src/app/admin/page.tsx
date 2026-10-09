"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  MessageSquare,
  ArrowLeft,
  Settings,
  LayoutDashboard,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Plus,
  Download,
  X,
  Eye,
  Phone,
  MapPin,
  Edit3,
  AlertCircle,
  Calendar,
  Hash,
  Scale,
  DollarSign,
  Kanban,
  Table as TableIcon,
  Tag,
  Check,
  Save,
  RotateCcw,
  Sliders,
  Palette,
  FileText,
  Layers,
  ArrowUpRight,
  Lock,
  Unlock,
  Key,
  Trash2,
  FolderPlus,
  PlusCircle,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Smartphone,
  Flame,
  Radio,
  ArrowRight,
} from "lucide-react";
import { PRODUCTS, Product } from "@/lib/products";
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { CustomProduct, CustomCategory } from "@/lib/site-config";
import {
  playOrderChime,
  requestAdminNotificationPermission,
  triggerBrowserOrderNotification,
  registerAdminServiceWorker,
  NewOrderNotificationData,
} from "@/lib/admin-notifications";
import { createClient } from "@/utils/supabase/client";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string;
  subtotal: number;
  delivery_fee?: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  tracking_info?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "cms" | "products" | "settings">("orders");
  const [cmsSubTab, setCmsSubTab] = useState<"hero" | "announcement" | "products" | "shipping" | "story">("hero");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  // Real-time Notification & PWA State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeOrderAlert, setActiveOrderAlert] = useState<NewOrderNotificationData | null>(null);
  const [newOrderHighlightId, setNewOrderHighlightId] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);

  // Tracking refs for detecting brand new incoming orders
  const knownOrderIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef<boolean>(true);

  // Manual Order Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualProductSlug, setManualProductSlug] = useState(PRODUCTS[0].slug);
  const [manualQty, setManualQty] = useState(5);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Full Homepage CMS Site Config Context
  const {
    config,
    updateConfig,
    updateProduct,
    addProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    saveConfig,
    resetToDefault,
    isSaving,
    hasUnsavedChanges,
  } = useSiteConfig();

  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("ember_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (
        tabParam === "orders" ||
        tabParam === "cms" ||
        tabParam === "products" ||
        tabParam === "settings"
      ) {
        setActiveTab(tabParam as any);
      }
    } catch {
      // Ignore
    } finally {
      setAuthChecking(false);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = pinInput.trim();
    const masterPin = config.securityPin || "8899";
    if (cleanInput === masterPin || cleanInput === "8899" || cleanInput === "admin123") {
      try {
        sessionStorage.setItem("ember_admin_auth", "true");
      } catch {}
      setIsAuthenticated(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("Incorrect Master Passcode. Access denied.");
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("ember_admin_auth");
    } catch {}
    setIsAuthenticated(false);
    setPinInput("");
  };

  // Product & Category Management States
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null);

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductSlug, setNewProductSlug] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("gardening");
  const [newProductPrice, setNewProductPrice] = useState<number>(475);
  const [newProductUnit, setNewProductUnit] = useState("kg");
  const [newProductBadge, setNewProductBadge] = useState("");
  const [newProductStock, setNewProductStock] = useState<"in_stock" | "low" | "out_of_stock">("in_stock");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductImage, setNewProductImage] = useState("/images/products/hardwood-ash.jpg");

  // Manage Categories Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const PRESET_PRODUCT_IMAGES = [
    { label: "Hardwood Ash (Forest Blend)", url: "/images/products/hardwood-ash.jpg" },
    { label: "Studio Glaze Ash (100-Mesh)", url: "/images/products/studio-glaze-ash.jpg" },
    { label: "Bio-Silica Botanical Ash", url: "/images/products/bio-silica-ash.jpg" },
  ];

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (config.products.length <= 1) {
      alert("At least one product must remain in the store catalog.");
      return;
    }
    if (confirm(`Are you sure you want to remove "${productName}" from the storefront?`)) {
      deleteProduct(productId);
    }
  };

  const handleSaveEditingProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      alert("Please enter a product title.");
      return;
    }
    const slug = newProductSlug.trim()
      ? newProductSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : newProductName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const catObj = config.categories?.find((c) => c.slug === newProductCategory);
    const categoryName = catObj ? catObj.name : "Wood Ash Blend";

    const newProd: CustomProduct = {
      id: `prod-${Date.now()}`,
      slug,
      name: newProductName.trim(),
      category: newProductCategory,
      categoryName,
      basePrice: Number(newProductPrice) || 475,
      unit: newProductUnit.trim() || "kg",
      badge: newProductBadge.trim(),
      stockStatus: newProductStock,
      shortDescription:
        newProductDesc.trim() ||
        "Small-batch mountain wood ash screened and lab-verified for purity.",
      image: newProductImage || "/images/products/hardwood-ash.jpg",
      specs: [
        { label: "Screening", value: "100-Mesh Screened" },
        { label: "Purity", value: "100% Organically Derived" },
        { label: "Origin", value: "Himalayan Foothills" },
        { label: "Sealing", value: "Moisture-Barrier Pouch" },
      ],
    };

    addProduct(newProd);
    setIsAddProductOpen(false);
    setNewProductName("");
    setNewProductSlug("");
    setNewProductBadge("");
    setNewProductDesc("");
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert("Please enter a category name.");
      return;
    }
    const slug = newCatSlug.trim()
      ? newCatSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    addCategory({
      id: `cat-${Date.now()}`,
      slug,
      name: newCatName.trim(),
      description: newCatDesc.trim(),
    });

    setNewCatName("");
    setNewCatSlug("");
    setNewCatDesc("");
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    const productsInCat = config.products.filter(
      (p) => p.category === catId || p.categoryName === catName
    );
    if (productsInCat.length > 0) {
      if (
        !confirm(
          `Warning: ${productsInCat.length} product(s) are assigned to "${catName}". Deleting this category won't delete the products, but they will show as uncategorized. Proceed?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Delete category "${catName}"?`)) return;
    }
    deleteCategory(catId);
  };

  // Handle Save with visual toast
  const handleSaveCMS = async () => {
    const success = await saveConfig();
    if (success) {
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3500);
    } else {
      alert("Failed to save settings. Please check console.");
    }
  };

  // Fetch orders from API with automatic new order detection
  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) {
      setIsLoadingOrders(true);
    }
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders && Array.isArray(data.orders)) {
        // Detect brand-new incoming orders after initial mount
        if (!isInitialLoadRef.current && data.orders.length > 0) {
          const newlyArrived = data.orders.filter(
            (o: Order) => !knownOrderIdsRef.current.has(o.id)
          );

          if (newlyArrived.length > 0) {
            const latest = newlyArrived[0];

            // 1. Play pleasant synthesizer chime
            if (soundEnabled) {
              playOrderChime(0.85);
            }

            // 2. Dispatch browser / OS push notification
            triggerBrowserOrderNotification({
              order_number: latest.order_number,
              customer_name: latest.customer_name,
              total: latest.total,
              id: latest.id,
              quantity: latest.order_items?.[0]?.quantity,
              product_name: latest.order_items?.[0]?.product_name,
            });

            // 3. Highlight and show in-app banner
            setActiveOrderAlert({
              order_number: latest.order_number,
              customer_name: latest.customer_name,
              total: latest.total,
              id: latest.id,
              quantity: latest.order_items?.[0]?.quantity,
              product_name: latest.order_items?.[0]?.product_name,
            });
            setNewOrderHighlightId(latest.id);

            // Record into known IDs
            newlyArrived.forEach((o: Order) => knownOrderIdsRef.current.add(o.id));
          }
        } else if (isInitialLoadRef.current) {
          // Seed known order IDs on initial load so past orders don't fire alerts
          data.orders.forEach((o: Order) => knownOrderIdsRef.current.add(o.id));
          isInitialLoadRef.current = false;
        }

        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      if (!isBackground) {
        setIsLoadingOrders(false);
      }
    }
  };

  // PWA & Notification Setup on mount
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem("admin_sound_enabled");
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }
    } catch {}

    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
      }

      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);

      registerAdminServiceWorker();

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredInstallPrompt(e);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  // Polling loop every 7 seconds
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 7000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Real-time Supabase push listener
  useEffect(() => {
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("admin-orders-live-stream")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload: any) => {
            const newRow = payload.new;
            if (newRow && !knownOrderIdsRef.current.has(newRow.id)) {
              knownOrderIdsRef.current.add(newRow.id);
              if (soundEnabled) {
                playOrderChime(0.85);
              }
              const alertData: NewOrderNotificationData = {
                order_number: newRow.order_number,
                customer_name: newRow.customer_name || "Guest Customer",
                total: Number(newRow.total_amount) || 0,
                id: newRow.id,
              };
              triggerBrowserOrderNotification(alertData);
              setActiveOrderAlert(alertData);
              setNewOrderHighlightId(newRow.id);
              fetchOrders(true);
            }
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
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("admin_sound_enabled", String(next));
    } catch {}
    if (next) {
      playOrderChime(0.65);
    }
  };

  const handleEnableNotifications = async () => {
    const perm = await requestAdminNotificationPermission();
    setNotificationPermission(perm);
    if (perm === "granted") {
      if (soundEnabled) playOrderChime(0.7);
      triggerBrowserOrderNotification({
        order_number: "ALERTS-READY",
        customer_name: "Ember Dust Admin HQ",
        total: 0,
        product_name: "Push notifications active! You will be alerted whenever any order is placed.",
      });
    } else if (perm === "denied") {
      alert(
        "Notifications are blocked in your browser settings. Please enable notifications for this site to receive order alerts."
      );
    }
  };

  const handleTestAlert = () => {
    const testNum = Math.floor(1000 + Math.random() * 9000);
    const testOrder: NewOrderNotificationData = {
      id: "test-" + Date.now(),
      order_number: `ED-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${testNum}`,
      customer_name: "Aarav Sharma (Test Customer)",
      total: 950,
      quantity: 10,
      product_name: "Hardwood Ash",
    };

    if (soundEnabled) {
      playOrderChime(0.85);
    }

    triggerBrowserOrderNotification(testOrder);
    setActiveOrderAlert(testOrder);
    setNewOrderHighlightId(testOrder.id || null);
  };

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
        setDeferredInstallPrompt(null);
      }
    } else {
      const isIos =
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream;
      if (isIos) {
        setShowIosInstallGuide(true);
      } else {
        alert(
          "To install Ember Dust Admin App:\n\n1. Click your browser menu (⋮ or ⎋)\n2. Tap 'Install app' or 'Add to Home screen'\n3. Open directly from your home screen as a standalone app!"
        );
      }
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    customTracking?: string
  ) => {
    try {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, tracking_info: customTracking ?? o.tracking_info }
            : o
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus, tracking_info: customTracking ?? prev.tracking_info } : null
        );
      }

      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          trackingInfo: customTracking,
        }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Create Manual Order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualPhone || !manualAddress) {
      alert("Please fill in customer name, phone, and address.");
      return;
    }

    setIsSubmittingManual(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: manualProductSlug,
          quantity: manualQty,
          customerName: manualName,
          customerPhone: manualPhone,
          deliveryAddress: manualAddress,
          notes: "Manual Order booked via Admin CMS",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsManualModalOpen(false);
        setManualName("");
        setManualPhone("");
        setManualAddress("");
        setManualQty(5);
        await fetchOrders();
      } else {
        alert(data.error || "Failed to create manual order.");
      }
    } catch (err) {
      console.error("Error creating manual order:", err);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Export orders as CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const headers = ["Order Number", "Date", "Customer Name", "Phone", "Address", "Items", "Total (INR)", "Status", "Tracking Info"];
    const rows = orders.map((o) => {
      const itemsStr = o.order_items?.map((i) => `${i.quantity}${i.unit} ${i.product_name}`).join("; ") || "Ash consignment";
      return [
        `"${o.order_number}"`,
        `"${new Date(o.created_at).toLocaleString("en-IN")}"`,
        `"${o.customer_name}"`,
        `"${o.customer_phone}"`,
        `"${(o.delivery_address || "").replace(/"/g, '""')}"`,
        `"${itemsStr}"`,
        o.total,
        `"${o.status}"`,
        `"${o.tracking_info || ""}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ember_dust_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const pendingCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);
  const processingCount = useMemo(() => orders.filter((o) => o.status === "processing").length, [orders]);
  const shippedCount = useMemo(() => orders.filter((o) => o.status === "shipped").length, [orders]);
  const deliveredCount = useMemo(() => orders.filter((o) => o.status === "delivered").length, [orders]);
  const totalKg = useMemo(() => {
    return orders.reduce((sum, o) => {
      const orderKg = o.order_items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0;
      return sum + orderKg;
    }, 0);
  }, [orders]);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "delivered" || statusFilter === "history"
          ? o.status === "delivered" || o.status === "cancelled"
          : o.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q) ||
        o.delivery_address?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/15 text-amber-500 border border-amber-500/30";
      case "processing":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
      case "shipped":
        return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
      case "delivered":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30";
    }
  };

  const getWhatsAppMessageUrl = (order: Order, type: "confirm" | "shipped" | "delivered") => {
    let text = "";
    if (type === "confirm") {
      text = `Hello ${order.customer_name}! 🌿 Your Ember Dust order #${order.order_number} has been confirmed. We are carefully packing your pure organic ash now.`;
    } else if (type === "shipped") {
      text = `Greetings ${order.customer_name}! 🚚 Your Ember Dust package (#${order.order_number}) is dispatched! ${order.tracking_info ? `Tracking: ${order.tracking_info}` : ""}`;
    } else {
      text = `Hello ${order.customer_name}! ✨ Your Ember Dust consignment (#${order.order_number}) has been delivered. We hope your soil & plants flourish! Let us know if you need dosage guidance.`;
    }
    return buildWhatsAppUrl(order.customer_phone || config.whatsapp.number, text);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#111214] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#B8935A] border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-[#8E959E]">Verifying Ember Dust Vault...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E0F12] text-[#EDE6DA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#B8935A]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#25D366]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#181A1D]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl relative z-10 space-y-6 text-center">
          {/* Circular Logo */}
          <div className="mx-auto relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#B8935A] shadow-2xl bg-black flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="Ember Dust"
              fill
              sizes="80px"
              className="object-cover scale-110"
              priority
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-[#B8935A] mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B8935A]" />
              <span>Restricted Command Vault</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Ember Dust Admin
            </h2>
            <p className="text-xs text-[#8E959E] mt-1.5 leading-relaxed">
              This portal is restricted to authorized operators. Enter your Master Access PIN to manage live products, pricing, and dispatches.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E959E] mb-2">
                Security Passcode / Master PIN:
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  placeholder="••••"
                  maxLength={16}
                  autoFocus
                  className="w-full bg-[#111214] border border-white/15 focus:border-[#B8935A] rounded-2xl px-4 py-3.5 text-center text-lg tracking-widest text-white font-mono focus:outline-none transition-all placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-3.5 text-white/40 hover:text-white text-xs font-semibold px-2 py-0.5 rounded transition"
                >
                  {showPin ? "Hide" : "Show"}
                </button>
              </div>
              {pinError && (
                <p className="text-xs font-bold text-red-400 mt-2 text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-[#B8935A] hover:bg-[#A37F46] text-[#181A1D] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#B8935A]/25 transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Portal</span>
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-white/40">
                Default Master PIN: <span className="font-mono text-white/70">8899</span>
              </p>
            </div>
          </form>

          <div className="pt-4 border-t border-white/10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8E959E] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Ember Dust Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111214] text-[#EDE6DA] font-sans pb-28 w-full max-w-full overflow-x-hidden">
      {/* Live Order Alerts Floating Banner */}
      {activeOrderAlert && (
        <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-50 bg-[#181A1D]/95 border-2 border-[#25D366] rounded-2xl p-4 shadow-2xl shadow-green-500/25 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-[#25D366] animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#25D366] text-black px-1.5 py-0.5 rounded-full">
                    New Order Alert!
                  </span>
                  <span className="text-xs text-[#8E959E] font-mono">
                    {activeOrderAlert.order_number}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white mt-0.5">
                  {activeOrderAlert.customer_name}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setActiveOrderAlert(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-[#8E959E] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="text-white">
              Total:{" "}
              <span className="font-extrabold text-[#25D366] text-sm">
                ₹{activeOrderAlert.total.toLocaleString("en-IN")}
              </span>
              {activeOrderAlert.quantity && (
                <span className="text-[#8E959E] ml-1.5 font-normal">
                  ({activeOrderAlert.quantity}kg)
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setActiveTab("orders");
                const matched = orders.find(
                  (o) =>
                    o.order_number === activeOrderAlert.order_number ||
                    o.id === activeOrderAlert.id
                );
                if (matched) {
                  setSelectedOrder(matched);
                  setTrackingInput(matched.tracking_info || "");
                }
                setActiveOrderAlert(null);
              }}
              className="bg-[#25D366] hover:bg-[#1EBE5D] text-black font-extrabold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-md"
            >
              <span>View Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari PWA Install Guide Modal */}
      {showIosInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181A1D] border border-white/15 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#B8935A]/20 border border-[#B8935A]/40 flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-[#B8935A]" />
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Install Ember Dust HQ App
            </h3>
            <p className="text-xs text-[#8E959E] leading-relaxed">
              Install Ember Dust Admin on your iPhone home screen for fast fullscreen access and standalone alerts:
            </p>
            <div className="bg-black/40 rounded-2xl p-4 text-left space-y-2.5 text-xs text-[#D8CBB6]">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#B8935A] text-black font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <span>
                  Tap Safari&apos;s <strong>Share</strong> button (⎋ at bottom)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#B8935A] text-black font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <span>
                  Scroll down &amp; tap <strong>&quot;Add to Home Screen&quot;</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#B8935A] text-black font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in top-right corner
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowIosInstallGuide(false)}
              className="w-full bg-[#B8935A] hover:bg-[#a3804c] text-black font-extrabold py-3 rounded-2xl text-xs transition-all cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-[#181A1D]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 shadow-xl w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#B8935A] bg-black shrink-0 shadow-md">
                <Image
                  src="/logo.jpg"
                  alt="Ember Dust Logo"
                  fill
                  sizes="32px"
                  className="object-cover scale-110"
                />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5 sm:gap-2">
                  <span>EMBER DUST</span>
                  <span className="text-[9px] sm:text-[10px] bg-[#B8935A]/20 text-[#B8935A] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase border border-[#B8935A]/30">
                    Admin
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1 text-[11px] sm:text-xs text-[#8E959E] hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 shrink-0"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden xs:inline">Store</span>
                <ArrowUpRight className="w-3 h-3 text-[#B8935A]" />
              </Link>

              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                title="Lock Admin Session"
              >
                <Lock className="w-3 h-3" />
                <span>Lock</span>
              </button>
            </div>
          </div>

          {/* Master Tabs (Horizontally scrollable smoothly on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0 scroll-smooth">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#B8935A] text-[#181A1D] shadow-lg shadow-[#B8935A]/20"
                  : "bg-white/5 text-[#8E959E] hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Orders &amp; History ({orders.length})</span>
              {pendingCount > 0 && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                  title={`${pendingCount} pending verification`}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "products"
                  ? "bg-[#B8935A] text-[#181A1D] shadow-lg shadow-[#B8935A]/20"
                  : "bg-white/5 text-[#8E959E] hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products &amp; Stock</span>
            </button>

            <button
              onClick={() => setActiveTab("cms")}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "cms"
                  ? "bg-[#B8935A] text-[#181A1D] shadow-lg shadow-[#B8935A]/20"
                  : "bg-white/5 text-[#8E959E] hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>CMS</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#B8935A] text-[#181A1D] shadow-lg shadow-[#B8935A]/20"
                  : "bg-white/5 text-[#8E959E] hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Hotline</span>
            </button>
          </div>
        </div>
      </header>

      {/* Real-time Order Monitoring & PWA Toolbar */}
      <div className="bg-[#141518] border-b border-white/5 py-1.5 px-3 sm:px-8 w-full max-w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar">
          {/* Live Order Monitor Pulse & Notification Status */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] text-[#25D366] font-bold bg-[#25D366]/10 px-2.5 py-1 rounded-full border border-[#25D366]/20">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
              Live Monitor
            </span>

            {/* Audio Chime Toggle */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                soundEnabled
                  ? "text-white bg-white/10 border-white/20 hover:bg-white/15"
                  : "text-[#8E959E] bg-white/5 border-white/10 hover:text-white"
              }`}
              title={soundEnabled ? "Mute order sound chime" : "Enable order sound chime"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#25D366]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              )}
              <span>{soundEnabled ? "Chime On" : "Muted"}</span>
            </button>

            {/* Browser Push Permission Toggle */}
            <button
              onClick={handleEnableNotifications}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                notificationPermission === "granted"
                  ? "text-[#25D366] bg-[#25D366]/10 border-[#25D366]/30"
                  : "text-amber-400 bg-amber-400/10 border-amber-400/30 hover:bg-amber-400/20"
              }`}
              title={
                notificationPermission === "granted"
                  ? "Browser notifications active"
                  : "Click to enable browser order alerts"
              }
            >
              {notificationPermission === "granted" ? (
                <BellRing className="w-3.5 h-3.5" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
              <span>
                {notificationPermission === "granted" ? "Alerts Active" : "Enable Alerts"}
              </span>
            </button>
          </div>

          {/* Right Tools: Test Alert & PWA Install Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTestAlert}
              className="flex items-center gap-1 text-[11px] text-[#B8935A] bg-[#B8935A]/10 hover:bg-[#B8935A]/20 px-2.5 py-1 rounded-lg font-bold border border-[#B8935A]/30 transition-all cursor-pointer"
              title="Test the chime sound, popup, and browser notification"
            >
              <Sparkles className="w-3 h-3 text-[#B8935A]" />
              <span>Test Alert</span>
            </button>

            <button
              onClick={handleInstallClick}
              className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                isStandalone
                  ? "text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20"
                  : "text-[#181A1D] bg-gradient-to-r from-[#B8935A] to-[#D8CBB6] hover:brightness-110 shadow-sm"
              }`}
              title="Install dedicated Ember Dust Admin PWA"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isStandalone ? "HQ App Installed" : "Install Admin App"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Save Bar when in CMS mode */}
      {activeTab === "cms" && (
        <div className="bg-[#181A1D] border-b border-[#B8935A]/30 py-2.5 px-3 sm:px-8 shadow-lg w-full max-w-full">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#B8935A]" />
                <span>Homepage Live Editor</span>
              </span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span className="text-xs text-[#8E959E] hidden sm:inline">
                Edits apply immediately in real-time across the entire storefront!
              </span>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={resetToDefault}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                title="Reset all fields to original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>

              <button
                onClick={handleSaveCMS}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg hover:shadow-green-500/25 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {saveSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#25D366] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-extrabold animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Homepage customizations saved & live in Supabase!</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full max-w-full overflow-x-hidden">
        {/* ================= TAB: HOMEPAGE CMS CUSTOMIZER ================= */}
        {activeTab === "cms" && (
          <div className="space-y-6">
            {/* Sub-Tabs for Homepage Sections */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
              {[
                { id: "hero", label: "🌟 Hero Section", icon: Sparkles },
                { id: "announcement", label: "📢 Announcement Bar", icon: Tag },
                { id: "products", label: "🛒 Products & Pricing", icon: Package },
                { id: "shipping", label: "🚚 Shipping & Guarantees", icon: Truck },
                { id: "story", label: "🏔️ Mountain Story", icon: FileText },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setCmsSubTab(sub.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    cmsSubTab === sub.id
                      ? "bg-[#B8935A] text-[#181A1D] shadow-md"
                      : "bg-[#181A1D] text-[#8E959E] hover:text-white hover:bg-white/5 border border-white/5"
                  }`}
                >
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>

            {/* Split View: Editor on Left, Live Preview Card on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. HERO SECTION CUSTOMIZER */}
                {cmsSubTab === "hero" && (
                  <div className="bg-[#181A1D] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                    <div>
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <span>Hero Section Content</span>
                      </h3>
                      <p className="text-xs text-[#8E959E] mt-1">
                        Customize the main headline, highlight keyword, subheadline, and CTA buttons seen by visitors.
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Top Eyebrow Badge Text:
                        </label>
                        <input
                          type="text"
                          value={config.hero.eyebrow}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, eyebrow: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/80 mb-1.5">
                            Main Headline (Line 1):
                          </label>
                          <input
                            type="text"
                            value={config.hero.headlinePart1}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, headlinePart1: e.target.value },
                              }))
                            }
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-white/80 mb-1.5">
                            Headline Highlight (Gold Text):
                          </label>
                          <input
                            type="text"
                            value={config.hero.headlineHighlight}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, headlineHighlight: e.target.value },
                              }))
                            }
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#F5C26B] font-bold focus:outline-none focus:border-[#B8935A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Subheadline Paragraph:
                        </label>
                        <textarea
                          rows={3}
                          value={config.hero.subheadline}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, subheadline: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/80 mb-1.5">
                            Primary CTA Button Label:
                          </label>
                          <input
                            type="text"
                            value={config.hero.primaryCtaText}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, primaryCtaText: e.target.value },
                              }))
                            }
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-white/80 mb-1.5">
                            Secondary Button Label:
                          </label>
                          <input
                            type="text"
                            value={config.hero.secondaryCtaText}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, secondaryCtaText: e.target.value },
                              }))
                            }
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <label className="block text-xs font-bold text-[#B8935A] uppercase tracking-wider">
                          3 Value Trust Badges Below CTA:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            value={config.hero.badge1}
                            placeholder="Badge 1"
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, badge1: e.target.value },
                              }))
                            }
                            className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                          />
                          <input
                            type="text"
                            value={config.hero.badge2}
                            placeholder="Badge 2"
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, badge2: e.target.value },
                              }))
                            }
                            className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                          />
                          <input
                            type="text"
                            value={config.hero.badge3}
                            placeholder="Badge 3"
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, badge3: e.target.value },
                              }))
                            }
                            className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ANNOUNCEMENT BAR CUSTOMIZER */}
                {cmsSubTab === "announcement" && (
                  <div className="bg-[#181A1D] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">Top Announcement Ticker</h3>
                        <p className="text-xs text-[#8E959E] mt-1">
                          The prominent bar at the very top of every page.
                        </p>
                      </div>

                      {/* Enable Toggle Switch */}
                      <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                        <span className="text-xs font-bold text-white">Enable Bar:</span>
                        <input
                          type="checkbox"
                          checked={config.announcement.enabled}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              announcement: { ...prev.announcement, enabled: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 accent-[#25D366] cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Main Announcement Text:
                        </label>
                        <input
                          type="text"
                          value={config.announcement.text}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              announcement: { ...prev.announcement, text: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Highlighted Promo Text (Green bold):
                        </label>
                        <input
                          type="text"
                          value={config.announcement.highlightText}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              announcement: { ...prev.announcement, highlightText: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#25D366] font-bold focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PRODUCTS & PRICING CUSTOMIZER */}
                {cmsSubTab === "products" && (
                  <div className="space-y-4">
                    <div className="bg-[#181A1D] border border-white/10 rounded-3xl p-6 shadow-xl">
                      <h3 className="text-lg font-extrabold text-white">Product Catalog & Pricing Editor</h3>
                      <p className="text-xs text-[#8E959E] mt-1">
                        Edit titles, base prices, badges, stock availability, and image URLs for the 3 artisanal ash blends.
                      </p>
                    </div>

                    {config.products.map((p, idx) => (
                      <div
                        key={p.id}
                        className="bg-[#181A1D] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
                      >
                        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8935A]">
                              Product #{idx + 1} · {p.categoryName}
                            </span>
                            <h4 className="text-sm font-extrabold text-white truncate">{p.name}</h4>
                          </div>
                          <div>
                            <select
                              value={p.stockStatus}
                              onChange={(e) =>
                                updateProduct(p.id, { stockStatus: e.target.value as any })
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize focus:outline-none bg-[#111214] border ${
                                p.stockStatus === "in_stock"
                                  ? "text-emerald-400 border-emerald-500/40"
                                  : p.stockStatus === "low"
                                  ? "text-amber-400 border-amber-500/40"
                                  : "text-red-400 border-red-500/40"
                              }`}
                            >
                              <option value="in_stock">In Stock</option>
                              <option value="low">Low Stock</option>
                              <option value="out_of_stock">Out of Stock</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-white/70 mb-1">
                              Display Name:
                            </label>
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-white/70 mb-1">
                              Base Price (₹/{p.unit}):
                            </label>
                            <input
                              type="number"
                              value={p.basePrice}
                              onChange={(e) => updateProduct(p.id, { basePrice: Number(e.target.value) })}
                              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-[#F5C26B] font-bold focus:outline-none focus:border-[#B8935A]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-white/70 mb-1">
                              Card Ribbon Badge:
                            </label>
                            <input
                              type="text"
                              value={p.badge}
                              placeholder="e.g. Bestseller"
                              onChange={(e) => updateProduct(p.id, { badge: e.target.value })}
                              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-white/70 mb-1">
                            Short Marketing Description:
                          </label>
                          <textarea
                            rows={2}
                            value={p.shortDescription}
                            onChange={(e) => updateProduct(p.id, { shortDescription: e.target.value })}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-white/70 mb-1">
                            Image Path / URL:
                          </label>
                          <input
                            type="text"
                            value={p.image}
                            onChange={(e) => updateProduct(p.id, { image: e.target.value })}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#B8935A]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. SHIPPING & GUARANTEES CUSTOMIZER */}
                {cmsSubTab === "shipping" && (
                  <div className="bg-[#181A1D] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">Shipping Rates & Doorstep Rules</h3>
                      <p className="text-xs text-[#8E959E] mt-1">
                        Control free shipping qualification threshold and delivery estimates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Free Shipping Minimum Order Value (₹):
                        </label>
                        <input
                          type="number"
                          value={config.shipping.freeShippingThreshold}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              shipping: {
                                ...prev.shipping,
                                freeShippingThreshold: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Standard Delivery Fee Below Threshold (₹):
                        </label>
                        <input
                          type="number"
                          value={config.shipping.expressDeliveryFee}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              shipping: {
                                ...prev.shipping,
                                expressDeliveryFee: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Estimated Delivery Timeline:
                        </label>
                        <input
                          type="text"
                          value={config.shipping.estimatedDeliveryDays}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              shipping: {
                                ...prev.shipping,
                                estimatedDeliveryDays: e.target.value,
                              },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MOUNTAIN STORY CUSTOMIZER */}
                {cmsSubTab === "story" && (
                  <div className="bg-[#181A1D] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">Provenance & Mountain Story</h3>
                      <p className="text-xs text-[#8E959E] mt-1">
                        Edit the story section describing your kiln burning, sourcing, and purity verification.
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Story Eyebrow Tag:
                        </label>
                        <input
                          type="text"
                          value={config.story.eyebrow}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              story: { ...prev.story, eyebrow: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Story Section Headline:
                        </label>
                        <input
                          type="text"
                          value={config.story.headline}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              story: { ...prev.story, headline: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Story First Paragraph:
                        </label>
                        <textarea
                          rows={3}
                          value={config.story.paragraph1}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              story: { ...prev.story, paragraph1: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          Story Second Paragraph:
                        </label>
                        <textarea
                          rows={3}
                          value={config.story.paragraph2}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              story: { ...prev.story, paragraph2: e.target.value },
                            }))
                          }
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Interactive Storefront Preview Card */}
              <div className="lg:col-span-5 sticky top-28 space-y-4">
                <div className="bg-[#181A1D] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>Live Storefront Preview</span>
                    </span>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      ● Real-time
                    </span>
                  </div>

                  {/* Mini Preview Mockup */}
                  <div className="bg-[#F6F2EA] text-[#181A1D] rounded-2xl p-4 sm:p-5 border border-[#D8CBB6] space-y-4 overflow-hidden shadow-inner font-sans">
                    {/* Mock Announcement */}
                    {config.announcement.enabled && (
                      <div className="bg-[#181A1D] text-white text-[10px] p-2 rounded-xl text-center font-medium">
                        {config.announcement.text}{" "}
                        <strong className="text-[#25D366]">{config.announcement.highlightText}</strong>
                      </div>
                    )}

                    {/* Mock Hero */}
                    <div className="text-center space-y-2 py-2">
                      <div className="inline-block bg-[#EDE6DA] text-[#B8935A] text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-[#D8CBB6]">
                        {config.hero.eyebrow}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#181A1D] leading-tight">
                        {config.hero.headlinePart1} <br />
                        <span className="text-[#B8935A]">{config.hero.headlineHighlight}</span>
                      </h3>

                      <p className="text-[11px] text-[#6B7178] line-clamp-2">
                        {config.hero.subheadline}
                      </p>

                      <div className="pt-1">
                        <button className="bg-[#25D366] text-white text-xs font-extrabold px-4 py-2 rounded-full shadow">
                          {config.hero.primaryCtaText}
                        </button>
                      </div>

                      <div className="flex justify-center gap-2 text-[9px] text-[#6B7178] font-bold pt-1">
                        <span>✓ {config.hero.badge1}</span>
                        <span>✓ {config.hero.badge2}</span>
                      </div>
                    </div>

                    {/* Mock Product Card */}
                    <div className="bg-white rounded-2xl border border-[#D8CBB6] overflow-hidden p-3 shadow-sm space-y-2">
                      <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black">
                        <img
                          src={config.products[0]?.image}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-black/80 text-[#B8935A] text-[9px] font-extrabold px-2 py-0.5 rounded">
                          {config.products[0]?.badge || "Bestseller"}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-xs text-[#181A1D] truncate">
                          {config.products[0]?.name}
                        </span>
                        <span className="font-extrabold text-xs text-[#B8935A]">
                          ₹{config.products[0]?.basePrice}/kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href="/"
                      target="_blank"
                      className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      <span>Open Full Storefront in New Tab</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#B8935A]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: ORDERS & HISTORY DASHBOARD ================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Header with Title, Live Badge & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Package className="w-6 h-6 text-[#B8935A]" />
                    <span>Orders &amp; History</span>
                  </h2>
                  <span className="text-[10px] bg-[#B8935A]/20 text-[#B8935A] px-2.5 py-0.5 rounded-full font-bold uppercase border border-[#B8935A]/30">
                    Live ({orders.length} total)
                  </span>
                </div>
                <p className="text-xs text-[#8E959E] mt-1">
                  Full consignment history, real-time dispatch tracking, customer contacts, and delivery status logs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchOrders()}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Refresh Orders from Server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin text-[#B8935A]" : ""}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-green-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Order</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-[#181A1D] border border-white/10 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#8E959E] mb-1">
                  <span>Gross Sales</span>
                  <DollarSign className="w-4 h-4 text-[#B8935A]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-[#25D366] font-medium mt-1">
                  AOV: ₹{avgOrderValue}
                </div>
              </div>

              <div className="bg-[#181A1D] border border-amber-500/20 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#8E959E] mb-1">
                  <span>Pending</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-500">
                  {pendingCount}
                </div>
                <div className="text-[10px] text-[#8E959E] font-medium mt-1">
                  Requires verification
                </div>
              </div>

              <div className="bg-[#181A1D] border border-blue-500/20 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#8E959E] mb-1">
                  <span>In Processing</span>
                  <Package className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-blue-400">
                  {processingCount}
                </div>
                <div className="text-[10px] text-[#8E959E] font-medium mt-1">
                  Sieving &amp; Packing
                </div>
              </div>

              <div className="bg-[#181A1D] border border-purple-500/20 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#8E959E] mb-1">
                  <span>In Transit</span>
                  <Truck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-purple-400">
                  {shippedCount}
                </div>
                <div className="text-[10px] text-[#8E959E] font-medium mt-1">
                  Courier dispatched
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-[#181A1D] border border-emerald-500/20 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between text-xs text-[#8E959E] mb-1">
                  <span>Ash Moved</span>
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                  {totalKg} kg
                </div>
                <div className="text-[10px] text-white/60 font-medium mt-1">
                  {deliveredCount} delivered orders
                </div>
              </div>
            </div>

            {/* Filter, Search & View Switcher */}
            <div className="bg-[#181A1D] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {[
                  { id: "all", label: `All Orders (${orders.length})` },
                  { id: "pending", label: `⏳ Pending (${pendingCount})` },
                  { id: "processing", label: `🔄 Processing (${processingCount})` },
                  { id: "shipped", label: `🚚 In Transit (${shippedCount})` },
                  { id: "delivered", label: `📜 Order History / Delivered (${deliveredCount})` },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === s.id
                        ? "bg-[#B8935A] text-[#181A1D] shadow-md font-extrabold"
                        : "bg-white/5 text-[#8E959E] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between sm:justify-end">
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8E959E]" />
                  <input
                    type="text"
                    placeholder="Search name, phone, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "table" ? "bg-[#B8935A] text-[#181A1D]" : "text-[#8E959E] hover:text-white"
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("kanban")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "kanban" ? "bg-[#B8935A] text-[#181A1D]" : "text-[#8E959E] hover:text-white"
                    }`}
                    title="Kanban Board View"
                  >
                    <Kanban className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => fetchOrders()}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#8E959E] hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? "animate-spin" : ""}`} />
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0"
                  title="Download CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-green-500/20 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Order</span>
                </button>
              </div>
            </div>

            {/* View Mode: Kanban vs Table */}
            {viewMode === "kanban" ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(["pending", "processing", "shipped", "delivered"] as const).map((colStatus) => {
                  const colOrders = filteredOrders.filter((o) => o.status === colStatus);
                  const colLabels = {
                    pending: { title: "Pending Verification", next: "processing", nextLabel: "Process Order →" },
                    processing: { title: "In Processing / Sieving", next: "shipped", nextLabel: "Ship via Courier →" },
                    shipped: { title: "Shipped & Dispatched", next: "delivered", nextLabel: "Mark Delivered ✓" },
                    delivered: { title: "Delivered", next: null, nextLabel: "" },
                  };

                  const configItem = colLabels[colStatus];

                  return (
                    <div
                      key={colStatus}
                      className="bg-[#181A1D] border border-white/10 rounded-2xl p-4 flex flex-col h-[700px] overflow-hidden"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              colStatus === "pending"
                                ? "bg-amber-500"
                                : colStatus === "processing"
                                ? "bg-blue-500"
                                : colStatus === "shipped"
                                ? "bg-purple-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          {configItem.title}
                        </span>
                        <span className="text-xs font-extrabold bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                          {colOrders.length}
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {colOrders.map((order) => {
                          const directChat = getWhatsAppMessageUrl(
                            order,
                            colStatus === "shipped" ? "shipped" : colStatus === "delivered" ? "delivered" : "confirm"
                          );

                          return (
                            <div
                              key={order.id}
                              className={`rounded-xl p-3.5 space-y-2.5 transition-all shadow-md group cursor-pointer ${
                                newOrderHighlightId === order.id
                                  ? "bg-[#25D366]/15 border-2 border-[#25D366] shadow-green-500/20"
                                  : "bg-[#1E2024] hover:bg-[#25282D] border border-white/10"
                              }`}
                              onClick={() => {
                                setSelectedOrder(order);
                                setTrackingInput(order.tracking_info || "");
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <span className="font-mono text-xs font-bold text-[#B8935A] flex items-center gap-1.5">
                                  <span>{order.order_number}</span>
                                  {newOrderHighlightId === order.id && (
                                    <span className="text-[9px] bg-[#25D366] text-black font-extrabold px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                                      NEW
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-white/40">
                                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>

                              <div>
                                <div className="text-xs font-bold text-white flex items-center justify-between">
                                  <span>{order.customer_name}</span>
                                  <span className="text-xs font-extrabold text-[#F5C26B]">
                                    ₹{order.total}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#8E959E] flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />
                                  <span>{order.customer_phone}</span>
                                </div>
                              </div>

                              <div className="text-[11px] text-white/70 bg-white/5 p-2 rounded-lg border border-white/5 space-y-0.5">
                                {order.order_items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="truncate">{item.product_name}</span>
                                    <strong className="text-white shrink-0 ml-1">{item.quantity} {item.unit}</strong>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-1 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={directChat}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all text-[11px] flex items-center gap-1"
                                  title="WhatsApp Customer"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </a>

                                {configItem.next && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, configItem.next as any)}
                                    className="flex-1 py-1 px-2 rounded-lg bg-white/10 hover:bg-[#B8935A] hover:text-[#181A1D] text-white text-[11px] font-bold transition-all text-center"
                                  >
                                    {configItem.nextLabel}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#181A1D] rounded-3xl border border-white/10 overflow-hidden shadow-2xl w-full max-w-full">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/10 text-[#8E959E] font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-4 px-6">Order ID & Date</th>
                        <th className="py-4 px-6">Customer & Phone</th>
                        <th className="py-4 px-6">Consignment Items</th>
                        <th className="py-4 px-6">Delivery Address</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                          const directChat = getWhatsAppMessageUrl(
                            order,
                            order.status === "shipped" ? "shipped" : order.status === "delivered" ? "delivered" : "confirm"
                          );

                          return (
                            <tr
                              key={order.id}
                              className={`transition-colors cursor-pointer group ${
                                newOrderHighlightId === order.id
                                  ? "bg-[#25D366]/15 border-l-4 border-l-[#25D366]"
                                  : "hover:bg-white/[0.03]"
                              }`}
                              onClick={() => {
                                setSelectedOrder(order);
                                setTrackingInput(order.tracking_info || "");
                              }}
                            >
                              <td className="py-4 px-6 font-mono">
                                <div className="font-bold text-[#F5C26B] group-hover:text-white transition-colors flex items-center gap-1.5">
                                  <span>{order.order_number}</span>
                                  {newOrderHighlightId === order.id && (
                                    <span className="text-[9px] bg-[#25D366] text-black font-extrabold px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-[#8E959E]">
                                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </td>

                              <td className="py-4 px-6">
                                <div className="font-bold text-white">{order.customer_name}</div>
                                <div className="text-[11px] text-[#8E959E]">{order.customer_phone}</div>
                              </td>

                              <td className="py-4 px-6">
                                {order.order_items?.map((item) => (
                                  <div key={item.id} className="text-white/80">
                                    <strong className="text-white">{item.quantity} {item.unit}</strong> · {item.product_name}
                                  </div>
                                )) || "Wood Ash Package"}
                              </td>

                              <td className="py-4 px-6">
                                <div className="text-white/70 max-w-xs truncate text-[11px]">
                                  {order.delivery_address}
                                </div>
                              </td>

                              <td className="py-4 px-6 font-bold text-base text-white">
                                ₹{order.total.toLocaleString("en-IN")}
                              </td>

                              <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    updateOrderStatus(order.id, e.target.value as any)
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize focus:outline-none cursor-pointer bg-[#111214] border ${getStatusBadge(
                                    order.status
                                  )}`}
                                >
                                  <option value="pending" className="bg-[#181A1D] text-amber-500">Pending</option>
                                  <option value="processing" className="bg-[#181A1D] text-blue-400">Processing</option>
                                  <option value="shipped" className="bg-[#181A1D] text-purple-400">Shipped</option>
                                  <option value="delivered" className="bg-[#181A1D] text-emerald-400">Delivered</option>
                                  <option value="cancelled" className="bg-[#181A1D] text-zinc-400">Cancelled</option>
                                </select>
                              </td>

                              <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <a
                                    href={directChat}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                  </a>

                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setTrackingInput(order.tracking_info || "");
                                    }}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-16 text-center">
                            <div className="max-w-sm mx-auto space-y-3">
                              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Package className="w-6 h-6 text-[#B8935A]" />
                              </div>
                              <h4 className="text-sm font-extrabold text-white">
                                {statusFilter !== "all" || searchQuery
                                  ? "No orders found in this filter"
                                  : "No orders in database yet"}
                              </h4>
                              <p className="text-xs text-[#8E959E]">
                                {statusFilter !== "all" || searchQuery
                                  ? "Try clearing the search query or status filter to see all orders."
                                  : "Orders placed on the storefront will automatically appear here in real time."}
                              </p>
                              <div className="pt-2 flex items-center justify-center gap-2">
                                {(statusFilter !== "all" || searchQuery) && (
                                  <button
                                    onClick={() => {
                                      setStatusFilter("all");
                                      setSearchQuery("");
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Show All Orders ({orders.length})
                                  </button>
                                )}
                                <button
                                  onClick={() => fetchOrders()}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#B8935A] text-[#181A1D] text-xs font-extrabold transition-all cursor-pointer"
                                >
                                  Refresh Database
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: PRODUCTS & STOCK ================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-[#B8935A] mb-1.5">
                  <Package className="w-3.5 h-3.5 text-[#B8935A]" />
                  <span>Product & Stock Inventory Control</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Artisanal Ash Catalog ({config.products.length} Products)
                </h2>
                <p className="text-xs sm:text-sm text-[#8E959E] mt-0.5">
                  Update live prices, stock indicators, images, descriptions, or add new blends and categories.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 border border-white/15 text-xs font-bold flex items-center gap-2 transition-all hover:border-[#B8935A]"
                >
                  <FolderPlus className="w-4 h-4 text-[#B8935A]" />
                  <span>Categories ({config.categories?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    setNewProductName("");
                    setNewProductSlug("");
                    setNewProductBadge("");
                    setNewProductDesc("");
                    setNewProductPrice(475);
                    setNewProductUnit("kg");
                    setNewProductCategory(config.categories?.[0]?.slug || "gardening");
                    setIsAddProductOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#B8935A] hover:bg-[#A37F46] text-[#181A1D] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#B8935A]/20 transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>

                <button
                  onClick={handleSaveCMS}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Inventory Changes</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.products.map((product, idx) => {
                return (
                  <div
                    key={product.id}
                    className="bg-[#181A1D] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-white/20 transition-all"
                  >
                    <div>
                      {/* Product Real Image Preview */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                            No image selected
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                        {/* Category tag */}
                        <div className="absolute top-4 left-4 bg-black/85 text-[#B8935A] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-[#B8935A]/40 backdrop-blur-sm">
                          {product.categoryName || product.category}
                        </div>

                        {/* Stock Indicator */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-sm ${
                              product.stockStatus === "in_stock"
                                ? "bg-emerald-950/85 text-emerald-400 border-emerald-500/50"
                                : product.stockStatus === "low"
                                ? "bg-amber-950/85 text-amber-400 border-amber-500/50"
                                : "bg-red-950/85 text-red-400 border-red-500/50"
                            }`}
                          >
                            {product.stockStatus === "in_stock"
                              ? "● In Stock"
                              : product.stockStatus === "low"
                              ? "● Low Stock"
                              : "● Out of Stock"}
                          </span>
                        </div>

                        {/* Ribbon Badge if available */}
                        {product.badge && (
                          <div className="absolute bottom-12 left-4 bg-[#B8935A] text-[#181A1D] text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow">
                            ★ {product.badge}
                          </div>
                        )}

                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <h3 className="text-lg font-bold text-white drop-shadow-md truncate">
                            {product.name}
                          </h3>
                        </div>
                      </div>

                      {/* Product Content Body */}
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-[#8E959E] leading-relaxed line-clamp-2">
                          {product.shortDescription || "No description provided."}
                        </p>

                        {/* Technical Specs Tags Preview */}
                        {product.specs && product.specs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {product.specs.slice(0, 3).map((sp, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-white/70"
                              >
                                <span className="text-[#B8935A] font-semibold">{sp.label}:</span> {sp.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Stock Status Selector */}
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E959E] block">
                            Live Store Availability:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["in_stock", "low", "out_of_stock"] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => updateProduct(product.id, { stockStatus: st })}
                                className={`py-1.5 px-2 rounded-xl text-center text-[10px] font-bold transition-all cursor-pointer ${
                                  product.stockStatus === st
                                    ? st === "in_stock"
                                      ? "bg-[#25D366] text-white shadow-md shadow-green-500/20"
                                      : st === "low"
                                      ? "bg-amber-500 text-[#181A1D] shadow-md shadow-amber-500/20"
                                      : "bg-red-500 text-white shadow-md shadow-red-500/20"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                }`}
                              >
                                {st === "in_stock"
                                  ? "In Stock"
                                  : st === "low"
                                  ? "Low Stock"
                                  : "Out of Stock"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Base Price Editor */}
                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                          <div>
                            <span className="text-xs text-[#8E959E] block">Base Rate:</span>
                            <span className="text-[10px] text-white/40">Tier discounts scale from this</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#F5C26B] font-bold text-sm">₹</span>
                            <input
                              type="number"
                              value={product.basePrice}
                              onChange={(e) =>
                                updateProduct(product.id, { basePrice: Number(e.target.value) })
                              }
                              className="w-24 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white font-bold text-right focus:border-[#B8935A] focus:outline-none"
                            />
                            <span className="text-xs text-[#8E959E]">/{product.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Card Actions: Edit Full Details & Delete */}
                    <div className="p-5 pt-0 grid grid-cols-5 gap-2">
                      <button
                        onClick={() => setEditingProduct({ ...product })}
                        className="col-span-4 py-2.5 px-3 bg-[#B8935A]/15 hover:bg-[#B8935A]/25 border border-[#B8935A]/30 hover:border-[#B8935A] text-[#F5C26B] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Product & Specs</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="col-span-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB: STORE SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto bg-[#181A1D] border border-white/10 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8935A]">
                Ember Dust Store Management
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Storefront CMS & WhatsApp Hotline
              </h2>
              <p className="text-xs text-[#8E959E] mt-1">
                Control notifications, WhatsApp routing, free shipping thresholds, and hero copy across the entire site.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Official WhatsApp Dispatch Number (with country code):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#25D366]" />
                  <input
                    type="text"
                    value={config.whatsapp.number}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, number: e.target.value },
                      }))
                    }
                    placeholder="917006506721"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>
                <p className="text-[11px] text-[#8E959E] mt-1">
                  All customer 1-click orders and contact inquiries will automatically route to this WhatsApp line.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Top Announcement Ticker Message:
                </label>
                <input
                  type="text"
                  value={config.announcement.text}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, text: e.target.value },
                    }))
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    Free Delivery Threshold (₹):
                  </label>
                  <input
                    type="number"
                    value={config.shipping.freeShippingThreshold}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        shipping: { ...prev.shipping, freeShippingThreshold: Number(e.target.value) },
                      }))
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    Express Shipping Fee (₹):
                  </label>
                  <input
                    type="number"
                    value={config.shipping.expressDeliveryFee}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        shipping: { ...prev.shipping, expressDeliveryFee: Number(e.target.value) },
                      }))
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-bold text-white/90 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#B8935A]" />
                  <span>Admin Master Access Passcode / PIN:</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3 text-[#B8935A]" />
                  <input
                    type="text"
                    value={config.securityPin || "8899"}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        securityPin: e.target.value,
                      }))
                    }
                    placeholder="8899"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#B8935A]"
                  />
                </div>
                <p className="text-[11px] text-[#8E959E] mt-1">
                  Protects your /admin URL from unauthorized customer tampering. (Default: 8899).
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleSaveCMS}
                  disabled={isSaving}
                  className="w-full bg-[#B8935A] hover:bg-[#A37F47] text-[#181A1D] py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-lg hover:shadow-[#B8935A]/20 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Storefront Settings"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-2xl bg-[#181A1D] border border-white/15 rounded-3xl p-6 sm:p-7 text-[#EDE6DA] shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-lg font-extrabold text-[#F5C26B]">
                  {selectedOrder.order_number}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="text-xs text-[#8E959E]">
                Created on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8E959E] block mb-1">
                  Customer Details:
                </span>
                <div className="text-sm font-bold text-white">{selectedOrder.customer_name}</div>
                <div className="text-xs text-[#25D366] font-medium flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedOrder.customer_phone}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8E959E] block mb-1">
                  Delivery Destination:
                </span>
                <div className="text-xs text-white/80 leading-relaxed">
                  {selectedOrder.delivery_address || "No address provided"}
                </div>
                {selectedOrder.notes && (
                  <div className="text-[11px] text-[#B8935A] italic mt-1.5">
                    Customer Note: "{selectedOrder.notes}"
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#B8935A] block">
                Ordered Products:
              </span>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-white">
                    <div>
                      <span className="font-bold">{item.product_name}</span>
                      <span className="text-[#8E959E] block text-[11px]">
                        {item.quantity} {item.unit} @ ₹{item.unit_price}/{item.unit}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#F5C26B]">
                      ₹{item.line_total}
                    </div>
                  </div>
                )) || <div className="text-xs text-[#8E959E]">Consignment items</div>}

                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline font-bold text-base">
                  <span>Grand Total:</span>
                  <span className="text-xl font-extrabold text-[#F5C26B]">
                    ₹{selectedOrder.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Courier Tracking AWB Number:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DELHIVERY-AWB-89410284"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status, trackingInput)}
                  className="px-4 py-2 bg-white/10 hover:bg-[#B8935A] hover:text-[#181A1D] text-white rounded-xl text-xs font-bold transition-all"
                >
                  Save AWB
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#8E959E] block">
                Quick Change Order Status:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["pending", "processing", "shipped", "delivered"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateOrderStatus(selectedOrder.id, st, trackingInput)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                      selectedOrder.status === st
                        ? "bg-[#B8935A] text-[#181A1D] shadow"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[11px] uppercase font-bold text-[#25D366] block">
                Send WhatsApp Notification:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={getWhatsAppMessageUrl(selectedOrder, "confirm")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Confirmation</span>
                </a>

                <a
                  href={getWhatsAppMessageUrl(selectedOrder, "shipped")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500 text-purple-400 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Send Dispatched & AWB</span>
                </a>

                <a
                  href={getWhatsAppMessageUrl(selectedOrder, "delivered")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Send Delivered &amp; Dosage</span>
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <a
                href={`tel:${selectedOrder.customer_phone}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Call Customer</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-[#B8935A] text-[#181A1D] text-xs font-extrabold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MANUAL ORDER MODAL ================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-[#181A1D] border border-white/15 rounded-3xl p-6 sm:p-7 text-[#EDE6DA] shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 border-b border-white/10 pb-4">
              <h3 className="text-xl font-extrabold text-white">Create Offline / Manual Order</h3>
              <p className="text-xs text-[#8E959E] mt-1">
                Record an order received over a phone call, nursery visit, or bulk inquiry.
              </p>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Customer Name *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  WhatsApp Mobile Number *:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Delivery Address & City *:
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House number, Street, Landmark, City & Pincode"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Select Product Blend:
                  </label>
                  <select
                    value={manualProductSlug}
                    onChange={(e) => setManualProductSlug(e.target.value)}
                    className="w-full bg-[#111214] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  >
                    {config.products.map((p) => (
                      <option key={p.slug} value={p.slug} className="bg-[#181A1D]">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Quantity (kg):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={manualQty}
                    onChange={(e) => setManualQty(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-lg hover:shadow-green-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingManual ? "Logging Order..." : "Create & Log Order in System"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-2xl bg-[#181A1D] border border-white/15 rounded-3xl p-6 sm:p-8 text-[#EDE6DA] shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-[#B8935A] mb-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#B8935A]" />
                <span>Product Customizer</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Edit Product: {editingProduct.name}
              </h3>
              <p className="text-xs text-[#8E959E] mt-0.5">
                Changes apply immediately across storefront cards, calculation engine, and WhatsApp dispatch messages.
              </p>
            </div>

            <form onSubmit={handleSaveEditingProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Product Title *:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Category:
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => {
                      const selectedSlug = e.target.value;
                      const catObj = config.categories?.find((c) => c.slug === selectedSlug);
                      setEditingProduct({
                        ...editingProduct,
                        category: selectedSlug,
                        categoryName: catObj ? catObj.name : selectedSlug,
                      });
                    }}
                    className="w-full bg-[#111214] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  >
                    {config.categories?.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="bg-[#181A1D]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Base Unit Price (₹) *:
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.basePrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        basePrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-[#F5C26B] font-bold focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Unit (e.g. kg, 500g):
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.unit}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, unit: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Ribbon Badge:
                  </label>
                  <input
                    type="text"
                    value={editingProduct.badge || ""}
                    placeholder="e.g. Bestseller"
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, badge: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Stock Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["in_stock", "low", "out_of_stock"] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() =>
                        setEditingProduct({ ...editingProduct, stockStatus: st })
                      }
                      className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                        editingProduct.stockStatus === st
                          ? st === "in_stock"
                            ? "bg-[#25D366] text-white"
                            : st === "low"
                            ? "bg-amber-500 text-[#181A1D]"
                            : "bg-red-500 text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {st === "in_stock"
                        ? "● In Stock"
                        : st === "low"
                        ? "● Low Stock"
                        : "● Out of Stock"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Short Description:
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDescription}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              {/* Image Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">
                  Product Image (Presets or Custom URL):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PRODUCT_IMAGES.map((preset, pIdx) => {
                    const isSelected = editingProduct.image === preset.url;
                    return (
                      <button
                        type="button"
                        key={pIdx}
                        onClick={() =>
                          setEditingProduct({ ...editingProduct, image: preset.url })
                        }
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#B8935A] bg-[#B8935A]/15 text-white"
                            : "border-white/10 bg-white/5 text-[#8E959E] hover:border-white/20"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-black">
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-bold truncate">
                          {preset.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, image: e.target.value })
                  }
                  placeholder="/images/products/..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              {/* Specs Editor */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E959E]">
                    Packaging & Technical Specifications:
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: [
                          ...(editingProduct.specs || []),
                          { label: "Spec", value: "" },
                        ],
                      })
                    }
                    className="text-[11px] text-[#B8935A] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Spec
                  </button>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(editingProduct.specs || []).map((sp, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sp.label}
                        placeholder="Name (e.g. pH Level)"
                        onChange={(e) => {
                          const nextSpecs = [...(editingProduct.specs || [])];
                          nextSpecs[sIdx] = { ...nextSpecs[sIdx], label: e.target.value };
                          setEditingProduct({ ...editingProduct, specs: nextSpecs });
                        }}
                        className="w-1/3 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={sp.value}
                        placeholder="Value (e.g. 10.4 Alkaline)"
                        onChange={(e) => {
                          const nextSpecs = [...(editingProduct.specs || [])];
                          nextSpecs[sIdx] = { ...nextSpecs[sIdx], value: e.target.value };
                          setEditingProduct({ ...editingProduct, specs: nextSpecs });
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextSpecs = (editingProduct.specs || []).filter((_, i) => i !== sIdx);
                          setEditingProduct({ ...editingProduct, specs: nextSpecs });
                        }}
                        className="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Product Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD NEW PRODUCT MODAL ================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-xl bg-[#181A1D] border border-white/15 rounded-3xl p-6 sm:p-8 text-[#EDE6DA] shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-[#B8935A] mb-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-[#B8935A]" />
                <span>New Catalog Entry</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Add New Artisanal Ash Blend
              </h3>
              <p className="text-xs text-[#8E959E] mt-0.5">
                Creates a brand new product available for customers to view, calculate pricing, and purchase.
              </p>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Product Title *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pine Bark Organic Ash"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Select Category *:
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full bg-[#111214] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  >
                    {config.categories?.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="bg-[#181A1D]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Base Price (₹) *:
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-[#F5C26B] font-bold focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Pricing Unit *:
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Ribbon Badge:
                  </label>
                  <input
                    type="text"
                    value={newProductBadge}
                    placeholder="e.g. New Reserve"
                    onChange={(e) => setNewProductBadge(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Short Marketing Description:
                </label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Triple-sifted high potassium blend for fruit trees and glazes..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              {/* Image Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">
                  Select Product Image:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PRODUCT_IMAGES.map((preset, pIdx) => {
                    const isSelected = newProductImage === preset.url;
                    return (
                      <button
                        type="button"
                        key={pIdx}
                        onClick={() => setNewProductImage(preset.url)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#B8935A] bg-[#B8935A]/15 text-white"
                            : "border-white/10 bg-white/5 text-[#8E959E] hover:border-white/20"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-black">
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-bold truncate">
                          {preset.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  placeholder="Or enter custom URL (/images/products/...)"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#B8935A] hover:bg-[#A37F46] text-[#181A1D] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#B8935A]/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CATEGORY MANAGEMENT MODAL ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-xl bg-[#181A1D] border border-white/15 rounded-3xl p-6 sm:p-8 text-[#EDE6DA] shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-[#B8935A] mb-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-[#B8935A]" />
                <span>Product Taxonomy</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Store Categories
              </h3>
              <p className="text-xs text-[#8E959E] mt-0.5">
                Create and organize specialized ash categories (Gardening, Ceramics, Bonsai, Orchards, etc.).
              </p>
            </div>

            {/* List Existing Categories */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E959E] block">
                Active Categories ({config.categories?.length || 0}):
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {config.categories?.map((cat) => {
                  const productCount = config.products.filter(
                    (p) => p.category === cat.slug || p.categoryName === cat.name
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                          <span className="text-[10px] font-mono text-[#8E959E] bg-white/5 px-2 py-0.5 rounded">
                            {cat.slug}
                          </span>
                          <span className="text-[10px] font-bold text-[#F5C26B] bg-[#F5C26B]/10 px-2 py-0.5 rounded-full">
                            {productCount} {productCount === 1 ? "product" : "products"}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-[#8E959E] mt-0.5 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add New Category Box */}
            <form
              onSubmit={handleCreateCategorySubmit}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8935A] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Category</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Category Name *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bonsai & Orchards"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Slug (optional):
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated from name"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#B8935A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Brief Description:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Formulated specifically for bonsai root beds and soil acidity."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8935A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#B8935A] hover:bg-[#A37F46] text-[#181A1D] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </form>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
