import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, ExternalLink, Copy, Check, Mail } from 'lucide-react';

const STUDIO_EMAIL = 'paintlabs2000@gmail.com';

export const MediaModal: React.FC = () => {
  const { isMediaOpen, setIsMediaOpen, showToast } = useShop();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    let success = false;
    try {
      await navigator.clipboard.writeText(STUDIO_EMAIL);
      success = true;
    } catch {
      // Fallback for browsers / webviews without the async clipboard API
      try {
        const ta = document.createElement('textarea');
        ta.value = STUDIO_EMAIL;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        success = false;
      }
    }
    if (success) {
      setCopied(true);
      showToast('Copied!', STUDIO_EMAIL);
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Copy failed', 'Please select and copy the address manually.');
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMediaOpen) {
        setIsMediaOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMediaOpen, setIsMediaOpen]);

  if (!isMediaOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setIsMediaOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Small tab dialog (doesn't cover the full screen) */}
      <div className="relative w-full max-w-sm bg-[#FBFBFA] rounded-2xl shadow-2xl border border-[#EAE8E3] overflow-hidden z-10 flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EAE8E3] flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="font-editorial text-lg text-[#191918] font-normal leading-tight">
              Media
            </h3>
            <p className="text-[11px] text-stone-500">
              Paint Labs Official Channels
            </p>
          </div>
          <button
            onClick={() => setIsMediaOpen(false)}
            className="p-1.5 text-stone-400 hover:text-black rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close media tab"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5">
          {/* 1. YouTube Red Box */}
          <a
            href="https://www.youtube.com/@paintlabsofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-[#FF0000] hover:bg-[#E60000] text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
            title="Visit Paint Labs YouTube Channel"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src="/assets/aistudio/youtube_541d519c.png"
                    alt="YouTube logo"
                    className="w-7 h-auto object-contain"
                  />
                </div>
                <div>
                  <span className="text-sm font-bold block text-white leading-tight">
                    Paint Labs
                  </span>
                  <span className="text-[11px] text-white/90 font-medium">
                    @paintlabsofficial
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:text-white transition-colors shrink-0" />
            </div>
          </a>

          {/* 2. Discord Purple Box */}
          <a
            href="https://discord.gg/2EjvQndDb"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
            title="Join Paint Labs Discord Community"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {/* Official Discord Clyde Logo */}
                  <svg
                    className="w-6 h-6 fill-current text-white"
                    viewBox="0 0 127.14 96.36"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-bold block text-white leading-tight">
                    Discord
                  </span>
                  <span className="text-[11px] text-white/90 font-medium">
                    https://discord.gg/2EjvQndDb
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:text-white transition-colors shrink-0" />
            </div>
          </a>

          {/* 3. Gmail (plain text, not a link) with Copy button */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold block text-stone-900 leading-tight">
                    Gmail
                  </span>
                  <span className="text-[11px] text-stone-600 font-medium break-all select-text">
                    {STUDIO_EMAIL}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors cursor-pointer active:scale-95"
                aria-label="Copy email address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
