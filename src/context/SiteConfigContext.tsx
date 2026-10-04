"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { DEFAULT_SITE_CONFIG, SiteConfig, CustomProduct, CustomCategory } from "@/lib/site-config";

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (updater: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
  updateProduct: (productId: string, updates: Partial<CustomProduct>) => void;
  addProduct: (product: CustomProduct) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: CustomCategory) => void;
  deleteCategory: (categoryId: string) => void;
  saveConfig: () => Promise<boolean>;
  resetToDefault: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "ember_dust_site_config_v2";

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load configuration on client mount
  useEffect(() => {
    // Helper to sanitize legacy CTA values
    const sanitizeHero = (heroObj: any) => {
      const merged = { ...DEFAULT_SITE_CONFIG.hero, ...(heroObj || {}) };
      if (!merged.primaryCtaText || merged.primaryCtaText.includes("5kg") || merged.primaryCtaText.includes("Instant")) {
        merged.primaryCtaText = "Buy Now";
      }
      return merged;
    };

    // 1. Try local storage first for instant render
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setConfig({
          ...DEFAULT_SITE_CONFIG,
          ...parsed,
          hero: sanitizeHero(parsed.hero),
          announcement: { ...DEFAULT_SITE_CONFIG.announcement, ...(parsed.announcement || {}) },
          whatsapp: { ...DEFAULT_SITE_CONFIG.whatsapp, ...(parsed.whatsapp || {}) },
          shipping: { ...DEFAULT_SITE_CONFIG.shipping, ...(parsed.shipping || {}) },
          story: { ...DEFAULT_SITE_CONFIG.story, ...(parsed.story || {}) },
          securityPin: parsed.securityPin || DEFAULT_SITE_CONFIG.securityPin,
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_SITE_CONFIG.categories,
          products: parsed.products && parsed.products.length > 0 ? parsed.products : DEFAULT_SITE_CONFIG.products,
        });
      }
    } catch {
      // Ignore
    }

    // 2. Fetch latest from database API
    const fetchRemote = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.config) {
          const sanitized = {
            ...data.config,
            hero: sanitizeHero(data.config.hero),
          };
          setConfig(sanitized);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
          } catch {
            // Ignore
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings from server:", err);
      }
    };

    fetchRemote();

    // 3. Listen for changes from other tabs (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          setConfig(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateConfig = useCallback(
    (updater: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => {
      setConfig((prev) => {
        const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        setHasUnsavedChanges(true);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    []
  );

  const updateProduct = useCallback(
    (productId: string, updates: Partial<CustomProduct>) => {
      setConfig((prev) => {
        const nextProducts = prev.products.map((p) =>
          p.id === productId ? { ...p, ...updates } : p
        );
        const next = { ...prev, products: nextProducts };
        setHasUnsavedChanges(true);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    []
  );

  const addProduct = useCallback((product: CustomProduct) => {
    setConfig((prev) => {
      const next = { ...prev, products: [...prev.products, product] };
      setHasUnsavedChanges(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setConfig((prev) => {
      const next = { ...prev, products: prev.products.filter((p) => p.id !== productId) };
      setHasUnsavedChanges(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const addCategory = useCallback((category: CustomCategory) => {
    setConfig((prev) => {
      const next = { ...prev, categories: [...(prev.categories || []), category] };
      setHasUnsavedChanges(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setConfig((prev) => {
      const next = { ...prev, categories: (prev.categories || []).filter((c) => c.id !== categoryId) };
      setHasUnsavedChanges(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const saveConfig = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Save locally
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));

      // Save to Supabase via API
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      const data = await res.json();
      if (data.success) {
        setHasUnsavedChanges(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error saving site config:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const resetToDefault = useCallback(() => {
    if (confirm("Are you sure you want to reset all site customizations to factory default?")) {
      setConfig(DEFAULT_SITE_CONFIG);
      setHasUnsavedChanges(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      } catch {
        // Ignore
      }
    }
  }, []);

  return (
    <SiteConfigContext.Provider
      value={{
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
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return context;
}
