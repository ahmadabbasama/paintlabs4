import React, { useState, useEffect } from 'react';
import { ProductVariant } from '../types';
import { useShop } from '../context/ShopContext';
import { hasColorFamilyFeature, getColorOptionsForPainting } from '../utils/colorFamily';
import { X, Check, Heart, Shield, Truck, RotateCcw, Star, Plus, Palette, Award, Ruler } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    activePainting,
    setActivePainting,
    formatPrice,
    addPaintingToCart,
    toggleWishlist,
    isWishlisted,
    setIsCheckoutOpen,
    isSizeChartOpen,
    setIsSizeChartOpen,
    highlightSizePrompt,
    setHighlightSizePrompt,
    reviews,
    reviewsLoading,
    submitReview,
  } = useShop();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColorFamily, setSelectedColorFamily] = useState<string>('Red');
  const [hasAttemptedWithoutSize, setHasAttemptedWithoutSize] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isPostingReview, setIsPostingReview] = useState(false);

  // Reviews are loaded from Supabase for every visitor (see ShopContext).
  const reviewsList = activePainting
    ? reviews.filter((r) => r.paintingId === activePainting.id)
    : [];

  const handleClose = () => {
    setActivePainting(null);
    setHighlightSizePrompt(false);
    setHasAttemptedWithoutSize(false);
  };

  useEffect(() => {
    if (!activePainting) return;
    setSelectedVariant(null);
    const colors = getColorOptionsForPainting(activePainting);
    setSelectedColorFamily(colors[0]?.name || 'Red');
    setQuantity(1);
    setShowReviewForm(false);
    setActiveTab('details');
    setHasAttemptedWithoutSize(false);
  }, [activePainting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActivePainting]);

  if (!activePainting) return null;

  const isColorEligible = hasColorFamilyFeature(activePainting);
  const availableColors = getColorOptionsForPainting(activePainting);
  const wishlisted = isWishlisted(activePainting.id);

  // Find small canvas price (e.g. 6x6 in or lowest variant price)
  const smallVariant =
    activePainting.variants?.find(
      (v) => v.name.toLowerCase().includes('small') || v.size.includes('6')
    ) ||
    (activePainting.variants && activePainting.variants.length > 0
      ? activePainting.variants.reduce((min, v) => (v.priceDelta < min.priceDelta ? v : min), activePainting.variants[0])
      : null);

  const smallCanvasPrice = smallVariant
    ? Math.max(50, activePainting.basePrice + smallVariant.priceDelta)
    : activePainting.basePrice;

  const currentPrice = selectedVariant
    ? Math.max(50, activePainting.basePrice + selectedVariant.priceDelta)
    : smallCanvasPrice;

  const isSizeHighlighted = !selectedVariant && (highlightSizePrompt || hasAttemptedWithoutSize);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setHasAttemptedWithoutSize(true);
      setHighlightSizePrompt(true);
      return;
    }
    const colorToPass = isColorEligible ? selectedColorFamily : undefined;
    addPaintingToCart(activePainting, selectedVariant, quantity, true, colorToPass);
    handleClose();
  };

  const handleInstantBuy = () => {
    if (!selectedVariant) {
      setHasAttemptedWithoutSize(true);
      setHighlightSizePrompt(true);
      return;
    }
    const colorToPass = isColorEligible ? selectedColorFamily : undefined;
    addPaintingToCart(activePainting, selectedVariant, quantity, false, colorToPass);
    handleClose();
    setIsCheckoutOpen(true);
  };

  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : null;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPostingReview || !newReviewAuthor.trim() || !newReviewComment.trim()) return;

    setIsPostingReview(true);
    const ok = await submitReview({
      paintingId: activePainting.id,
      customerName: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
    });
    setIsPostingReview(false);
    if (!ok) return;

    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setShowReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#FBFBFA] rounded-xl shadow-2xl border border-[#EAE8E3] overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE8E3] bg-[#FBFBFA]">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium uppercase tracking-wider">
            <span>{activePainting.category}</span>
            <span aria-hidden="true">·</span>
            <span>{activePainting.dimensions}</span>
            <span aria-hidden="true">·</span>
            <span>{activePainting.year} Collection</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(activePainting.id)}
              className="p-1.5 text-stone-600 hover:text-black rounded-full hover:bg-stone-200/60 transition-colors"
              title="Save to wishlist"
            >
              <Heart
                className={`w-4 h-4 ${
                  wishlisted ? 'fill-[#191918] text-[#191918]' : 'text-stone-600'
                }`}
              />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-stone-600 hover:text-black rounded-full hover:bg-stone-200/60 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content: 2-Column Split */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Gallery Visual Stage */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#F4F2ED] border border-[#EAE6DD] shadow-xs">
                <img
                  src={activePainting.image}
                  alt={activePainting.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {activePainting.tag && (
                  <div className="absolute top-3 left-3 text-xs font-medium tracking-wide text-stone-900 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded">
                    {activePainting.tag}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Contiguous Purchase Module */}
            <div className="md:col-span-6 flex flex-col space-y-6">
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl text-[#191918] font-normal leading-tight">
                  {activePainting.name}
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  {activePainting.subtitle || activePainting.medium}
                </p>

                {/* Price and Rating */}
                <div className="mt-3 flex items-baseline justify-between border-b border-[#EAE8E3] pb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#191918] tabular-nums">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="text-xs text-stone-500 font-normal">
                      {selectedVariant
                        ? (selectedVariant.name.includes('Print') ? 'Fine Art Print' : 'Selected Edition')
                        : 'starting at Small (6×6 in)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-600">
                    {reviewsList.length > 0 && avgRating ? (
                      <>
                        <div className="flex text-amber-600">
                          {'★'.repeat(Math.round(Number(avgRating)))}
                        </div>
                        <span className="tabular-nums font-medium text-stone-900">
                          {avgRating}
                        </span>
                        <span className="text-stone-400">
                          ({reviewsList.length} {reviewsList.length === 1 ? 'review' : 'reviews'})
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTab('reviews');
                          setShowReviewForm(true);
                        }}
                        className="text-stone-500 hover:text-black underline text-xs cursor-pointer"
                      >
                        No reviews yet · Write a review
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Family Selector (Available for selected original paintings) */}
              {isColorEligible && (
                <div className="space-y-2.5 p-3.5 bg-[#F6F4EF] rounded-xl border border-[#E7E3D8]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-stone-700" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                        Color Family
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        (7 Palette Variations)
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                      {selectedColorFamily}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                    {availableColors.map((c) => {
                      const isSelected = selectedColorFamily === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColorFamily(c.name)}
                          className={`group flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white shadow-2xs ring-2 ring-[#191918]'
                              : 'hover:bg-white/60 bg-transparent'
                          }`}
                          title={`Select ${c.name} color family`}
                        >
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${c.badgeBg} ${c.border || ''}`}
                          >
                            {isSelected && (
                              <Check
                                className={`w-4 h-4 stroke-[2.5] ${
                                  c.name === 'White' || c.name === 'Yellow'
                                    ? 'text-stone-900'
                                    : 'text-white'
                                }`}
                              />
                            )}
                          </div>
                          <span
                            className={`text-[10px] leading-tight font-medium text-center truncate max-w-full ${
                              isSelected ? 'text-stone-900 font-bold' : 'text-stone-600'
                            }`}
                          >
                            {c.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Select your preferred hue for this artwork. Studio artist customizes this edition in your chosen <span className="font-semibold text-stone-800">{selectedColorFamily}</span> color family.
                  </p>
                </div>
              )}

              {/* Format / Framing Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                      Edition & Museum Framing
                    </span>
                    {!selectedVariant ? (
                      <span
                        className={`text-[11px] font-medium transition-all duration-300 inline-flex items-center gap-1 ${
                          isSizeHighlighted
                            ? 'text-red-700 bg-red-100 ring-2 ring-red-400 px-2 py-0.5 rounded font-bold animate-pulse'
                            : 'text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded text-[10px]'
                        }`}
                      >
                        * Please select a size
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-2" />
                        <span>{selectedVariant.size}</span>
                      </span>
                    )}
                  </div>

                  {/* Size Chart Option */}
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-black underline font-medium cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5 text-stone-500" />
                    <span>Size Chart</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {activePainting.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const price = Math.max(50, activePainting.basePrice + v.priceDelta);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(v);
                          setHighlightSizePrompt(false);
                          setHasAttemptedWithoutSize(false);
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#191918] bg-stone-50 shadow-2xs ring-1 ring-[#191918]'
                            : isSizeHighlighted
                            ? 'border-red-300 hover:border-stone-400 bg-red-50/20'
                            : 'border-[#EAE8E3] hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#191918] bg-[#191918] text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-2" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#191918]">{v.name}</p>
                            <p className="text-[11px] text-stone-500">{v.frame}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#191918] tabular-nums">
                          {formatPrice(price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add to Bag and Buy Action */}
              <div className="space-y-3 pt-2 border-t border-[#EAE8E3]">
                {isSizeHighlighted && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-center text-xs text-red-700 font-medium animate-pulse">
                    Please select a size above before adding to bag
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-md bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-stone-600 hover:text-black text-sm cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-semibold tabular-nums text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-stone-600 hover:text-black text-sm cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-5 text-xs uppercase tracking-wider font-semibold text-white bg-[#191918] hover:bg-stone-800 transition-colors rounded-md shadow-sm cursor-pointer"
                  >
                    {selectedVariant
                      ? `Add to Bag · ${formatPrice(currentPrice * quantity)}`
                      : 'Add to Bag (Select Size First)'}
                  </button>
                </div>

                <button
                  onClick={handleInstantBuy}
                  className="w-full py-2.5 px-4 text-xs uppercase tracking-wider font-semibold text-stone-900 bg-[#EFECE5] hover:bg-[#E4E0D6] transition-colors rounded-md border border-[#DDD8CD] cursor-pointer"
                >
                  Buy Now with Express Checkout
                </button>

                <p className="text-[11px] text-stone-500 text-center">
                  {activePainting.leadTime}
                </p>
              </div>

              {/* Tabbed Specifications & Customer Reviews (Canvas & Surface removed) */}
              <div className="pt-2 border-t border-[#EAE8E3]">
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      activeTab === 'details'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Artwork Story
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      activeTab === 'reviews'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Customer Reviews {reviewsList.length > 0 ? `(${reviewsList.length})` : ''}
                  </button>
                </div>

                {/* Tab 1: Story */}
                {activeTab === 'details' && (
                  <div className="py-4 text-xs text-stone-600 space-y-3 leading-relaxed">
                    <p>{activePainting.description}</p>
                    <div className="pt-2 grid grid-cols-2 gap-2 text-stone-700">
                      <div>
                        <span className="font-semibold block text-stone-900">Dimensions:</span>
                        <span>{activePainting.dimensions}</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-stone-900">Authentication:</span>
                        <span>Hand-Signed by Paint Labs Artist</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Reviews */}
                {activeTab === 'reviews' && (
                  <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900">
                        {reviewsList.length === 0 ? 'Customer Reviews' : `Customer Reviews (${reviewsList.length})`}
                      </span>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="text-xs font-medium text-stone-800 hover:text-black flex items-center gap-1 underline"
                      >
                        {showReviewForm ? 'Cancel' : '+ Write a Review'}
                      </button>
                    </div>

                    {/* Write a Review Form */}
                    {showReviewForm && (
                      <form onSubmit={handleAddReview} className="bg-stone-50 p-4 rounded-lg space-y-3 border border-stone-200">
                        <p className="text-xs font-semibold text-stone-900">Share Your Experience</p>
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="text"
                            placeholder="Your Name *"
                            value={newReviewAuthor}
                            onChange={(e) => setNewReviewAuthor(e.target.value)}
                            required
                            className="w-full text-xs p-2 bg-white rounded border border-stone-300 focus:outline-none focus:border-black"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-stone-600 font-medium">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className={`text-base leading-none transition-transform hover:scale-110 ${
                                  star <= newReviewRating ? 'text-amber-500' : 'text-stone-300'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <span className="text-stone-500 text-[11px]">({newReviewRating} of 5 stars)</span>
                        </div>

                        <textarea
                          placeholder="How does this artwork look in your room? Share your thoughts on colors, canvas quality, and finish..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          required
                          rows={2}
                          className="w-full text-xs p-2 bg-white rounded border border-stone-300 focus:outline-none focus:border-black"
                        />

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-3 py-1.5 text-xs text-stone-600 hover:text-black"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isPostingReview}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#191918] disabled:bg-stone-400 rounded hover:bg-stone-800 transition-colors"
                          >
                            {isPostingReview ? 'Posting...' : 'Submit Review'}
                          </button>
                        </div>
                      </form>
                    )}

                    {reviewsLoading && reviewsList.length === 0 ? (
                      <p className="text-xs text-stone-500 py-4 text-center">Loading reviews...</p>
                    ) : reviewsList.length === 0 ? (
                      <div className="py-6 text-center space-y-2 bg-[#F9F8F5] rounded-lg border border-stone-200/80 p-4">
                        <p className="text-xs font-medium text-stone-800">No reviews yet</p>
                        <p className="text-[11px] text-stone-500">
                          Have you ordered or received this artwork? Be the first to write a review!
                        </p>
                        {!showReviewForm && (
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="mt-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#191918] rounded hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            Write a Review
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {reviewsList.map((rev) => (
                          <div key={rev.id} className="text-xs border-b border-stone-100 pb-2.5 last:border-none">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-stone-900">{rev.author}</span>
                              <span className="text-[11px] text-stone-400">{rev.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-stone-500 my-0.5">
                              <span className="text-amber-500">{'★'.repeat(rev.rating)}</span>
                              <span>·</span>
                              <span>{rev.location}</span>
                            </div>
                            <p className="text-stone-700 leading-relaxed mt-1">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
