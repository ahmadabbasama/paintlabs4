import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { CustomCommission } from '../types';
import { compressImageFile } from '../utils/compressImage';
import {
  Palette,
  Upload,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  Ruler,
} from 'lucide-react';

export const CustomPortraitSection: React.FC = () => {
  const { addCustomCommissionToCart, formatPrice, setIsSizeChartOpen } = useShop();

  // 3 Canvas options as requested:
  // 12 x 12 canvas (Rs. 500), 6 x 6 (Rs. 400), Photo frame (Rs. 800)
  const [sizeOption, setSizeOption] = useState<'6 × 6 in Canvas' | '12 × 12 in Canvas' | 'Photo Frame'>(
    '12 × 12 in Canvas'
  );

  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  // Acknowledgement checkbox and terms accordion
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const sizePrices: Record<string, number> = {
    '6 × 6 in Canvas': 400,
    '12 × 12 in Canvas': 500,
    'Photo Frame': 800,
  };

  const estimatedPrice = sizePrices[sizeOption] || 500;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      try {
        setPhotoPreview(await compressImageFile(file));
      } catch (err) {
        console.error(err);
        setPhotoName(null);
      }
    }
  };

  const handleSubmitCommission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setTermsError(true);
      setShowTerms(true);
      return;
    }
    setTermsError(false);

    const commission: CustomCommission = {
      id: Math.random().toString(36).substring(2, 9),
      size: sizeOption,
      description: description.trim() || 'Custom portrait order as described',
      referencePhotoUrl: photoPreview || undefined,
      referencePhotoName: photoName || undefined,
      estimatedPrice,
      agreedToTerms: true,
    };

    addCustomCommissionToCart(commission, true);
  };

  return (
    <section id="custom-portrait" className="py-16 bg-[#F4F1EA] border-b border-[#E7E3D8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-600 font-semibold mb-2">
            <Palette className="w-3.5 h-3.5 text-stone-800" />
            <span>Custom Portrait Studio</span>
            <span aria-hidden="true">·</span>
            <span>Describe Your Own Idea</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl text-[#191918] font-normal leading-tight [text-wrap:balance]">
            Commission a Custom Portrait
          </h2>

          <p className="text-stone-600 text-sm mt-1 leading-relaxed">
            Choose your canvas dimension, describe your idea, attach reference photos, and receive your painting right on your door step across GIKI.
          </p>
        </div>

        {/* 3 Configurator Sections + Acknowledgement Form */}
        <form
          onSubmit={handleSubmitCommission}
          className="bg-[#FBFBFA] rounded-xl p-6 sm:p-8 border border-[#EAE8E3] shadow-xs space-y-7"
        >
          {/* Section 1: Canvas Dimensions (3 Options) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                1. Canvas Dimensions
              </label>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-black underline cursor-pointer"
              >
                <Ruler className="w-3 h-3 text-stone-800" />
                <span>View Size Chart</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: '12 × 12 in Canvas', title: '12 × 12 in Canvas', price: 500 },
                { id: '6 × 6 in Canvas', title: '6 × 6 in Canvas', price: 400 },
                { id: 'Photo Frame', title: 'Photo Frame', price: 800 },
              ].map((opt) => {
                const isSelected = sizeOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSizeOption(opt.id as any)}
                    className={`py-3 px-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-[#191918] bg-[#191918] text-white shadow-xs ring-1 ring-black'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <span className="block font-semibold text-sm">{opt.title}</span>
                    <span
                      className={`text-xs tabular-nums mt-0.5 block ${
                        isSelected ? 'text-stone-300' : 'text-stone-600 font-medium'
                      }`}
                    >
                      {formatPrice(opt.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Describe Your Idea & Vision */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              2. Describe Your Painting Idea & Vision
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Describe what you envision: subject, posture, colors, background details, or mood.
            </p>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your design, colors, subject details, or any special preferences for your painting..."
              className="w-full text-xs p-3 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-black leading-relaxed"
            />
          </div>

          {/* Section 3: Reference Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              3. Reference Photo
            </label>

            <div className="mt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded hover:bg-stone-50 transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                <span>Upload Photo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photoPreview && (
              <div className="mt-3 relative inline-block rounded-lg border border-stone-300 overflow-hidden bg-stone-100">
                <img
                  src={photoPreview}
                  alt="Reference preview"
                  className="h-28 w-28 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoName(null);
                  }}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-stone-600 p-1 truncate max-w-[7rem]">
                  {photoName}
                </p>
              </div>
            )}
          </div>

          {/* Acknowledgement & Terms and Conditions Section */}
          <div className="pt-4 border-t border-[#EAE8E3] space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-[#F6F4EE] rounded-lg border border-[#E7E2D6]">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-stone-800 select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="w-4 h-4 text-black rounded border-stone-300 focus:ring-0 cursor-pointer accent-[#191918]"
                />
                <span>I agree to terms and conditions</span>
              </label>

              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-black transition-colors"
                aria-label="View Terms and Conditions"
              >
                <span>View Terms</span>
                {showTerms ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {termsError && (
              <p className="text-xs text-red-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Please agree to the terms and conditions before adding your custom portrait to the bag.</span>
              </p>
            )}

            {/* Expandable Terms and Conditions with user-specified bulleted list */}
            {showTerms && (
              <div className="p-4 bg-white rounded-lg border border-stone-200 text-xs text-stone-700 space-y-2.5 leading-relaxed animate-in fade-in duration-200">
                <p className="font-semibold text-stone-900">
                  Paint Labs reserves the right to decline any custom design request that contains or promotes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                  <li>Content of an obscene, indecent, or sexually explicit nature, or any material that is contrary to public decency</li>
                  <li>Abusive, offensive, or disrespectful language or imagery</li>
                  <li>Hateful or discriminatory content directed at any individual, group, race, religion, or belief</li>
                  <li>Graphic violence or depictions of cruelty</li>
                  <li>Unlawful activity, or content that encourages it</li>
                  <li>Material that is disrespectful to religious or cultural values</li>
                  <li>Copyrighted or trademarked material for which the customer does not hold the necessary permission, including the work of other artists</li>
                  <li>The likeness of any real person used in a manner intended to defame, mock, or cause harm</li>
                  <li className="text-stone-700">cartoon characters, people or animals</li>
                </ul>
              </div>
            )}
          </div>

          {/* Pricing & Add to Bag CTA */}
          <div className="pt-2 border-t border-[#EAE8E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-500 block">Total Price:</span>
              <span className="font-editorial text-2xl text-[#191918] font-semibold tabular-nums">
                {formatPrice(estimatedPrice)}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">
                Delivered right to your doorstep across GIKI
              </span>
            </div>

            <button
              type="submit"
              disabled={!agreedToTerms}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                agreedToTerms
                  ? 'text-white bg-[#191918] hover:bg-stone-800 shadow-sm cursor-pointer'
                  : 'text-stone-400 bg-stone-300 border border-stone-300 cursor-not-allowed shadow-none hover:bg-stone-300'
              }`}
            >
              <span>Add to Bag</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
