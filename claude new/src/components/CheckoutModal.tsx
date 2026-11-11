import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';
import { getColorFamilyOptionByName } from '../utils/colorFamily';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Printer,
  Banknote,
  Palette,
  AlertCircle,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    formatPrice,
    createOrder,
    saveOrderToDatabase,
  } = useShop();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa'>('cod');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Kept across retries so a failed attempt never creates a second order number.
  const pendingOrderId = useRef<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalWrapperRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when confirmed order thank-you screen appears or modal opens
  useEffect(() => {
    if (confirmedOrder) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (modalWrapperRef.current) {
        modalWrapperRef.current.scrollTop = 0;
      }
    }
  }, [confirmedOrder]);

  useEffect(() => {
    if (isCheckoutOpen) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (modalWrapperRef.current) {
        modalWrapperRef.current.scrollTop = 0;
      }
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Validation: all fields are mandatory, except customNote which is optional
  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    address.trim().length > 0 &&
    paymentMethod === 'cod' &&
    agreedToTerms === true;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    if (!pendingOrderId.current) {
      pendingOrderId.current = `PL-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    const orderId = pendingOrderId.current;
    const customerName = `${firstName} ${lastName}`.trim();

    // Saved straight to Supabase: ready paintings -> `original_orders`,
    // custom portrait commissions -> `custom_portraits`.
    const result = await saveOrderToDatabase({
      orderId,
      customerName,
      email: email.trim(),
      phone: phone.trim(),
      deliveryAddress: address.trim(),
      note: customNote.trim(),
    });

    if (!result.ok) {
      setSubmitError('We could not place your order just now. Nothing has been charged, and your bag is safe. Please try again.');
      setIsSubmitting(false);
      return;
    }

    const order = createOrder({
      orderId,
      shippingAddress: {
        fullName: customerName,
        email: email.trim(),
        phone: phone.trim(),
        addressLine1: address.trim(),
        addressLine2: customNote.trim() ? `Note: ${customNote.trim()}` : '',
        city: 'GIKI Campus, Topi',
        postalCode: '23640',
        country: 'Pakistan',
      },
      shippingMethod: 'eco',
      paymentMethod: 'cod',
    });

    pendingOrderId.current = null;
    setConfirmedOrder(order);
    setIsSubmitting(false);

    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    if (modalWrapperRef.current) modalWrapperRef.current.scrollTop = 0;

    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#191918', '#C5A059', '#b91c1c', '#0284c7'],
      });
    } catch {}
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
  };

  return (
    <div ref={modalWrapperRef} className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Main Modal Window */}
      <div className="relative w-full max-w-5xl bg-[#FBFBFA] rounded-2xl shadow-2xl border border-[#EAE8E3] overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E3] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-editorial text-sm">
              PL
            </div>
            <div>
              <h2 className="font-editorial text-lg text-[#191918] leading-tight">
                Paint Labs Studio Checkout
              </h2>
              <p className="text-[11px] text-stone-500">
                Single-page GIKI campus delivery dispatch
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-black rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {confirmedOrder ? (
            /* Order Confirmation View */
            <div className="p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-3">
                <h3 className="font-editorial text-2xl sm:text-3xl text-stone-900 font-normal">
                  Thank You, Your Art Order is Confirmed
                </h3>
              </div>

              {/* Order summary box */}
              <div className="bg-[#F7F5EE] border border-[#E9E5DC] rounded-xl p-5 sm:p-6 text-left text-xs space-y-4">
                <div className="flex justify-between items-center border-b border-stone-200 pb-2.5">
                  <span className="font-semibold text-stone-900 text-sm">GIKI Campus Handover</span>
                  <span className="text-stone-700 font-medium text-xs">
                    Est. Delivery: 4-5 Days
                  </span>
                </div>

                <div className="space-y-1 text-stone-600">
                  <p className="font-medium text-stone-900 text-sm">
                    {confirmedOrder.shippingAddress.fullName}
                  </p>
                  <p className="text-stone-700">
                    {confirmedOrder.shippingAddress.addressLine1}
                  </p>
                  {customNote.trim() && (
                    <p className="text-stone-500 italic">
                      Note: {customNote.trim()}
                    </p>
                  )}
                  <p>Contact: {confirmedOrder.shippingAddress.phone}</p>
                  <p>Payment: <span className="font-semibold text-stone-900">Cash on Delivery (COD)</span></p>
                </div>

                {/* Items preview */}
                <div className="border-t border-stone-200 pt-3 space-y-2">
                  <span className="font-semibold text-stone-900 block text-xs uppercase tracking-wider">
                    Artworks in this parcel
                  </span>
                  {confirmedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-stone-700">
                      <div>
                        {it.customCommission ? (
                          <span className="font-medium">
                            1× Custom Portrait Commission ({it.customCommission.size} · {it.customCommission.frame})
                          </span>
                        ) : (
                          <span>
                            {it.quantity}× {it.painting?.name} ({it.selectedVariant?.name}
                            {it.selectedColorFamily ? ` · Color: ${it.selectedColorFamily}` : ''})
                          </span>
                        )}
                      </div>
                      <span className="tabular-nums font-semibold">
                        {formatPrice(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-stone-200 font-semibold text-stone-900 text-base">
                    <span>Total Amount (COD)</span>
                    <span className="tabular-nums">{formatPrice(confirmedOrder.subtotal)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#191918] hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
                >
                  Back to Studio
                </button>
              </div>
            </div>
          ) : (
            /* Split 2-Column Full-Page Form */
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-2">
              {/* ================= LEFT SIDE ================= */}
              <div className="p-6 sm:p-8 space-y-4 lg:border-r border-[#EAE8E3]">
                {/* Heading and green badge */}
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-editorial text-xl text-[#191918]">
                      Shipping & Payment Details
                    </h3>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-md">
                      We're only delivering inside GIKI
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Please provide your delivery info to confirm canvas handover.
                  </p>
                </div>

                {/* Row 1: First Name | Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmed"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Khan"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Row 2: Email Address | Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@giki.edu.pk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+92 300 0000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Row 3: Address (a big box for that) */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter full delivery location inside GIKI (e.g. Hostel #, Room #, Faculty Dept, etc.)..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 resize-none"
                  />
                </div>

                {/* Row 3b: Custom Note(Optional) - same size box */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Custom Note(Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Special delivery instructions, preferred handover timing, or custom notes (optional)..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 resize-none"
                  />
                </div>

                {/* Row 4: Payment Heading */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800">
                    Payment Method <span className="text-rose-500">*</span>
                  </label>
                </div>

                {/* Row 5: 3 boxes: COD, JazzCash, Easypaisa */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* COD (active, selectable) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/20'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[#C5A059]" />
                    <span className="text-xs font-semibold leading-tight">COD</span>
                    <span className={`text-[10px] leading-none ${paymentMethod === 'cod' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Cash on Delivery
                    </span>
                  </button>

                  {/* JazzCash (grey logo, unclickable showpiece, no coming soon) */}
                  <div
                    aria-disabled="true"
                    className="p-2.5 rounded-xl border border-stone-300 bg-stone-100/90 text-stone-400 text-center flex flex-col items-center justify-center gap-1 cursor-not-allowed select-none opacity-60"
                  >
                    <img
                      src="/assets/aistudio/jazz_bdeff188.png"
                      alt="JazzCash logo"
                      className="h-8 w-auto object-contain grayscale opacity-60 mix-blend-multiply"
                    />
                    <span className="text-[11px] font-semibold text-stone-400 leading-tight">JazzCash</span>
                  </div>

                  {/* Easypaisa (grey logo, unclickable showpiece, no coming soon) */}
                  <div
                    aria-disabled="true"
                    className="p-2.5 rounded-xl border border-stone-300 bg-stone-100/90 text-stone-400 text-center flex flex-col items-center justify-center gap-1 cursor-not-allowed select-none opacity-60"
                  >
                    <img
                      src="/assets/aistudio/images__3__b90e874d.jpg"
                      alt="Easypaisa logo"
                      className="h-8 w-8 object-contain rounded-full grayscale opacity-60 mix-blend-multiply"
                    />
                    <span className="text-[11px] font-semibold text-stone-400 leading-tight">Easypaisa</span>
                  </div>
                </div>

                {/* Row 6: Agreement Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 cursor-pointer select-none transition-colors hover:bg-amber-50">
                    <input
                      type="checkbox"
                      required
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                    />
                    <span className="text-xs text-amber-950 leading-relaxed">
                      I agree that once I ordered , the parcel cant be returned or cancelled
                    </span>
                  </label>
                </div>

                {/* Row 7: Order Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-3.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isFormValid && !isSubmitting
                        ? 'bg-[#191918] hover:bg-stone-800 text-white cursor-pointer active:scale-[0.99]'
                        : 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
                    }`}
                  >
                    <span>
                      {isSubmitting
                        ? 'Processing Art Order...'
                        : `Place Order · ${formatPrice(cartSubtotal)}`}
                    </span>
                  </button>

                  {submitError && (
                    <p className="text-xs text-red-600 text-center mt-2 flex items-center justify-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{submitError}</span>
                    </p>
                  )}

                  {!isFormValid && (
                    <p className="text-[11px] text-stone-400 text-center mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      Please fill all fields, select payment method, and accept return terms to enable order.
                    </p>
                  )}
                </div>
              </div>

              {/* ================= RIGHT SIDE ================= */}
              <div className="p-6 sm:p-8 bg-[#F8F7F3] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-[#EAE8E3] pb-3">
                    <h3 className="font-editorial text-xl text-[#191918]">
                      Your Art Items ({cart.reduce((s, it) => s + it.quantity, 0)})
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">Studio Order</span>
                  </div>

                  {/* Items List */}
                  <div className="mt-4 divide-y divide-stone-200/80 max-h-[380px] overflow-y-auto pr-1">
                    {cart.length === 0 ? (
                      <p className="text-xs text-stone-400 py-6 text-center">
                        Your studio bag is currently empty.
                      </p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0">
                          {/* Image Thumbnail */}
                          <div className="w-14 h-14 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-stone-300/70 shadow-2xs">
                            {item.customCommission ? (
                              item.customCommission.referencePhotoUrl ? (
                                <img
                                  src={item.customCommission.referencePhotoUrl}
                                  alt="Custom commission"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                                  <Palette className="w-5 h-5 text-[#C5A059]" />
                                </div>
                              )
                            ) : (
                              <img
                                src={item.painting?.image}
                                alt={item.painting?.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-stone-900 truncate">
                              {item.customCommission
                                ? 'Custom Portrait Commission'
                                : item.painting?.name}
                            </h4>
                            <div className="text-[11px] text-stone-500">
                              {item.customCommission ? (
                                <p className="truncate">{item.customCommission.size} · {item.customCommission.frame}</p>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className="truncate">Size: {item.selectedVariant?.name || 'Stretched Canvas'}</p>
                                  {item.selectedColorFamily && (() => {
                                    const colorOpt = getColorFamilyOptionByName(item.selectedColorFamily);
                                    return (
                                      <p className="inline-flex items-center gap-1 font-semibold text-stone-800 bg-stone-200/70 px-1.5 py-0.5 rounded text-[10px]">
                                        {colorOpt && (
                                          <span className={`w-2 h-2 rounded-full ${colorOpt.badgeBg} ${colorOpt.border || ''}`} />
                                        )}
                                        <span>Color: {item.selectedColorFamily}</span>
                                      </p>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-600 font-medium">
                              Qty: {item.quantity}
                            </span>
                          </div>

                          {/* Item Price */}
                          <div className="text-right shrink-0">
                            <span className="text-xs font-semibold text-stone-900 tabular-nums">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="pt-4 border-t border-[#EAE8E3] space-y-3">
                  <div className="flex justify-between items-center text-xs text-stone-600">
                    <span>Subtotal Cost</span>
                    <span className="font-medium text-stone-900 tabular-nums">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span>Delivery Cost</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded font-medium">
                        GIKI Campus
                      </span>
                    </span>
                    <span className="font-semibold text-emerald-700 uppercase tracking-wide text-xs">
                      Free
                    </span>
                  </div>

                  <div className="pt-3 border-t border-stone-300 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs text-stone-500 block uppercase tracking-wider font-semibold">
                        Total Cost
                      </span>
                      <span className="text-[10px] text-stone-400">
                        GIKI campus hand-delivery included
                      </span>
                    </div>
                    <span className="font-editorial text-2xl text-stone-900 font-semibold tabular-nums">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};