import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Ruler } from 'lucide-react';

export const SizeChartModal: React.FC = () => {
  const { isSizeChartOpen, setIsSizeChartOpen } = useShop();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSizeChartOpen) {
        setIsSizeChartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSizeChartOpen, setIsSizeChartOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isSizeChartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSizeChartOpen]);

  if (!isSizeChartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsSizeChartOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FBFBFA]">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-stone-800" />
            <h3 className="font-editorial text-lg text-stone-900 font-normal">
              Canvas & Frame Size Chart
            </h3>
          </div>
          <button
            onClick={() => setIsSizeChartOpen(false)}
            className="p-1.5 text-stone-500 hover:text-black rounded-full hover:bg-stone-200 transition-colors"
            aria-label="Close size chart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with Image */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-white text-center">
          <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-xs p-2">
            <img
              src="/assets/aistudio/cahr_03e2145e.png"
              alt="Paint Labs Canvas and Frame Size Chart"
              className="w-full h-auto max-h-[60vh] object-contain mx-auto"
            />
          </div>

          <div className="text-left bg-[#FBFBFA] rounded-lg p-3.5 border border-stone-200 text-xs space-y-1.5">
            <p className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
              Available Options & Dimensions
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-stone-700">
              <div className="p-2 bg-white rounded border border-stone-100">
                <span className="font-bold text-red-600 block">Small</span>
                <span className="text-[11px] text-stone-600">6 × 6 inches</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-100">
                <span className="font-bold text-amber-600 block">Large</span>
                <span className="text-[11px] text-stone-600">12 × 12 inches</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-100">
                <span className="font-bold text-emerald-700 block">Frame</span>
                <span className="text-[11px] text-stone-600">9.5 × 13.5 inches</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 pt-1 text-center">
              Please allow 0.5 to 1 inch (or 1–3 cm) difference due to manual measurement.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-[#FBFBFA] flex justify-end">
          <button
            onClick={() => setIsSizeChartOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#191918] rounded hover:bg-stone-800 transition-colors"
          >
            Close Chart
          </button>
        </div>
      </div>
    </div>
  );
};
