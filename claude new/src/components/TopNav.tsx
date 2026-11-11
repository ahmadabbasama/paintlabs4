// Paint Labs: Top Navigation with Media and Not in GIKI
import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Heart, X, Palette, Plus, Sparkles } from 'lucide-react';

interface TopNavProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const TopNav: React.FC<TopNavProps> = ({ onSelectCategory, selectedCategory }) => {
  const {
    cartItemCount,
    setIsCartOpen,
    wishlist,
    setIsMediaOpen,
    setIsNotInGikiOpen,
    setIsAddPaintingOpen,
  } = useShop();

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    onSelectCategory(id);
    const collectionEl = document.getElementById('collection');
    if (collectionEl) {
      collectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#EAE8E3] transition-all">
      {/* Strict Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand logo and wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-editorial text-2xl font-medium tracking-tight text-[#191918] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <img
            src="/assets/aistudio/only_logo_is_bdd5590e.png"
            alt="Paint Labs Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded object-cover shadow-xs border border-stone-800/10"
          />
          <span>Paint Labs</span>
        </a>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs tracking-wider uppercase font-medium text-stone-600">
          <button
            onClick={(e) => handleNavClick('all', e)}
            className={`hover:text-[#191918] transition-colors whitespace-nowrap shrink-0 py-1 border-b ${
              selectedCategory === 'all'
                ? 'border-[#191918] text-[#191918]'
                : 'border-transparent text-stone-600'
            }`}
          >
            Original Paintings
          </button>

          <button
            onClick={(e) => scrollToSection('custom-portrait', e)}
            className="hover:text-[#191918] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent text-stone-900 font-semibold flex items-center gap-1.5"
          >
            <Palette className="w-3.5 h-3.5 text-stone-800" />
            <span>Custom Portrait Studio</span>
          </button>

          <button
            onClick={(e) => scrollToSection('contact', e)}
            className="hover:text-[#191918] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent text-stone-600"
          >
            Contact Us
          </button>

          <button
            type="button"
            onClick={() => setIsMediaOpen(true)}
            className="hover:text-[#191918] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent text-stone-600 cursor-pointer"
          >
            Media
          </button>

          <button
            type="button"
            onClick={() => setIsNotInGikiOpen(true)}
            className="hover:text-[#191918] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent text-stone-600 cursor-pointer flex items-center gap-1.5"
            title="Wishlist & Outside GIKI delivery"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>Not in GIKI</span>
            {wishlist.length > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Mobile Media button */}
          <button
            type="button"
            onClick={() => setIsMediaOpen(true)}
            className="md:hidden text-xs font-semibold text-stone-700 hover:text-black px-2 py-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Media
          </button>

          {/* Mobile Not in GIKI button */}
          <button
            type="button"
            onClick={() => setIsNotInGikiOpen(true)}
            className="md:hidden text-xs font-semibold text-stone-700 hover:text-black px-2 py-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-1"
            title="Wishlist"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30" />
            <span>Not in GIKI</span>
            {wishlist.length > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1 rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Wishlist count button on desktop */}
          {wishlist.length > 0 && (
            <button
              onClick={() => setIsNotInGikiOpen(true)}
              className="hidden sm:flex items-center gap-1 p-2 text-stone-700 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50 text-xs font-medium cursor-pointer"
              title="Open Wishlist"
            >
              <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              <span className="tabular-nums text-xs font-semibold text-stone-900">{wishlist.length}</span>
            </button>
          )}

          

          {/* Primary Action: Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white bg-[#191918] hover:bg-stone-800 transition-colors rounded-md whitespace-nowrap shrink-0"
            aria-label={`Open shopping bag with ${cartItemCount} items`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag</span>
            <span className="tabular-nums bg-white/20 text-white rounded px-1.5 py-0.2 text-[11px] font-semibold">
              {cartItemCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
