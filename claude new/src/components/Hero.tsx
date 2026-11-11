import React from 'react';
import { ArrowRight, Palette } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const scrollToCustom = () => {
    const el = document.getElementById('custom-portrait');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-[#FBFBFA] border-b border-[#EAE8E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-medium text-stone-500">
              <span>Paint Labs Working Studio</span>
              <span aria-hidden="true">·</span>
              <span>Original Art & Portraits</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.12] text-[#191918] font-normal tracking-tight [text-wrap:balance]">
              Hand-painted original art & bespoke portrait commissions.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl">
              Authentic painting delivering across GIKI. Choose from our designs or express your design and receive it right on your door step.
            </p>

            {/* Direct Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-white bg-[#191918] hover:bg-stone-800 transition-colors rounded-md shadow-sm group"
              >
                <span>Browse Original Paintings</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={scrollToCustom}
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-stone-900 bg-[#EFECE5] hover:bg-[#E4DFD5] transition-colors rounded-md border border-[#DDD8CD]"
              >
                <Palette className="w-4 h-4 text-stone-800" />
                <span>Commission Your Portrait</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Artwork Display (No details, not for sale) */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#EFECE6] border border-[#E5E0D5] shadow-sm">
              <img
                src="/assets/aistudio/bmw_12c31ce9.jpg"
                alt="Paint Labs Featured Painting"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
