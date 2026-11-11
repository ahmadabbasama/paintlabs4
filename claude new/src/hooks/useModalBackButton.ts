import { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';

type OverlayKey = 'product' | 'sizeChart' | 'cart' | 'checkout' | 'notInGiki' | 'media';

/**
 * Mobile back-button handling for overlays.
 *
 * Every time an overlay opens we push one entry onto the browser history, so the
 * phone's back button (including inside Instagram / WhatsApp in-app browsers) pops
 * that entry instead of leaving the site. The popstate handler then closes the
 * top-most overlay. When an overlay is closed from the UI (X button, Escape, backdrop)
 * its history entry is removed again, so history never grows stale.
 */
export function useModalBackButton(): void {
  const {
    activePainting,
    setActivePainting,
    setHighlightSizePrompt,
    isSizeChartOpen,
    setIsSizeChartOpen,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isNotInGikiOpen,
    setIsNotInGikiOpen,
    isMediaOpen,
    setIsMediaOpen,
  } = useShop();

  // Overlays that currently own a history entry, in the order they were opened.
  const stackRef = useRef<OverlayKey[]>([]);
  // Number of popstate events we triggered ourselves (via history.go) and must ignore.
  const ignoredPops = useRef(0);

  // Always points at the latest close functions, so the listener below can be attached once.
  const closersRef = useRef<Record<OverlayKey, () => void>>({
    product: () => {},
    sizeChart: () => {},
    cart: () => {},
    checkout: () => {},
    notInGiki: () => {},
    media: () => {},
  });
  closersRef.current = {
    product: () => {
      setActivePainting(null);
      setHighlightSizePrompt(false);
    },
    sizeChart: () => setIsSizeChartOpen(false),
    cart: () => setIsCartOpen(false),
    checkout: () => setIsCheckoutOpen(false),
    notInGiki: () => setIsNotInGikiOpen(false),
    media: () => setIsMediaOpen(false),
  };

  const productOpen = activePainting !== null;

  // Keep browser history in step with which overlays are open.
  useEffect(() => {
    const openNow: Record<OverlayKey, boolean> = {
      product: productOpen,
      sizeChart: isSizeChartOpen,
      cart: isCartOpen,
      checkout: isCheckoutOpen,
      notInGiki: isNotInGikiOpen,
      media: isMediaOpen,
    };

    const previous = stackRef.current;
    const next = previous.filter((key) => openNow[key]);
    (Object.keys(openNow) as OverlayKey[]).forEach((key) => {
      if (openNow[key] && !next.includes(key)) next.push(key);
    });

    const delta = next.length - previous.length;
    stackRef.current = next;

    try {
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          window.history.pushState({ plOverlay: true }, '');
        }
      } else if (delta < 0) {
        // Closed from the UI: drop the matching history entries (one popstate fires for the whole jump).
        ignoredPops.current += 1;
        window.history.go(delta);
      }
    } catch {
      // History API unavailable (very old webviews): overlays still work, just without back-button support.
    }
  }, [productOpen, isSizeChartOpen, isCartOpen, isCheckoutOpen, isNotInGikiOpen, isMediaOpen]);

  // Hardware / system back button: close the top-most overlay.
  useEffect(() => {
    // A reload while an overlay was open can leave a marker on the current entry; clear it.
    try {
      if (window.history.state && window.history.state.plOverlay) {
        window.history.replaceState(null, '');
      }
    } catch {
      // ignore
    }

    const handlePopState = () => {
      if (ignoredPops.current > 0) {
        ignoredPops.current -= 1;
        return;
      }
      const top = stackRef.current.pop();
      if (top) {
        closersRef.current[top]();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
