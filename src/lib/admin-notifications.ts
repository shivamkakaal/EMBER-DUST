/**
 * Ember Dust Admin Sound & Push Notification Suite
 * Handles Web Audio API synthesized order chimes, browser notifications,
 * and Service Worker background alerts.
 */

// Web Audio API Order Chime (No external audio file needed, 100% reliable)
export function playOrderChime(volume: number = 0.75): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.22 },
      { freq: 659.25, time: 0.12, duration: 0.22 },
      { freq: 783.99, time: 0.24, duration: 0.28 },
      { freq: 1046.5, time: 0.36, duration: 0.55 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave with subtle harmonics for a warm, pleasant chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      // Volume envelope: instant attack, smooth exponential decay
      const startTime = ctx.currentTime + note.time;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });

    // Cleanup AudioContext after playback
    setTimeout(() => {
      if (ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
    }, 1500);
  } catch (err) {
    console.warn("Could not play synthesized order chime:", err);
  }
}

/**
 * Request system notification permission
 */
export async function requestAdminNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "denied";
  }
}

export interface NewOrderNotificationData {
  order_number: string;
  customer_name: string;
  total: number;
  quantity?: number;
  product_name?: string;
  id?: string;
}

/**
 * Dispatch desktop / mobile browser notification
 */
export async function triggerBrowserOrderNotification(
  order: NewOrderNotificationData
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const title = `🔥 New Order: ${order.order_number}`;
  const qtyStr = order.quantity ? ` · ${order.quantity}kg` : "";
  const productStr = order.product_name ? ` (${order.product_name})` : "";
  const body = `${order.customer_name} placed an order for ₹${order.total.toLocaleString("en-IN")}${qtyStr}${productStr}.\nTap to view details in Admin HQ.`;

  // Trigger hardware haptic vibration if supported on mobile
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200, 100, 300]);
    } catch {
      // Ignore vibration error
    }
  }

  try {
    // Check if service worker is active
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration("/admin");
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/android-chrome-192x192.png",
          badge: "/favicon-32x32.png",
          tag: order.order_number,
          data: { url: "/admin", orderId: order.id },
        });
        return true;
      }
    }

    // Direct browser notification fallback
    new Notification(title, {
      body,
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      tag: order.order_number,
    });
    return true;
  } catch (err) {
    console.warn("Failed to dispatch browser notification:", err);
    return false;
  }
}

/**
 * Register Admin Service Worker for standalone PWA
 */
export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register("/admin-sw.js", {
      scope: "/admin",
    });
    return reg;
  } catch (err) {
    console.warn("Admin Service Worker registration failed:", err);
    return null;
  }
}
