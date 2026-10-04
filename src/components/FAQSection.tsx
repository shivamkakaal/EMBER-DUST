"use client";

import React, { useState } from "react";
import { ChevronDown, MessageSquare, HelpCircle } from "lucide-react";
import { DEFAULT_WHATSAPP_NUMBER, buildWhatsAppUrl } from "@/lib/whatsapp";

interface FAQItem {
  question: string;
  answer: string;
  category: "all" | "gardening" | "ceramics" | "shipping";
}

const FAQS: FAQItem[] = [
  {
    question: "How does ordering on WhatsApp work?",
    answer:
      "It is frictionless! Select your desired quantity in our Price Calculator, enter your name and city, and tap 'Order on WhatsApp'. Our system instantly logs your order in our database with a unique order number (e.g. ED-20261005-XXXX) and opens WhatsApp with a pre-filled message. Our founder confirms shipping charges and sends your UPI/Bank payment link directly in chat.",
    category: "shipping",
  },
  {
    question: "How often should I apply wood ash to my garden soil?",
    answer:
      "Wood ash is very concentrated in potassium and alkaline minerals. For vegetables and fruit trees, a single seasonal application in early spring or right before monsoon (approx. 50g to 70g per square metre) is ideal. Use our Soil Dosage Calculator above for precise square-footage recommendations.",
    category: "gardening",
  },
  {
    question: "Is Ember Dust safe for edible vegetable crops and pets?",
    answer:
      "Yes, absolutely. Our wood ash is derived exclusively from 100% untreated wild hardwoods and seasonal orchard prunings. It contains zero coal ash, zero paint residues, zero plastic binders, and non-detectable heavy metals (independently lab-verified). Wash harvested vegetables as normal before eating.",
    category: "gardening",
  },
  {
    question: "Can I use the Ceramic Glaze Ash for Cone 6 (Mid-Fire) or only Cone 10?",
    answer:
      "Wood ash typically requires Cone 8 to Cone 11 (1240°C–1300°C) to fully melt on its own as a natural calcium-silicate flux. For Cone 6 (approx 1220°C), you can easily formulate exquisite ash glazes by pairing Ember Dust with 10–15% Gerstley Borate, Frit 3134, or Gillespie Borate to lower the eutectic melting threshold.",
    category: "ceramics",
  },
  {
    question: "What is the sieve mesh size and moisture content?",
    answer:
      "Our Horticultural Gardening Ash is screened through 40-mesh brass wire to eliminate chunky charcoal remnants while maintaining rapid soil solubility. Our Studio Ceramic Ash is double-washed to neutralize excess caustic lye and passed through a 100-mesh pharmaceutical sieve with moisture content below 1.5%.",
    category: "ceramics",
  },
  {
    question: "How is it packed and what is the shipping delivery timeline across India?",
    answer:
      "We pack in heavy-gauge, multi-layer moisture-barrier poly-lined kraft sacks to prevent ambient moisture absorption. Orders placed before 2 PM IST are dispatched the next business day via Delhivery / Bluedart Surface Express. Delivery takes 2–4 days for metros and 4–6 days for regional destinations.",
    category: "shipping",
  },
  {
    question: "Do you supply bulk orders for farms, tea estates, and pottery colleges?",
    answer:
      "Yes! We regularly fulfill bulk consignments from 100 kg to 5,000 kg in 25 kg poly-woven master bags with palletized freight. Tap the WhatsApp button or select 100+ kg in the calculator to unlock wholesale pricing.",
    category: "all",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const directChatUrl = buildWhatsAppUrl(
    DEFAULT_WHATSAPP_NUMBER,
    "Hello Ember Dust 👋 I have a question that isn't answered in your FAQ."
  );

  return (
    <section id="faq" className="py-20 bg-[#F6F2EA] border-b border-[#D8CBB6]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8935A]">
            Clear Answers
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1F2124]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7178] font-light">
            Everything you need to know about our sourcing, agronomy, ceramic glaze chemistry, and WhatsApp delivery.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass rounded-2xl border border-[#D8CBB6] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-serif text-lg sm:text-xl font-medium text-[#1F2124] hover:text-[#B8935A] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#B8935A] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-[#6B7178] leading-relaxed border-t border-[#D8CBB6]/40 pt-4 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center bg-[#EDE6DA] rounded-3xl p-8 border border-[#D8CBB6] space-y-3">
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1F2124]">
            Still have a question about your specific soil or kiln recipe?
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7178] max-w-md mx-auto">
            Our founder and soil agronomist is available directly on WhatsApp to answer technical inquiries.
          </p>
          <div className="pt-2">
            <a
              href={directChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold shadow transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Ask Founder on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
