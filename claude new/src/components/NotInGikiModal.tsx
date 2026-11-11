// Paint Labs: Not in GIKI Wishlist & Outside Delivery Modal
import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, MapPin, Trash2, ArrowRight, Eye, Send, CheckCircle2, Palette } from 'lucide-react';
import { hasColorFamilyFeature, COLOR_FAMILY_OPTIONS } from '../utils/colorFamily';

export const NotInGikiModal: React.FC = () => {
  const {
    isNotInGikiOpen,
    setIsNotInGikiOpen,
    wishlist,
    toggleWishlist,
    paintings,
    setActivePainting,
    formatPrice,
    submitNotInGiki,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'wishlist' | 'inquire'>('wishlist');
  const [inquireName, setInquireName] = useState('');
  const [inquireEmail, setInquireEmail] = useState('');
  const [inquireCity, setInquireCity] = useState('');
  const [inquirePhone, setInquirePhone] = useState('');
  const [inquireMessage, setInquireMessage] = useState('');
  const [inquireSubmitted, setInquireSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNotInGikiOpen) {
        setIsNotInGikiOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNotInGikiOpen, setIsNotInGikiOpen]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isNotInGikiOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNotInGikiOpen]);

  if (!isNotInGikiOpen) return null;

  const wishlistedPaintings = paintings.filter((p) => wishlist.includes(p.id));

  const handleOpenPainting = (painting: any) => {
    setIsNotInGikiOpen(false);
    setActivePainting(painting);
  };

  const handleBrowseCollection = () => {
    setIsNotInGikiOpen(false);
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInquireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending || !inquireName.trim() || !inquireEmail.trim() || !inquireCity.trim()) return;

    setIsSending(true);
    setSendError(null);

    // Saved straight to the `not_in_giki` table in Supabase.
    const ok = await submitNotInGiki({
      customerName: inquireName.trim(),
      email: inquireEmail.trim(),
      location: inquireCity.trim(),
      phone: inquirePhone.trim(),
      wishlistItems: wishlistedPaintings.map((p) => p.name).join(', '),
      notes: inquireMessage.trim(),
    });

    setIsSending(false);

    if (!ok) {
      setSendError('We could not send your request just now. Please check your connection and try again.');
      return;
    }

    setInquireSubmitted(true);
    setTimeout(() => {
      setInquireSubmitted(false);
      setInquireName('');
      setInquireEmail('');
      setInquireCity('');
      setInquirePhone('');
      setInquireMessage('');
      setActiveTab('wishlist');
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setIsNotInGikiOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#FBFBFA] rounded-2xl shadow-2xl border border-[#EAE8E3] overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E3] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs shrink-0">
              <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-lg sm:text-xl text-[#191918] font-normal leading-tight">
                  Not in GIKI
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                  Wishlist
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Save your favorite artworks & request delivery to your city
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNotInGikiOpen(false)}
            className="p-1.5 text-stone-400 hover:text-black rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 pb-0 bg-[#FBFBFA] border-b border-[#EAE8E3] flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'border-[#191918] text-[#191918]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'wishlist' ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>My Wishlist ({wishlist.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquire')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inquire'
                ? 'border-[#191918] text-[#191918]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-stone-600" />
            <span>Outside GIKI Delivery</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Context Notice */}
          <div className="p-3.5 rounded-xl bg-[#F6F3EB] border border-[#E8E2D5] flex items-start gap-3">
            <MapPin className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 space-y-0.5 leading-relaxed">
              <p className="font-semibold text-stone-900">
                Live Outside GIKI Campus?
              </p>
              <p className="text-[11px] text-stone-600">
                Paint Labs provides free instant delivery across GIKI hostel and faculty residences. If you live elsewhere in Pakistan, keep your favorite paintings saved here in your wishlist or submit a direct courier inquiry to our CEO.
              </p>
            </div>
          </div>

          {/* TAB 1: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistedPaintings.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3 bg-white rounded-xl border border-stone-200/80">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 stroke-1" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-editorial text-lg text-stone-900">
                      Your Wishlist is Empty
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Whenever you see a painting you love, tap the heart icon (♡) on the artwork card to save it right here for later.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBrowseCollection}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#191918] text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Browse Original Paintings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-medium">
                      Saved Artworks ({wishlistedPaintings.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        wishlist.forEach((id) => toggleWishlist(id));
                      }}
                      className="text-stone-400 hover:text-stone-700 underline text-[11px] cursor-pointer"
                    >
                      Clear Wishlist
                    </button>
                  </div>

                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    {wishlistedPaintings.map((p) => {
                      const hasColor = hasColorFamilyFeature(p);
                      return (
                        <div
                          key={p.id}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
                        >
                          {/* Image & Title */}
                          <div
                            onClick={() => handleOpenPainting(p)}
                            className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-stone-200 shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-xs sm:text-sm text-stone-900 truncate hover:text-stone-700">
                                {p.name}
                              </h5>
                              <p className="text-[11px] text-stone-500 truncate">
                                {p.subtitle || p.medium}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-stone-900 tabular-nums">
                                  from {formatPrice(p.basePrice)}
                                </span>
                                {hasColor && (
                                  <span className="text-[10px] text-stone-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                                    <Palette className="w-2.5 h-2.5 text-amber-700" />
                                    <span>7 Colors</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenPainting(p)}
                              className="px-3 py-1.5 text-xs font-semibold text-stone-900 bg-[#EFECE5] hover:bg-[#E4E0D6] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              title="View artwork details & sizes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(p.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors rounded-full hover:bg-stone-100 cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleBrowseCollection}
                      className="text-xs text-stone-600 hover:text-black underline font-medium cursor-pointer"
                    >
                      + Add more paintings to wishlist
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('inquire')}
                      className="text-xs text-stone-900 font-semibold bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    >
                      Request Delivery to Your City →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INQUIRE OUTSIDE GIKI */}
          {activeTab === 'inquire' && (
            <div className="space-y-4">
              {/* Green Box: Delivery arrangement notice */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-snug">
                  If we can arrange a delivery for your location we contact you
                </p>
              </div>

              {inquireSubmitted ? (
                <div className="py-10 px-4 text-center space-y-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-editorial text-lg text-emerald-950 font-normal">
                      Delivery Request Received
                    </h4>
                    <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                      Thank you! We will review dispatch options for {inquireCity} and contact you directly with packaging & courier details.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInquireSubmit} className="space-y-3.5 bg-white p-5 rounded-xl border border-stone-200">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Outside GIKI Delivery Request
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Let us know where you are located. We arrange courier delivery for collectors across Pakistan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bilal Ahmed"
                        value={inquireName}
                        onChange={(e) => setInquireName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-[#FDFCFB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                        City / Destination <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Islamabad, Lahore, Karachi"
                        value={inquireCity}
                        onChange={(e) => setInquireCity(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-[#FDFCFB]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your.email@example.com"
                        value={inquireEmail}
                        onChange={(e) => setInquireEmail(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-[#FDFCFB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                        WhatsApp / Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="03XX-XXXXXXX"
                        value={inquirePhone}
                        onChange={(e) => setInquirePhone(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-[#FDFCFB]"
                      />
                    </div>
                  </div>

                  {wishlistedPaintings.length > 0 && (
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                      <span className="text-[11px] font-medium text-stone-500 block mb-1">
                        Inquiry includes your {wishlistedPaintings.length} wishlisted item(s):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {wishlistedPaintings.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 bg-white border border-stone-200 rounded text-[10px] font-semibold text-stone-800"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                      Message / Special Delivery Details
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any specific delivery instructions or preferred size/finish..."
                      value={inquireMessage}
                      onChange={(e) => setInquireMessage(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-[#FDFCFB] resize-none"
                    />
                  </div>

                  {sendError && (
                    <p className="text-xs text-red-600 font-medium">{sendError}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('wishlist')}
                      className="text-xs text-stone-500 hover:text-black underline cursor-pointer"
                    >
                      Back to Wishlist
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2.5 bg-[#191918] hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSending ? 'Sending...' : 'Send Request'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
