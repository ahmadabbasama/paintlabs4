import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Painting,
  ProductVariant,
  CustomCommission,
  CartItem,
  Order,
  ShippingAddress,
  ProductReview,
} from '../types';
import { supabase } from '../lib/supabase';
import { PAINTINGS } from '../data/products';
import {
  loadPaintingsFromStorage,
  savePaintingsToStorage,
  exportPaintingsBackup,
  importPaintingsBackup,
  copyPaintingsToClipboard,
} from '../utils/artStorage';

interface Toast {
  id: string;
  title: string;
  subtitle?: string;
}

interface ShopContextType {
  paintings: Painting[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activePainting: Painting | null;
  setActivePainting: (painting: Painting | null) => void;
  highlightSizePrompt: boolean;
  setHighlightSizePrompt: (highlight: boolean) => void;
  openPaintingWithSizePrompt: (painting: Painting) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isCustomCommissionOpen: boolean;
  setIsCustomCommissionOpen: (open: boolean) => void;
  isSizeChartOpen: boolean;
  setIsSizeChartOpen: (open: boolean) => void;
  isMediaOpen: boolean;
  setIsMediaOpen: (open: boolean) => void;
  isNotInGikiOpen: boolean;
  setIsNotInGikiOpen: (open: boolean) => void;
  isAddPaintingOpen: boolean;
  setIsAddPaintingOpen: (open: boolean) => void;
  addPainting: (painting: Painting) => void;
  deletePainting: (paintingId: string) => void;
  exportAllPaintings: () => void;
  copyArtDataToClipboard: () => Promise<boolean>;
  syncPaintingsToServer: () => Promise<boolean>;
  importPaintingsFile: (file: File) => Promise<boolean>;
  currency: 'PKR';
  currencySymbol: string;
  formatPrice: (amountInPKR: number) => string;
  addPaintingToCart: (
    painting: Painting,
    variant?: ProductVariant,
    quantity?: number,
    openDrawer?: boolean,
    selectedColorFamily?: string
  ) => void;
  addCustomCommissionToCart: (commission: CustomCommission, openDrawer?: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (paintingId: string) => void;
  isWishlisted: (paintingId: string) => boolean;
  appliedPromo: string | null;
  promoDiscountPercent: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartShippingFee: number;
  cartTotal: number;
  cartItemCount: number;
  createOrder: (data: {
    orderId?: string;
    shippingAddress: ShippingAddress;
    shippingMethod: 'eco' | 'express';
    paymentMethod: 'card' | 'apple_pay' | 'cod';
  }) => Order;
  lastPlacedOrder: Order | null;
  submitContactInquiry: (name: string, email: string, message: string) => Promise<boolean>;
  submitNotInGiki: (data: {
    customerName: string;
    email: string;
    location: string;
    phone: string;
    wishlistItems: string;
    notes: string;
  }) => Promise<boolean>;
  saveOrderToDatabase: (data: {
    orderId: string;
    customerName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    note: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  reviews: ProductReview[];
  reviewsLoading: boolean;
  submitReview: (data: {
    paintingId: string;
    customerName: string;
    rating: number;
    comment: string;
  }) => Promise<boolean>;
  toasts: Toast[];
  showToast: (title: string, subtitle?: string) => void;
  dismissToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paintings, setPaintings] = useState<Painting[]>(() => {
    try {
      const saved = localStorage.getItem('paintlabs_user_paintings');
      return saved ? JSON.parse(saved) : PAINTINGS;
    } catch {
      return PAINTINGS;
    }
  });

  // Hydrate from IndexedDB on mount to retrieve any paintings saved beyond the 5MB localStorage quota
  useEffect(() => {
    let isMounted = true;
    loadPaintingsFromStorage().then((loaded) => {
      if (isMounted && loaded && loaded.length > 0) {
        setPaintings(loaded);
      }
    }).catch(console.error);
    return () => {
      isMounted = false;
    };
  }, []);
  const [isAddPaintingOpen, setIsAddPaintingOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('paintlabs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('paintlabs_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('paintlabs_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activePainting, setActivePainting] = useState<Painting | null>(null);
  const [highlightSizePrompt, setHighlightSizePrompt] = useState(false);

  const openPaintingWithSizePrompt = (painting: Painting) => {
    setActivePainting(painting);
    setHighlightSizePrompt(true);
  };
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomCommissionOpen, setIsCustomCommissionOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isNotInGikiOpen, setIsNotInGikiOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const currency = 'PKR';
  const currencySymbol = 'Rs. ';

  useEffect(() => {
    try {
      localStorage.setItem('paintlabs_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('paintlabs_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('paintlabs_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const showToast = (title: string, subtitle?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, subtitle }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const formatPrice = (amountInPKR: number): string => {
    return `Rs. ${Math.round(amountInPKR).toLocaleString()}`;
  };

  const addPaintingToCart = (
    painting: Painting,
    variant?: ProductVariant,
    quantity = 1,
    openDrawer = true,
    selectedColorFamily?: string
  ) => {
    const selectedVariant = variant || painting.variants[0];
    const itemPrice = Math.max(50, painting.basePrice + selectedVariant.priceDelta);
    const colorSlug = selectedColorFamily ? `-${selectedColorFamily.toLowerCase().replace(/\s+/g, '-')}` : '';
    const cartItemId = `${painting.id}-${selectedVariant.id}${colorSlug}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          painting,
          selectedVariant,
          selectedColorFamily,
          quantity,
          price: itemPrice,
        },
      ];
    });

    const colorDetail = selectedColorFamily ? ` · Color: ${selectedColorFamily}` : '';
    showToast('Painting added to bag', `${painting.name} (${selectedVariant.name}${colorDetail})`);
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const addCustomCommissionToCart = (commission: CustomCommission, openDrawer = true) => {
    const cartItemId = `commission-${commission.id}`;
    const newCartItem: CartItem = {
      id: cartItemId,
      customCommission: commission,
      quantity: 1,
      price: commission.estimatedPrice,
    };

    setCart((prev) => [newCartItem, ...prev]);
    showToast('Custom Portrait added to bag', commission.size);
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const toggleWishlist = (paintingId: string) => {
    setWishlist((prev) => {
      if (prev.includes(paintingId)) {
        showToast('Removed from saved artwork');
        return prev.filter((id) => id !== paintingId);
      } else {
        const painting = paintings.find((p) => p.id === paintingId);
        showToast('Saved to wishlist', painting?.name);
        return [...prev, paintingId];
      }
    });
  };

  const isWishlisted = (paintingId: string) => wishlist.includes(paintingId);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'PAINT10' || clean === 'GIKI10' || clean === 'WELCOME10') {
      setAppliedPromo(clean);
      showToast('10% Promo Applied', 'Discount deducted from total');
      return { success: true, message: '10% discount applied' };
    }
    if (clean === 'GIKI15') {
      setAppliedPromo(clean);
      showToast('15% GIKI Student Discount Applied', 'Custom portrait discount activated');
      return { success: true, message: '15% discount applied' };
    }
    return { success: false, message: 'Invalid promotional code' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const promoDiscountPercent = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo === 'GIKI15') return 0.15;
    return 0.1;
  }, [appliedPromo]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    return Math.round(cartSubtotal * promoDiscountPercent);
  }, [cartSubtotal, promoDiscountPercent]);

  const cartShippingFee = useMemo(() => {
    return 0; // Free delivery across GIKI
  }, []);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount);
  }, [cartSubtotal, cartDiscount]);

  const createOrder = (data: {
    orderId?: string;
    shippingAddress: ShippingAddress;
    shippingMethod: 'eco' | 'express';
    paymentMethod: 'card' | 'apple_pay' | 'cod';
  }): Order => {
    const finalShipping = 0;
    const orderRef = Math.floor(10000 + Math.random() * 90000);
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const estimatedDelivery = '4-5 Days';

    const newOrder: Order = {
      id: data.orderId || `PL-${orderRef}`,
      date: dateStr,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shippingFee: 0,
      total: cartSubtotal - cartDiscount,
      promoCode: appliedPromo || undefined,
      shippingAddress: data.shippingAddress,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      status: 'confirmed',
      estimatedDelivery,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const addPainting = (newPainting: Painting) => {
    setPaintings((prev) => {
      const updated = [newPainting, ...prev];
      savePaintingsToStorage(updated).catch(console.error);
      return updated;
    });
    showToast('Painting Published', `${newPainting.name} has been added to Original Paintings.`);
  };

  const deletePainting = (paintingId: string) => {
    setPaintings((prev) => {
      const updated = prev.filter((p) => p.id !== paintingId);
      savePaintingsToStorage(updated).catch(console.error);
      return updated;
    });
    showToast('Painting Removed', 'The artwork was deleted from your collection.');
  };

  const exportAllPaintings = () => {
    exportPaintingsBackup(paintings);
    showToast('Backup Downloaded', `${paintings.length} paintings exported to JSON.`);
  };

  const copyArtDataToClipboard = async (): Promise<boolean> => {
    const success = await copyPaintingsToClipboard(paintings);
    if (success) {
      showToast('Artwork JSON Copied', 'Paste this directly in chat with the assistant to permanently save it!');
      return true;
    } else {
      showToast('Copy Failed', 'Please use the "Download Backup File (.json)" button instead.');
      return false;
    }
  };

  const syncPaintingsToServer = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paintings),
      });
      if (res.ok) {
        showToast('Saved to Server', `Permanently locked ${paintings.length} artwork(s) to project storage.`);
        return true;
      }
    } catch (e) {
      console.error('Failed to sync to server', e);
    }
    showToast('Saved to Device', `Safely stored ${paintings.length} artwork(s) in IndexedDB.`);
    return false;
  };

  const importPaintingsFile = async (file: File): Promise<boolean> => {
    try {
      const imported = await importPaintingsBackup(file);
      setPaintings(imported);
      await savePaintingsToStorage(imported);
      showToast('Paintings Restored', `Successfully loaded ${imported.length} artworks.`);
      return true;
    } catch (err: any) {
      showToast('Import Failed', err?.message || 'Could not parse the backup file.');
      return false;
    }
  };

  // ---------------------------------------------------------------------
  // Supabase: live form routing
  // ---------------------------------------------------------------------

  // Contact form -> `inquiries`
  const submitContactInquiry = async (name: string, email: string, message: string): Promise<boolean> => {
    const { error } = await supabase.from('inquiries').insert({
      name,
      email,
      message,
      status: 'New',
    });
    if (error) {
      console.error('Supabase inquiries insert failed:', error);
      showToast('Message not sent', 'Something went wrong on our side. Please try again in a moment.');
      return false;
    }
    showToast('Message delivered to the studio', 'Thank you! The artist will reply to your email directly.');
    return true;
  };

  // "Not in GIKI" form -> `not_in_giki`
  const submitNotInGiki = async (data: {
    customerName: string;
    email: string;
    location: string;
    phone: string;
    wishlistItems: string;
    notes: string;
  }): Promise<boolean> => {
    const { error } = await supabase.from('not_in_giki').insert({
      email: data.email,
      location: data.location,
      customer_name: data.customerName,
      phone: data.phone,
      wishlist_items: data.wishlistItems,
      notes: data.notes,
    });
    if (error) {
      console.error('Supabase not_in_giki insert failed:', error);
      showToast('Request not sent', 'Something went wrong on our side. Please try again in a moment.');
      return false;
    }
    showToast('Delivery request received', 'The studio will contact you about delivery to your city.');
    return true;
  };

  // Checkout -> `original_orders` (ready paintings) and `custom_portraits` (commissions).
  // Tracks which tables already saved for an order id so a retry after a partial
  // failure never creates duplicate rows.
  const savedOrderTables = useRef<Set<string>>(new Set());

  const saveOrderToDatabase = async (data: {
    orderId: string;
    customerName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    note: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const paintingRows: Record<string, unknown>[] = [];
    const portraitRows: Record<string, unknown>[] = [];

    // `original_orders` has no phone column, so the phone number rides with the address.
    const addressWithPhone = `${data.deliveryAddress}${data.phone ? ` | Phone: ${data.phone}` : ''}`;

    cart.forEach((item) => {
      if (item.customCommission) {
        const c = item.customCommission;
        const notes = [c.description, data.note ? `Customer note: ${data.note}` : '', data.phone ? `Phone: ${data.phone}` : '']
          .filter(Boolean)
          .join('\n');
        portraitRows.push({
          order_id: data.orderId,
          customer_name: data.customerName,
          email: data.email,
          canvas_size: c.size,
          reference_image_url: c.referencePhotoUrl ?? null,
          special_notes: notes,
          order_status: 'In Queue',
        });
      } else if (item.painting) {
        for (let i = 0; i < Math.max(1, item.quantity); i++) {
          paintingRows.push({
            order_id: data.orderId,
            customer_name: data.customerName,
            email: data.email,
            painting_id: item.painting.id,
            painting_name: item.painting.name,
            canvas_size: item.selectedVariant?.size ?? item.painting.variants[0]?.size ?? null,
            chosen_color: item.selectedColorFamily ?? null,
            delivery_address: addressWithPhone,
            payment_status: 'Pending Cash',
          });
        }
      }
    });

    const jobs: { table: string; rows: Record<string, unknown>[] }[] = [
      { table: 'original_orders', rows: paintingRows },
      { table: 'custom_portraits', rows: portraitRows },
    ];

    for (const { table, rows } of jobs) {
      const key = `${data.orderId}:${table}`;
      if (rows.length === 0 || savedOrderTables.current.has(key)) continue;
      const { error } = await supabase.from(table).insert(rows);
      if (error) {
        console.error(`Supabase ${table} insert failed:`, error);
        return { ok: false, error: error.message };
      }
      savedOrderTables.current.add(key);
    }
    return { ok: true };
  };

  // Customer reviews: loaded from `reviews` for every visitor, on every device.
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const mapReviewRow = (row: any): ProductReview => ({
    id: String(row.id ?? `${row.painting_id}-${row.created_at ?? Math.random()}`),
    author: row.customer_name || 'Paint Labs Collector',
    location: 'Verified Collector',
    rating: Math.min(5, Math.max(1, Number(row.rating) || 5)),
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '',
    comment: row.comment || '',
    paintingId: row.painting_id,
  });

  const loadReviews = async () => {
    // Newest first when the table has the default created_at column; plain select otherwise.
    let { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) {
      ({ data, error } = await supabase.from('reviews').select('*'));
    }
    if (error) {
      console.error('Supabase reviews fetch failed:', error);
    } else {
      setReviews((data ?? []).map(mapReviewRow));
    }
    setReviewsLoading(false);
  };

  useEffect(() => {
    loadReviews();
    // Pick up reviews other collectors posted while this tab stayed open.
    const onFocus = () => {
      loadReviews();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const submitReview = async (data: {
    paintingId: string;
    customerName: string;
    rating: number;
    comment: string;
  }): Promise<boolean> => {
    const { error } = await supabase.from('reviews').insert({
      customer_name: data.customerName,
      rating: data.rating,
      comment: data.comment,
      painting_id: data.paintingId,
    });
    if (error) {
      console.error('Supabase reviews insert failed:', error);
      showToast('Review not posted', 'Something went wrong on our side. Please try again in a moment.');
      return false;
    }
    showToast('Thank you for your review', 'It is now live for other collectors.');
    await loadReviews();
    return true;
  };

  return (
    <ShopContext.Provider
      value={{
        paintings,
        cart,
        wishlist,
        orders,
        isCartOpen,
        setIsCartOpen,
        activePainting,
        setActivePainting,
        highlightSizePrompt,
        setHighlightSizePrompt,
        openPaintingWithSizePrompt,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isCustomCommissionOpen,
        setIsCustomCommissionOpen,
        isSizeChartOpen,
        setIsSizeChartOpen,
        isMediaOpen,
        setIsMediaOpen,
        isNotInGikiOpen,
        setIsNotInGikiOpen,
        isAddPaintingOpen,
        setIsAddPaintingOpen,
        addPainting,
        deletePainting,
        exportAllPaintings,
        copyArtDataToClipboard,
        syncPaintingsToServer,
        importPaintingsFile,
        currency,
        currencySymbol,
        formatPrice,
        addPaintingToCart,
        addCustomCommissionToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        appliedPromo,
        promoDiscountPercent,
        applyPromoCode,
        removePromoCode,
        cartSubtotal,
        cartDiscount,
        cartShippingFee,
        cartTotal,
        cartItemCount,
        createOrder,
        lastPlacedOrder,
        submitContactInquiry,
        submitNotInGiki,
        saveOrderToDatabase,
        reviews,
        reviewsLoading,
        submitReview,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
};
