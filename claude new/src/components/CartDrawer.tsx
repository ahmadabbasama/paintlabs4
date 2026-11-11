import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { getColorFamilyOptionByName } from '../utils/colorFamily';
import { X, Trash2, ArrowRight, ShoppingBag, Palette, Eye } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    formatPrice,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    setIsCheckoutOpen,
  } = useShop();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBFBFA] shadow-2xl border-l border-[#EAE8E3] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#EAE8E3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-stone-700" />
              <h2 className="font-editorial text-lg text-[#191918] font-normal">
                Paint Labs Bag
              </h2>
              <span className="text-xs text-stone-500 tabular-nums">
                ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-500 hover:text-black rounded-full hover:bg-stone-200 transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <Palette className="w-6 h-6 stroke-1" />
                </div>
                <div className="space-y-1">
                  <p className="font-editorial text-lg text-stone-800">Your bag is empty</p>
                  <p className="text-xs text-stone-500 max-w-xs">
                    Choose from ready hand-painted designs or commission a custom portrait tailored to your story.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-white bg-[#191918] rounded-md hover:bg-stone-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const isCustom = !!item.customCommission;
                const commission = item.customCommission;
                const painting = item.painting;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-stone-200/70 last:border-none"
                  >
                    {/* Thumbnail / Reference preview */}
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-[#F4F2ED] border border-[#EAE6DD] shrink-0 relative">
                      {isCustom ? (
                        commission?.referencePhotoUrl ? (
                          <img
                            src={commission.referencePhotoUrl}
                            alt="Custom reference"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/70 p-2 text-center text-amber-800">
                            <Palette className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-semibold leading-tight">Custom Art</span>
                          </div>
                        )
                      ) : (
                        <img
                          src={painting?.image}
                          alt={painting?.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-semibold text-[#191918] truncate">
                            {isCustom ? 'Custom Portrait Commission' : painting?.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-stone-800 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isCustom && commission ? (
                          <div className="space-y-0.5 mt-0.5">
                            <p className="text-xs text-stone-600 font-medium">
                              {commission.size} · {commission.frame}
                            </p>
                            <p className="text-[11px] text-stone-500 italic line-clamp-1">
                              "{commission.description}"
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5 mt-0.5">
                            <p className="text-xs text-stone-500">
                              {item.selectedVariant?.name}
                            </p>
                            {item.selectedColorFamily && (() => {
                              const colorOpt = getColorFamilyOptionByName(item.selectedColorFamily);
                              return (
                                <div className="flex items-center gap-1.5 text-xs text-stone-700">
                                  <span className="text-[11px] font-medium text-stone-500">Color:</span>
                                  <span className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                                    {colorOpt && (
                                      <span
                                        className={`w-2 h-2 rounded-full ${colorOpt.badgeBg} ${colorOpt.border || ''}`}
                                      />
                                    )}
                                    <span>{item.selectedColorFamily}</span>
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Stepper */}
                        {!isCustom ? (
                          <div className="flex items-center border border-stone-300 rounded bg-white text-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-stone-600 hover:text-black"
                              aria-label="Decrease"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 tabular-nums font-medium text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-stone-600 hover:text-black"
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-stone-500">
                            1 Bespoke Commission
                          </span>
                        )}

                        {/* Price */}
                        <span className="text-sm font-semibold text-[#191918] tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="border-t border-[#EAE8E3] bg-[#FBFBFA] px-6 py-5 space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-stone-900">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GIKI Campus Delivery</span>
                  <span className="tabular-nums font-semibold text-emerald-700">
                    Rs. 0
                  </span>
                </div>

                <div className="flex justify-between text-base font-semibold text-[#191918] pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">{formatPrice(cartSubtotal)}</span>
                </div>
              </div>

              {/* Primary Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-xs uppercase tracking-wider font-semibold text-white bg-[#191918] hover:bg-stone-800 transition-colors rounded-md shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-stone-500 text-center">
                Delivering right to your hostel or doorstep across GIKI
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
