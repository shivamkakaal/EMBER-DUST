"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Send, Sparkles } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Official WhatsApp Vector Icon (Matching WRAPORA reference exactly)
function WhatsAppIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.19-.3a8.13 8.13 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.21-.18-.46-.31" />
    </svg>
  );
}

export default function WhatsAppFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const { config } = useSiteConfig();

  useEffect(() => {
    const handleScroll = () => {
      // Detect if sticky bar is active on mobile
      if (window.scrollY > 320) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const quickQuestions = [
    "Hi, I want to order 5kg of Pure Hardwood Ash.",
    "What is the best dosage for tomato plants?",
    "Can you share glaze recipe details for Studio Ash?",
    "Do you deliver to my pincode?",
  ];

  const handleSendChat = (messageText: string) => {
    const textToSend =
      messageText.trim() ||
      config.whatsapp.greeting ||
      "Hello Ember Dust 👋 I'd like to ask a quick question about your organic wood ash.";
    const url = buildWhatsAppUrl(config.whatsapp.number, textToSend);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  return (
    <aside
      aria-label="WhatsApp quick chat"
      className={`fixed z-50 right-4 sm:right-6 transition-all duration-300 flex flex-col items-end gap-3 font-sans ${
        hasScrolled
          ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-6"
          : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:bottom-6"
      }`}
    >
      {/* Toggled WhatsApp Chat Box Popup */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] bg-[#181A1D] text-white rounded-3xl shadow-2xl border border-white/15 overflow-hidden animate-scale-up mb-2">
          {/* Header with WhatsApp Brand Green */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow bg-black shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Ember Dust Support"
                  fill
                  sizes="40px"
                  className="object-cover scale-110"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white leading-tight">
                  Ember Dust Support
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Online · Typically replies in 5 min</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/10 transition-colors"
              aria-label="Close chat window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#141517] space-y-3 max-h-[300px] overflow-y-auto">
            {/* Incoming Welcome Bubble */}
            <div className="bg-[#1F2124] border border-white/10 rounded-2xl rounded-tl-sm p-3.5 text-xs text-white/90 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] text-[#B8935A] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#B8935A]" />
                <span>Mountain Hearth Farm</span>
              </div>
              <p className="leading-relaxed">
                Hello! 👋 Welcome to Ember Dust. How can we assist you with our organic wood ash blends today?
              </p>
              <div className="text-[10px] text-white/40 text-right">Just now</div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Frequently Asked:
              </div>
              <div className="flex flex-col gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(q)}
                    className="text-left bg-white/5 hover:bg-[#25D366]/15 hover:border-[#25D366]/40 border border-white/10 rounded-xl p-2 text-xs text-white/80 hover:text-[#25D366] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-[#181A1D] border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendChat(customMsg);
              }}
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#25D366]"
            />
            <button
              onClick={() => handleSendChat(customMsg)}
              className="p-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl shadow-lg transition-all cursor-pointer"
              aria-label="Send WhatsApp message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button with Glowing Aura (Exact matching reference in WRAPORA) */}
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer ${
            isOpen
              ? "bg-[#181A1D] border-2 border-white/40 shadow-xl"
              : "bg-[#25D366] hover:bg-[#1EBE5D]"
          }`}
          style={{
            boxShadow: isOpen
              ? "0 10px 25px rgba(0,0,0,0.5)"
              : "0 8px 24px -2px rgba(37, 211, 102, 0.7), 0 0 24px rgba(37, 211, 102, 0.45)",
          }}
          aria-label={isOpen ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-md" />
          )}
        </button>
      </div>
    </aside>
  );
}
