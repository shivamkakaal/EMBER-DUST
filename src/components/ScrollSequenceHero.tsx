"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ArrowDown, ArrowRight, MessageSquare, Scale, Zap } from "lucide-react";
import { DEFAULT_WHATSAPP_NUMBER, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useOrder } from "@/context/OrderContext";

interface ScrollSequenceHeroProps {
  folderPath?: string;
  frameCount?: number;
  framePrefix?: string;
  frameExtension?: string;
  scrollDistance?: number;
  showOverlays?: boolean;
  className?: string;
}

export default function ScrollSequenceHero({
  folderPath = "/images/sequence",
  frameCount = 135,
  framePrefix = "frame_",
  frameExtension = ".webp",
  scrollDistance = 2600,
  showOverlays = true,
  className = "",
}: ScrollSequenceHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { openOrderModal } = useOrder();

  // Loaded frames cache
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);

  // DOM Refs for direct 60fps updates without component re-render lag
  const progressBarRef = useRef<HTMLDivElement>(null);
  const phaseLabelRef = useRef<HTMLSpanElement>(null);

  // Background loading state
  const [loadedCount, setLoadedCount] = useState<number>(1);
  const [isInitialFrameReady, setIsInitialFrameReady] = useState<boolean>(false);

  // Format frame filename with 3-digit zero padding (e.g. frame_001.webp)
  const getFrameUrl = useCallback(
    (index: number) => {
      const paddedIndex = String(index + 1).padStart(3, "0");
      return `${folderPath}/${framePrefix}${paddedIndex}${frameExtension}`;
    },
    [folderPath, framePrefix, frameExtension]
  );

  // Render a specific frame on canvas with aspect-ratio "cover"
  // Intelligently falls back to nearest available loaded frame if the exact index is still streaming
  const renderFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // Check if target image is ready
      let img = imagesRef.current[index];
      if (!img || !img.complete || img.naturalWidth === 0) {
        // Find nearest loaded frame backward or forward
        for (let offset = 1; offset < frameCount; offset++) {
          const prev = index - offset;
          if (prev >= 0 && imagesRef.current[prev]?.complete && imagesRef.current[prev]?.naturalWidth > 0) {
            img = imagesRef.current[prev];
            break;
          }
          const next = index + offset;
          if (next < frameCount && imagesRef.current[next]?.complete && imagesRef.current[next]?.naturalWidth > 0) {
            img = imagesRef.current[next];
            break;
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Object-fit: cover scaling
      const hRatio = canvasWidth / imgWidth;
      const vRatio = canvasHeight / imgHeight;
      const ratio = Math.max(hRatio, vRatio);

      const centerShiftX = (canvasWidth - imgWidth * ratio) / 2;
      const centerShiftY = (canvasHeight - imgHeight * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        imgWidth,
        imgHeight,
        centerShiftX,
        centerShiftY,
        imgWidth * ratio,
        imgHeight * ratio
      );
    },
    [frameCount]
  );

  // Resize canvas to match display window and device pixel ratio (crisp retina)
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Redraw current frame
    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // Progressive image preloader
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = [];
    imagesRef.current = images;

    let loaded = 0;

    // 1. Multi-tier Progressive Streaming Pipeline
    const startProgressiveStream = async () => {
      const keyframes: number[] = [];
      const intermediateFrames: number[] = [];

      for (let i = 1; i < frameCount; i++) {
        if (i < 14 || i % 4 === 0) {
          keyframes.push(i);
        } else {
          intermediateFrames.push(i);
        }
      }

      const loadSingleFrame = (idx: number): Promise<void> => {
        return new Promise((resolve) => {
          if (isCancelled) return resolve();
          const img = new Image();
          images[idx] = img;
          img.src = getFrameUrl(idx);

          img.onload = () => {
            if (!isCancelled) {
              loaded++;
              setLoadedCount(loaded);
            }
            resolve();
          };
          img.onerror = () => {
            if (!isCancelled) {
              loaded++;
              setLoadedCount(loaded);
            }
            resolve();
          };
        });
      };

      const loadBatch = async (indices: number[], concurrency = 6) => {
        const queue = [...indices];
        const workers = Array.from({ length: concurrency }, async () => {
          while (queue.length > 0 && !isCancelled) {
            const nextIdx = queue.shift();
            if (nextIdx !== undefined) {
              await loadSingleFrame(nextIdx);
            }
          }
        });
        await Promise.all(workers);
      };

      // Load keyframes first
      await loadBatch(keyframes, 6);

      // Stream remaining frames without blocking main thread
      if (!isCancelled) {
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          (window as any).requestIdleCallback(() => {
            loadBatch(intermediateFrames, 4);
          });
        } else {
          setTimeout(() => {
            loadBatch(intermediateFrames, 4);
          }, 60);
        }
      }
    };

    // 2. Instant First Frame Load: painted immediately
    const onFirstFrameReady = () => {
      if (isCancelled) return;
      loaded++;
      setLoadedCount(loaded);
      setIsInitialFrameReady(true);
      resizeCanvas();
      renderFrame(0);

      // Start prioritized streaming
      startProgressiveStream();
    };

    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    images[0] = firstImg;

    if (firstImg.complete && firstImg.naturalWidth > 0) {
      onFirstFrameReady();
    } else {
      firstImg.onload = onFirstFrameReady;
      firstImg.onerror = () => {
        if (!isCancelled) startProgressiveStream();
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [frameCount, getFrameUrl, renderFrame, resizeCanvas]);

  // Window resize handler
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Initialize GSAP & ScrollTrigger
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = gsap.context(() => {
      // 1. Scrub frame sequence on canvas
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollDistance}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(self.progress * frameCount)
          );
          currentFrameRef.current = frameIndex;
          renderFrame(frameIndex);

          // Direct DOM progress update for buttery 60fps tracking without React re-render lag
          const pct = Math.round(self.progress * 100);
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${pct}%`;
          }
          if (phaseLabelRef.current) {
            if (self.progress < 0.35) {
              phaseLabelRef.current.textContent = "Phase 1: Raw Himalayan Orchard Embers";
            } else if (self.progress < 0.7) {
              phaseLabelRef.current.textContent = "Phase 2: 100-Mesh Sieve Precision";
            } else {
              phaseLabelRef.current.textContent = "Phase 3: Triple-Screened Reserve Ash";
            }
          }
        },
      });

      // 2. Timeline for editorial text overlays
      if (showOverlays) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: `+=${scrollDistance}`,
            scrub: 0.8,
          },
        });

        // Overlay 1: Intro (0% to 25%)
        tl.to("#seq-overlay-1", { opacity: 0, y: -40, duration: 0.25 }, 0.15)
          // Overlay 2: Purity transformation (25% to 60%)
          .fromTo(
            "#seq-overlay-2",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.2 },
            0.3
          )
          .to("#seq-overlay-2", { opacity: 0, y: -40, duration: 0.2 }, 0.55)
          // Overlay 3: Ready packaging & CTA (65% to 100%)
          .fromTo(
            "#seq-overlay-3",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.25 },
            0.65
          );
      }
    }, container);

    return () => {
      ctx.revert();
    };
  }, [frameCount, renderFrame, scrollDistance, showOverlays]);

  const loadProgress = Math.min(100, Math.round((loadedCount / frameCount) * 100));

  const directChatUrl = buildWhatsAppUrl(
    DEFAULT_WHATSAPP_NUMBER,
    "Hello Ember Dust 👋 I saw your transformation sequence and would like to place an order."
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-[#141618] text-[#EDE6DA] select-none font-sans ${className}`}
    >
      {/* Background Canvas with 0ms WebP CSS background fallback */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          backgroundImage: "url('/images/sequence/frame_001.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Subtle vignette & contrast overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/65 pointer-events-none z-10" />

      {/* Persistent Floating Header Actions (Skip sequence directly or Quick Buy) */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
        <a
          href="#store"
          className="hidden sm:inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/70 backdrop-blur-md text-[#EDE6DA] hover:text-white px-3.5 py-2 rounded-full text-xs font-bold border border-white/15 transition-all"
        >
          <span>Skip to Store</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#B8935A]" />
        </a>

        <button
          onClick={() => openOrderModal()}
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2 sm:py-2.5 rounded-full text-xs font-extrabold shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>⚡ Quick Buy: 5kg for ₹475</span>
        </button>
      </div>

      {/* Editorial Text Overlays scrubbed by GSAP */}
      {showOverlays && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          {/* Overlay 1: Opening (Active at top) */}
          <div
            id="seq-overlay-1"
            className="absolute max-w-3xl mx-auto px-6 text-center space-y-4 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#B8935A] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Small-Batch · 100% Organic Wood Ash</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Born from Wild Embers. <br />
              <span className="text-[#B8935A]">
                Destined for Earth & Kiln.
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-[#D8CBB6] max-w-xl mx-auto font-normal leading-relaxed">
              Scroll down to witness raw Himalayan orchard embers transform into triple-screened mineral ash.
            </p>

            {/* Quick Action in Overlay 1 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openOrderModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm px-6 py-3.5 rounded-full transition-all shadow-xl hover:shadow-green-500/30 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>

              <a
                href="#store"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B8935A] hover:bg-[#9E7B44] text-[#141618] font-extrabold text-sm px-6 py-3.5 rounded-full transition-all shadow-lg hover:shadow-[#B8935A]/30 cursor-pointer"
              >
                <span>View Products & Store ↓</span>
              </a>

              <a
                href="#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3.5 rounded-full border border-white/20 transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>Bulk Calculator</span>
              </a>
            </div>

            <div className="pt-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B8935A]/90 animate-bounce">
              <ArrowDown className="w-4 h-4" />
              <span>Scroll down to reveal transformation</span>
            </div>
          </div>

          {/* Overlay 2: Middle (Active during mid-scroll) */}
          <div
            id="seq-overlay-2"
            className="absolute max-w-2xl mx-auto px-6 text-center space-y-4 opacity-0 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8935A]/20 backdrop-blur-md border border-[#B8935A]/40 text-[#B8935A] text-xs font-bold tracking-wider uppercase">
              <span>100-Mesh Sieve Precision</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Pure Potassium & Calcium. <br />
              <span className="text-[#B8935A]">
                Zero Chemical Additives.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#D8CBB6] leading-relaxed">
              Every speck of unburnt charcoal, stone, and debris is eliminated, yielding a velvety micro-powder rich in active botanical minerals.
            </p>
          </div>

          {/* Overlay 3: Finale / Final Pack (Active at end of scroll) */}
          <div
            id="seq-overlay-3"
            className="absolute max-w-3xl mx-auto px-6 text-center space-y-5 opacity-0 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#25D366]/20 backdrop-blur-md border border-[#25D366]/40 text-[#25D366] text-xs font-bold tracking-wider uppercase">
              <span>Sealed in Moisture-Barrier Kraft</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Ember Dust Reserve. <br />
              <span className="text-[#B8935A]">
                Ready for Dispatch Across India.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#D8CBB6] max-w-lg mx-auto leading-relaxed">
              Double-sealed for fresh delivery to home gardeners, fruit orchards, and studio ceramicists.
            </p>

            {/* Direct Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openOrderModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm px-7 py-4 rounded-full transition-all shadow-xl hover:shadow-green-500/30"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B8935A] hover:bg-[#9E7B44] text-[#1F2124] hover:text-white font-bold text-sm px-6 py-4 rounded-full transition-all duration-200 shadow-lg"
              >
                <Scale className="w-4 h-4" />
                <span>Custom Weight Calculator</span>
              </a>

              <a
                href={directChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-4 rounded-full border border-white/20 transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interactive Transformation Scrub Bar */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-30 flex items-center justify-between text-[11px] text-white/70 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B8935A] animate-pulse shrink-0" />
          <span
            ref={phaseLabelRef}
            className="font-bold text-[#D8CBB6] tracking-wide text-[11px] sm:text-xs truncate max-w-[170px] sm:max-w-none"
          >
            Phase 1: Raw Himalayan Orchard Embers
          </span>
        </div>

        {/* Dynamic Scrub Progress Bar */}
        <div className="w-24 sm:w-56 h-1 bg-white/15 rounded-full overflow-hidden mx-3">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[#B8935A] to-[#25D366] transition-[width] duration-75"
            style={{ width: "0%" }}
          />
        </div>

        {/* Direct Skip Button in Bottom Bar */}
        <a
          href="#store"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B8935A] hover:text-white uppercase tracking-wider transition-colors shrink-0"
        >
          <span>Jump to Store</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
