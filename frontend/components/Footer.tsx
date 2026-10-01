'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="border-t border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#5d6b65] dark:text-[#9aa8a1] transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">



        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#e5e1d8] dark:border-[#24312b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ProblemPulse Inc. Built for citizen-led municipal improvement.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#0f6b4f] dark:hover:text-[#5cc9a0] cursor-pointer">Security Audited</span>
            <span className="hover:text-[#0f6b4f] dark:hover:text-[#5cc9a0] cursor-pointer">Open Transparency</span>
            <span className="hover:text-[#0f6b4f] dark:hover:text-[#5cc9a0] cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
