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
  frameExtension = ".jpg",
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

  // Loading state
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Format frame filename with 3-digit zero padding (e.g. frame_001.jpg)
  const getFrameUrl = useCallback(
    (index: number) => {
      const paddedIndex = String(index + 1).padStart(3, "0");
      return `${folderPath}/${framePrefix}${paddedIndex}${frameExtension}`;
    },
    [folderPath, framePrefix, frameExtension]
  );

  // Render a specific frame on canvas with aspect-ratio "cover"
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
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

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
  }, []);

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

  // Preload images
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = [];
    imagesRef.current = images;

    let loaded = 0;

    // Load first frame with priority to paint initial canvas immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    images[0] = firstImg;

    firstImg.onload = () => {
      if (isCancelled) return;
      loaded++;
      setLoadedCount(loaded);
      resizeCanvas();
      renderFrame(0);

      // Once frame 1 is ready, load the rest
      loadRemainingFrames();
    };

    firstImg.onerror = () => {
      if (isCancelled) return;
      loadRemainingFrames();
    };

    const loadRemainingFrames = () => {
      for (let i = 1; i < frameCount; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        images[i] = img;

        img.onload = () => {
          if (isCancelled) return;
          loaded++;
          setLoadedCount(loaded);

          if (loaded >= Math.min(25, frameCount)) {
            setIsLoading(false);
          }
          if (loaded >= frameCount) {
            setIsLoading(false);
          }
        };

        img.onerror = () => {
          if (isCancelled) return;
          loaded++;
          setLoadedCount(loaded);
        };
      }
    };

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
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Subtle vignette & contrast overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/65 pointer-events-none z-10" />

      {/* Persistent Quick Buy Floating Badge (Skip sequence directly to checkout) */}
      <div className="absolute top-6 right-6 z-30 hidden sm:flex items-center gap-2">
        <button
          onClick={() => openOrderModal()}
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2.5 rounded-full text-xs font-extrabold shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>⚡ Quick Buy: 5kg for ₹475</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#141618] text-white transition-opacity duration-500">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-[#B8935A] animate-spin" />
            <div className="text-lg font-extrabold text-[#B8935A]">
              {loadProgress}%
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#B8935A] mt-5 font-bold">
            Loading Ember Sequence
          </div>
          <p className="text-[11px] text-[#8E959E] mt-1">
            Preparing 1080p botanical transformation frames...
          </p>
        </div>
      )}

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
                href="#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-full border border-white/20 transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>Explore Bulk Calculator</span>
              </a>
            </div>

            <div className="pt-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B8935A]/90 animate-bounce">
              <ArrowDown className="w-4 h-4" />
              <span>Scroll to scrub transformation</span>
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

      {/* Bottom Frame Progress Bar */}
      <div className="absolute bottom-4 left-6 right-6 z-30 flex items-center justify-between text-[11px] text-white/50 pointer-events-none">
        <span className="uppercase tracking-widest text-[#B8935A] font-bold">
          Ember Dust · Frame Sequence
        </span>
        <div className="w-32 sm:w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#B8935A] transition-all duration-75"
            style={{
              width: `${((currentFrameRef.current + 1) / frameCount) * 100}%`,
            }}
          />
        </div>
        <span className="font-mono text-white/70 font-bold">
          {String(currentFrameRef.current + 1).padStart(3, "0")} / {frameCount}
        </span>
      </div>
    </div>
  );
}
