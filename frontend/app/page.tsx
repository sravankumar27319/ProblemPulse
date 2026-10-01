import React from 'react';
import Image from 'next/image';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/landing/Hero';
import { PartnersSection } from '../components/landing/PartnersSection';
import { CategorySection } from '../components/landing/CategorySection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { WhySection } from '../components/landing/WhySection';
import { ReviewsSection } from '../components/landing/ReviewsSection';
import { FaqSection } from '../components/landing/FaqSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1] transition-colors">
      {/* Unified Hero + Navbar with Single Continuous Sunset Background Image */}
      <div className="relative isolate overflow-hidden bg-[#1a1410]">
        {/* Single continuous background image across navbar and hero */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-city-sunset.jpg"
            alt="City skyline at sunset"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Single consistent overlay for text & navbar readability (Part B) */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Content layer: transparent navbar + hero */}
        <div className="relative z-20 flex flex-col">
          <Navbar transparent />
          <Hero />
        </div>
      </div>

      <main className="flex-1 w-full">
        {/* 3. Partners Section */}
        <PartnersSection />

        {/* 4. Highlight / Category Section ("Problems That Matter") */}
        <CategorySection />

        {/* 5. How ProblemPulse Works (4 Steps) */}
        <HowItWorks />

        {/* 6. Why ProblemPulse? (4 Feature Cards) */}
        <WhySection />

        {/* 7. Community Reviews (3 Testimonial Cards) */}
        <ReviewsSection />

        {/* 8. Frequently Asked Questions (Interactive Accordion) */}
        <FaqSection />

        {/* 9. Final Call to Action */}
        <CtaSection />
      </main>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
