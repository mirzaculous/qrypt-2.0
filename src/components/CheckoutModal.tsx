/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Event, TicketTier, PromoCode } from '../types.ts';
import { MOCK_PROMO_CODES } from '../mockData.ts';
import { Shield, Sparkles, X, Check, CreditCard, Landmark, PhoneCall, Gift, Tag, ArrowRight, Loader } from 'lucide-react';

interface CheckoutModalProps {
  event: Event;
  tier: TicketTier;
  quantity: number;
  onClose: () => void;
  onPaymentSuccess: (promoCodeUsed?: string, finalTotal?: number) => void;
}

export default function CheckoutModal({ event, tier, quantity, onClose, onPaymentSuccess }: CheckoutModalProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'EASYPAYSA' | 'JAZZCASH' | 'BANK_TRANSFER'>('STRIPE');
  
  // Wallet info simulation states
  const [walletPhone, setWalletPhone] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');

  // Referral codes tracking
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralApplied, setReferralApplied] = useState<boolean>(false);

  // Pricing math
  const subtotal = tier.price * quantity;
  const tax = subtotal * 0.05; // 5% digit services tax
  
  // Promo markdown logic
  const discount = appliedPromo 
    ? (appliedPromo.discountType === 'PERCENTAGE' 
        ? (subtotal * appliedPromo.discountValue) / 100 
        : appliedPromo.discountValue)
    : 0;

  const referralDiscount = referralApplied ? 200 : 0; // Fixed direct Rs. 200 discount for using a friend code!
  const finalTotal = Math.max(0, subtotal + tax - discount - referralDiscount);

  const handleApplyPromo = () => {
    setPromoError('');
    const found = MOCK_PROMO_CODES.find(p => p.code.toUpperCase() === promoCode.trim().toUpperCase());
    
    if (!found) {
      setPromoError('Coupon code is invalid or has expired.');
      setAppliedPromo(null);
      return;
    }
    
    if (!found.isActive) {
      setPromoError('This coupon is no longer active.');
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
  };

  const handleApplyReferral = () => {
    if (referralCode.trim().length >= 4) {
      setReferralApplied(true);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Dynamic processing steps for authenticity
    if (paymentMethod === 'STRIPE') {
      setProcessingStep('Connecting to Stripe Secure Gateway...');
      setTimeout(() => {
        setProcessingStep('Authorizing credit card transaction with bank...');
        setTimeout(() => {
          setProcessingStep('Generating cryptographic QR tickets...');
          setTimeout(() => {
            onPaymentSuccess(appliedPromo?.code, finalTotal);
          }, 800);
        }, 1000);
      }, 1000);
    } else if (paymentMethod === 'EASYPAYSA' || paymentMethod === 'JAZZCASH') {
      setProcessingStep(`Sending push prompt to ${walletPhone}...`);
      setTimeout(() => {
        setProcessingStep('Awaiting user confirmation PIN inside secure wallet App...');
        setTimeout(() => {
          setProcessingStep('Wallet validation authorized! Issuing passes...');
          setTimeout(() => {
            onPaymentSuccess(appliedPromo?.code, finalTotal);
          }, 1200);
        }, 1500);
      }, 1200);
    } else {
      // Bank Transfer simulated
      setProcessingStep('Validating online transaction receipt...');
      setTimeout(() => {
        onPaymentSuccess(appliedPromo?.code, finalTotal);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto relative">
      <div className="bg-[#0c0d15] rounded-[32px] w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="bg-[#131524] p-6 flex items-center justify-between shrink-0 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold font-display uppercase tracking-tight text-white">Secure Billing Checkout</h3>
            <p className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">128-bit Solid Cryptographic Shell Gateway • Invoice #{Math.floor(Math.random() * 900000 + 100000)}</p>
          </div>
          <button 
            disabled={isProcessing}
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic loader blocking UI during simulation */}
        {isProcessing ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-5 flex-1 select-none">
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 animate-spin">
              <Loader className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="font-extrabold text-white font-display uppercase tracking-wide">Qrypt Security Escalation</h4>
              <p className="text-xs text-slate-400 font-mono animate-pulse uppercase tracking-wider">{processingStep}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Split layout: Details & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column 1: Order Recap & Coupons */}
              <div className="space-y-4">
                <div className="bg-[#131524] rounded-2xl p-5 border border-white/5 space-y-3.5">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">ORDER SUMMARY</span>
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1 font-display">{event.title}</h4>
                    <span className="text-xs text-slate-400 font-mono font-semibold">{tier.name} Tier • Quantity: {quantity}x</span>
                  </div>
                  
                  <div className="border-t border-white/5 pt-3.5 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-550">Subtotal</span>
                      <span className="font-semibold text-slate-300">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550">Digital Tax (5%)</span>
                      <span className="font-semibold text-slate-300">Rs. {tax.toLocaleString()}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-450 font-bold bg-emerald-500/10 px-2 py-1.5 rounded-xl border border-emerald-500/20">
                        <span>Coupon [{appliedPromo.code}]</span>
                        <span>- Rs. {discount.toLocaleString()}</span>
                      </div>
                    )}

                    {referralApplied && (
                      <div className="flex justify-between text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1.5 rounded-xl border border-indigo-500/20">
                        <span>Friend Code</span>
                        <span>- Rs. {referralDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm pt-3 border-t border-white/5 font-sans">
                      <span className="font-bold text-white font-display uppercase tracking-wider">Total Charge</span>
                      <span className="font-mono font-extrabold text-blue-400">Rs. {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code Fields */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Event Promo Coupon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. KARACHI10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full bg-black/45 border border-white/10 rounded-xl py-2.5 px-3 text-xs uppercase text-white focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-400 font-semibold font-mono">{promoError}</p>}
                  {!appliedPromo && !promoError && (
                    <p className="text-[9px] text-slate-500 italic uppercase tracking-wider">Try <strong className="text-slate-300 font-bold">KARACHI10</strong> or <strong className="text-slate-300 font-bold">EATFEST</strong> as a tests coupon</p>
                  )}
                  {appliedPromo && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 font-mono uppercase">
                      ✓ Coupon {appliedPromo.code} locked active!
                    </span>
                  )}
                </div>

                {/* Friend Referral Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-455 uppercase tracking-widest block">Friend Referral Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ASIMREF"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full bg-black/45 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white uppercase focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-400/25 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {referralApplied && (
                    <span className="text-[10px] text-indigo-400 font-bold font-mono">
                      ✓ Friend referenced! Rs. 200 credited.
                    </span>
                  )}
                </div>
              </div>

              {/* Column 2: Payment Selector and Core details */}
              <div className="space-y-5">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">PAYMENT METHOD</span>
                
                {/* Icons selection grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('STRIPE')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'STRIPE'
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-sm'
                        : 'border-white/5 bg-[#131524] text-slate-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-450" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Stripe / Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('EASYPAYSA')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'EASYPAYSA'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                        : 'border-white/5 bg-[#131524] text-slate-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-450" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Easypaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('JAZZCASH')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'JAZZCASH'
                        ? 'border-orange-500 bg-orange-500/10 text-white shadow-sm'
                        : 'border-white/5 bg-[#131524] text-slate-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="w-4 h-4 text-orange-450 font-bold text-xs font-mono select-none">JC</span>
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-slate-400 bg-white/10 text-white shadow-sm'
                        : 'border-white/5 bg-[#131524] text-slate-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Bank Wire</span>
                  </button>
                </div>

                {/* Form parameters dependent on choice */}
                {paymentMethod === 'STRIPE' && (
                  <div className="space-y-3 bg-[#131524] p-4.5 rounded-2xl border border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest block">CREDIT CARD NUMBER</label>
                      <input
                        type="text"
                        placeholder="••••  ••••  ••••  4242"
                        defaultValue="4242 4242 4242 4242"
                        className="w-full bg-black/45 border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest block">EXPIRY (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          defaultValue="12/28"
                          className="w-full bg-black/45 border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest block">CVC</label>
                        <input
                          type="text"
                          placeholder="***"
                          defaultValue="424"
                          className="w-full bg-black/45 border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === 'EASYPAYSA' || paymentMethod === 'JAZZCASH') && (
                  <div className="space-y-3.5 bg-[#131524] p-4.5 rounded-2xl border border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-semibold text-slate-500 block uppercase tracking-widest leading-none">
                        {paymentMethod} MOBILENO
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 03001234567"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-mono text-white focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <span className="text-[9px] text-slate-500 block leading-tight font-sans">
                        Instant push notification request will alert your device. Open wallet program context PIN prompt.
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="space-y-3 bg-[#131524] p-4.5 rounded-2xl border border-white/5 text-[11px] leading-relaxed">
                    <span className="font-bold text-white font-display block uppercase tracking-tight text-[11px]">Qrypt Escrow Core Account Details</span>
                    <div className="font-mono text-slate-400 bg-black/35 p-3 rounded-xl border border-white/5 space-y-1">
                      <div>Bank: <strong className="text-white">Meezan Bank Ltd</strong></div>
                      <div>Title: <strong className="text-white font-sans">Qrypt Technologies (Pvt) Ltd</strong></div>
                      <div>IBAN: <strong className="text-blue-405 select-all">PK02MEZN0123456789012345</strong></div>
                    </div>
                    <p className="text-[9px] text-slate-500 block uppercase tracking-wide">
                      Wire exact checkout parameters. Verified in 5 minutes.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom secure action buttons */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mr-auto font-mono uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-450 shrink-0" />
                <span>Device Binding Signature active</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto self-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-transparent hover:bg-white/5 text-slate-300 py-2.5 px-5 rounded-full text-xs font-bold cursor-pointer border border-white/10 transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-7 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-blue-500/10 transition-all uppercase tracking-wider font-display font-semibold"
                >
                  <span>Authorize Gatepass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
