'use client';

import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does supporting a problem help get it resolved?',
      answer:
        'When multiple community members support an issue, its urgency and priority score automatically rise on the municipal dispatch dashboard. Duplicate reports within the same 100-meter radius are also grouped together, demonstrating community-wide impact to local authorities.',
    },
    {
      question: 'Do I need an account to browse and report problems?',
      answer:
        'Anyone can explore reported issues, view status updates, and inspect resolution proofs freely without an account. When submitting a new report or endorsing an issue with your support, a quick free account ensures authenticity and lets you receive live resolution alerts.',
    },
    {
      question: 'What types of civic problems can I report on ProblemPulse?',
      answer:
        'ProblemPulse covers all core urban and civic infrastructure: Clean Water pipelines and leaks, Road potholes and paving, Electricity and streetlights, Sanitation and waste accumulation, Stormwater drainage and sewage, and public transit signage.',
    },
    {
      question: 'How do I know when the authorities have fixed my reported issue?',
      answer:
        'Each problem has a real-time public timeline: Submitted → Verified → Assigned → In Progress → Resolved. Once maintenance crews complete the repair, they upload before/after photographic proof of work, which community members can verify.',
    },
    {
      question: 'Can one person spam votes or support the same problem multiple times?',
      answer:
        'No. ProblemPulse enforces strict database-level unique constraints and rate limiters. Each authenticated citizen can only endorse a problem once, guaranteeing legitimate and trustworthy community sentiment.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-24 border-b border-[#e5e1d8] dark:border-[#24312b] bg-white dark:bg-[#111915]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading matching Wireframe 'FAQ Section' */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block mb-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#14201c] dark:text-[#ece9e1] tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="h-1 w-20 bg-[#0f6b4f] dark:bg-[#5cc9a0] mx-auto mt-2.5 rounded-full" />
          </div>
          <p className="text-base sm:text-lg text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mt-2">
            Everything you need to know about reporting, supporting, and tracking civic issues.
          </p>
        </div>

        {/* Accordion Rows matching Wireframe */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#141d19] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-[#f0ece4]/60 dark:hover:bg-[#1a2520]/60 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-base sm:text-lg text-[#14201c] dark:text-[#ece9e1] pr-4">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1f2b25] border border-[#e5e1d8] dark:border-[#2a3832] flex items-center justify-center shrink-0 text-[#0f6b4f] dark:text-[#5cc9a0]">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-sm sm:text-base text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed border-t border-[#e5e1d8]/50 dark:border-[#24312b]/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
