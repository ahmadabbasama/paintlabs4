import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowUp, Ruler, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setIsSizeChartOpen, setIsNotInGikiOpen } = useShop();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#191918] text-[#D8D6CE] pt-16 pb-12 border-t border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-12 border-b border-stone-800">
          {/* Brand & Manifesto */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/only_logo_is_bdd5590e.png"
                alt="Paint Labs Logo"
                className="w-8 h-8 rounded object-cover border border-stone-700"
              />
              <span className="font-editorial text-2xl text-white font-normal">
                Paint Labs
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-md leading-relaxed">
              Original hand-painted artworks on canvas and custom commissioned portraits created from your personal photos and ideas, delivered directly to your doorstep.
            </p>
            <div className="pt-2 text-[11px] text-stone-500 flex flex-wrap items-center gap-3">
              <span>Canvas Paintings</span>
              <span>·</span>
              <span>Custom Portraits</span>
              <span>·</span>
              <span>Free Delivery Across GIKI</span>
            </div>
          </div>

          {/* Catalog Navigation */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">
              Artwork & Studio
            </p>
            <ul className="text-xs text-stone-400 space-y-2.5">
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Original Paintings
                </a>
              </li>
              <li>
                <a href="#custom-portrait" className="hover:text-white transition-colors">
                  Custom Portrait Studio
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact & Inquiries
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsNotInGikiOpen(true)}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Not in GIKI? (Wishlist)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care / Sizing */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">
              Customer Care
            </p>
            <ul className="text-xs text-stone-400 space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors text-left font-medium cursor-pointer"
                  title="Open Canvas & Frame Size Chart"
                >
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  <span>Canvas & Frame Sizing</span>
                </button>
              </li>
              <li>
                <span className="text-stone-400">GIKI Campus Delivery (Free)</span>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-white transition-colors text-stone-400 block"
                >
                  Direct CEO Inquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} Paint Labs. All rights reserved.</p>
            <span>·</span>
            <span className="text-stone-400">Delivering Across GIKI</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.youtube.com/@paintlabsofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Paint Labs on YouTube"
              title="Paint Labs YouTube Channel"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-red-600/60 hover:bg-stone-800 transition-all group"
            >
              <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-stone-300 group-hover:text-white">YouTube</span>
            </a>

            <a
              href="https://discord.gg/2EjvQndDb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Paint Labs on Discord"
              title="Paint Labs Discord Community"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-[#5865F2]/60 hover:bg-stone-800 transition-all group"
            >
              <svg
                className="w-4 h-4 fill-[#5865F2] group-hover:scale-110 transition-transform"
                viewBox="0 0 127.14 96.36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              <span className="text-xs font-medium text-stone-300 group-hover:text-white">Discord</span>
            </a>

            <span className="text-stone-400 text-xs font-medium">Currency: PKR (Rs.)</span>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Return to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
