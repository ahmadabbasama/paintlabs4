import React from 'react';
import { Painting } from '../types';
import { useShop } from '../context/ShopContext';
import { hasColorFamilyFeature, COLOR_FAMILY_OPTIONS } from '../utils/colorFamily';
import { Heart, Plus, Box, Palette } from 'lucide-react';

interface ProductCardProps {
  product: Painting;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    formatPrice,
    toggleWishlist,
    isWishlisted,
    setActivePainting,
    openPaintingWithSizePrompt,
  } = useShop();
  const isColorEligible = hasColorFamilyFeature(product);
  const wishlisted = isWishlisted(product.id);

  // Find small canvas price (e.g. 6x6 in or lowest variant price)
  const smallVariant =
    product.variants?.find(
      (v) => v.name.toLowerCase().includes('small') || v.size.includes('6')
    ) ||
    (product.variants && product.variants.length > 0
      ? product.variants.reduce((min, v) => (v.priceDelta < min.priceDelta ? v : min), product.variants[0])
      : null);

  const smallCanvasPrice = smallVariant
    ? Math.max(50, product.basePrice + smallVariant.priceDelta)
    : product.basePrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Takes the user inside and highlights the "Please select a size" prompt
    openPaintingWithSizePrompt(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => setActivePainting(product)}
      className="group cursor-pointer flex flex-col bg-transparent rounded-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#F4F2ED] border border-[#EAE6DD]">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />

        {/* Fallback container */}
        <div
          style={{ display: 'none' }}
          className="w-full h-full bg-[#EAE6DF] flex-col items-center justify-center p-4 text-center"
        >
          <Palette className="w-8 h-8 text-stone-400 mb-2" />
          <span className="text-xs text-stone-600 font-medium">{product.name}</span>
        </div>

        {/* Subtle Text Tag */}
        {product.tag ? (
          <div className="absolute top-3 left-3 text-[11px] font-medium tracking-wide text-stone-800 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-sm">
            {product.tag}
          </div>
        ) : isColorEligible ? (
          <div className="absolute top-3 left-3 text-[11px] font-medium tracking-wide text-stone-900 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-2xs">
            <Palette className="w-3 h-3 text-stone-700" />
            <span>7 Colors</span>
          </div>
        ) : null}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-xs text-stone-700 hover:text-black hover:bg-white transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save artwork'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-[#191918] text-[#191918]' : 'text-stone-700'
            }`}
          />
        </button>

        {/* Quick Add overlay button on hover */}
        <div className="absolute bottom-3 right-3 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#191918] hover:bg-stone-800 transition-colors rounded shadow-sm"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

      {/* Clean Unboxed Metadata & Card Details */}
      <div className="mt-3.5 flex flex-col space-y-1">
        {/* Unboxed Metadata with · separator */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 uppercase tracking-wider font-medium">
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span>{product.dimensions}</span>
          <span aria-hidden="true">·</span>
          <span>{product.year}</span>
        </div>

        {/* Painting Title */}
        <h3 className="text-sm sm:text-base font-semibold text-[#191918] group-hover:text-stone-700 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Medium description hint */}
        <p className="text-xs text-stone-500 line-clamp-1 font-normal">
          {product.subtitle}
        </p>

        {/* Color Family Swatch Preview */}
        {isColorEligible && (
          <div className="flex items-center gap-1.5 py-0.5">
            <div className="flex items-center -space-x-1 shrink-0">
              {COLOR_FAMILY_OPTIONS.map((c) => (
                <span
                  key={c.name}
                  title={`Color: ${c.name}`}
                  className={`w-2.5 h-2.5 rounded-full ring-1 ring-white ${c.badgeBg} ${c.border || ''}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-500 font-medium">
              7 Color Families
            </span>
          </div>
        )}

        {/* Price Baseline with Tabular Figures */}
        <div className="pt-1 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-stone-400">from</span>
            <span className="text-sm sm:text-base font-semibold text-[#191918] tabular-nums">
              {formatPrice(smallCanvasPrice)}
            </span>
            <span className="text-[11px] text-stone-500 font-normal">
              (6×6 in)
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            Hand-Crafted
          </span>
        </div>
      </div>
    </div>
  );
};
