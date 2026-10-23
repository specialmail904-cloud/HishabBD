import React from 'react';
import { Truck, CreditCard, Banknote, CheckCircle, AlertCircle, ShieldCheck, Tag } from 'lucide-react';
import { DeliveryPreset, PaymentMethod, CalculationResult } from '../types';
import { formatBDT } from '../utils/calculator';

interface DeliveryAndPaymentProps {
  deliveryPreset: DeliveryPreset;
  deliveryCharge: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  advancePaid: number;
  advancePaymentMethod: PaymentMethod;
  advanceTrxId: string;
  notes: string;
  calculations: CalculationResult;
  onDeliveryChange: (preset: DeliveryPreset, charge: number) => void;
  onDiscountChange: (type: 'fixed' | 'percentage', value: number) => void;
  onAdvanceChange: (advance: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onTrxIdChange: (trxId: string) => void;
  onNotesChange: (notes: string) => void;
}

export const DeliveryAndPayment: React.FC<DeliveryAndPaymentProps> = ({
  deliveryPreset,
  deliveryCharge,
  discountType,
  discountValue,
  advancePaid,
  advancePaymentMethod,
  advanceTrxId,
  notes,
  calculations,
  onDeliveryChange,
  onDiscountChange,
  onAdvanceChange,
  onPaymentMethodChange,
  onTrxIdChange,
  onNotesChange,
}) => {
  const deliveryOptions: { id: DeliveryPreset; label: string; amount: number; hint: string }[] = [
    { id: 'inside_dhaka', label: 'Inside Dhaka', amount: 70, hint: 'ঢাকার ভিতরে' },
    { id: 'sub_dhaka', label: 'Sub-Dhaka', amount: 100, hint: 'সাভার, গাজীপুর, কেরানীগঞ্জ' },
    { id: 'outside_dhaka', label: 'Outside Dhaka', amount: 130, hint: 'ঢাকার বাইরে (সারা দেশ)' },
  ];

  const paymentMethods: { id: PaymentMethod; name: string; color: string; badge: string }[] = [
    { id: 'bKash', name: 'bKash', color: 'bg-[#e2136e] text-white hover:bg-[#c10f5d]', badge: 'বিকাশ' },
    { id: 'Nagad', name: 'Nagad', color: 'bg-[#f7941d] text-white hover:bg-[#e08112]', badge: 'নগদ' },
    { id: 'Cash', name: 'Cash', color: 'bg-emerald-600 text-white hover:bg-emerald-700', badge: 'ক্যাশ' },
    { id: 'Rocket', name: 'Rocket', color: 'bg-[#8c3494] text-white hover:bg-[#77287e]', badge: 'রকেট' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Delivery & Payment (COD) Logic</h2>
            <p className="text-xs text-slate-500">ডেলিভারি চার্জ ও অগ্রিম পেমেন্ট হিসাব করুন</p>
          </div>
        </div>
      </div>

      {/* Part A: Delivery Charge Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Delivery Zone & Charge (ডেলিভারি চার্জ) *</span>
          </label>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            {formatBDT(deliveryCharge)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {deliveryOptions.map((opt) => {
            const isSelected = deliveryPreset === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDeliveryChange(opt.id, opt.amount)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {opt.label}
                  </span>
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-600'}`}>
                    ৳{opt.amount}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{opt.hint}</p>
              </button>
            );
          })}

          {/* Custom option */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              deliveryPreset === 'custom'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800">Custom</span>
              <button
                type="button"
                onClick={() => onDeliveryChange('custom', deliveryCharge || 0)}
                className="text-[10px] text-emerald-600 hover:underline"
              >
                Select
              </button>
            </div>
            <div className="relative mt-1">
              <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">৳</span>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onDeliveryChange('custom', isNaN(val) ? 0 : Math.max(0, val));
                }}
                onFocus={() => {
                  if (deliveryPreset !== 'custom') {
                    onDeliveryChange('custom', deliveryCharge);
                  }
                }}
                placeholder="0"
                className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Part B: Discount (বিশেষ ছাড়) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>DISCOUNT (ডিসকাউন্ট / ছাড়)</span>
          </label>
          {calculations.discountAmount > 0 && (
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              - {formatBDT(calculations.discountAmount)} {discountType === 'percentage' ? `(${discountValue}%)` : ''}
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Discount Value Input */}
            <div className="sm:col-span-7 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                  {discountType === 'fixed' ? '৳' : '%'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={discountValue === 0 ? '' : discountValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onDiscountChange(discountType, isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Toggle for Fixed (৳) vs Percentage (%) */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => onDiscountChange('fixed', discountValue)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    discountType === 'fixed'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ৳ Fixed
                </button>
                <button
                  type="button"
                  onClick={() => onDiscountChange('percentage', discountValue)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    discountType === 'percentage'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  % Percentage
                </button>
              </div>
            </div>

            {/* Quick Chips: ৳0, ৳50, ৳100, ৳200, 5%, 10% */}
            <div className="sm:col-span-5 flex items-center gap-1.5 flex-wrap sm:justify-end">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
              <button
                type="button"
                onClick={() => onDiscountChange('fixed', 0)}
                className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                  discountValue === 0
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                ৳0
              </button>
              {[50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onDiscountChange('fixed', amt)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-mono font-medium transition-colors ${
                    discountType === 'fixed' && discountValue === amt
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
              {[5, 10].map((pct) => (
                <button
                  key={`pct-${pct}`}
                  type="button"
                  onClick={() => onDiscountChange('percentage', pct)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-mono font-medium transition-colors ${
                    discountType === 'percentage' && discountValue === pct
                      ? 'bg-indigo-700 text-white border-indigo-700'
                      : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border-indigo-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Part C: Advance Payment Field & Methods */}
      <div className="pt-2 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Advance Paid (অগ্রিম পরিশোধ)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
          {/* Advance Amount Input */}
          <div className="sm:col-span-5">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">৳</span>
              <input
                type="number"
                min="0"
                value={advancePaid === 0 ? '' : advancePaid}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onAdvanceChange(isNaN(val) ? 0 : Math.max(0, val));
                }}
                placeholder="0 (যদি অগ্রিম দেওয়া থাকে)"
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Quick Advance Presets */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">Quick:</span>
              <button
                type="button"
                onClick={() => onAdvanceChange(0)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  advancePaid === 0
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                ৳0 (Full COD)
              </button>
              {deliveryCharge > 0 && (
                <button
                  type="button"
                  onClick={() => onAdvanceChange(deliveryCharge)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    advancePaid === deliveryCharge
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                  }`}
                >
                  ৳{deliveryCharge} (Delivery Only)
                </button>
              )}
              {[100, 150, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onAdvanceChange(amt)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    advancePaid === amt
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
              {calculations.totalWithDelivery > 0 && (
                <button
                  type="button"
                  onClick={() => onAdvanceChange(calculations.totalWithDelivery)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    advancePaid === calculations.totalWithDelivery
                      ? 'bg-indigo-700 text-white border-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                  }`}
                >
                  Full ৳{calculations.totalWithDelivery}
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="sm:col-span-7">
            <span className="text-[11px] font-medium text-slate-500 mb-1.5 block">
              Payment Method (পেমেন্টের মাধ্যম):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {paymentMethods.map((pm) => {
                const isSelected = advancePaymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => onPaymentMethodChange(pm.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? `${pm.color} shadow-xs ring-2 ring-offset-1 ring-slate-400`
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{pm.name}</span>
                    <span className="text-[10px] opacity-80">({pm.badge})</span>
                  </button>
                );
              })}
            </div>

            {/* Optional TrxID */}
            <div className="mt-2">
              <input
                type="text"
                value={advanceTrxId}
                onChange={(e) => onTrxIdChange(e.target.value)}
                placeholder="Transaction ID / TrxID (ঐচ্ছিক)"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Part D: Optional Seller Notes / Delivery Instructions */}
      <div className="pt-2 border-t border-slate-100">
        <label htmlFor="seller-notes-field" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Special Delivery Instructions (ডেলিভারি নোট)
        </label>
        <input
          id="seller-notes-field"
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. Call before delivery / Please handle fragile parcel with care"
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Part E: Real-time Live Calculation Strip */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center sm:text-left items-center">
          {/* Subtotal */}
          <div className="border-r border-slate-700/60 pr-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Subtotal</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-slate-100">
              {formatBDT(calculations.subtotal)}
            </span>
          </div>

          {/* Discount */}
          <div className="border-r border-slate-700/60 pr-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">- Discount</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-emerald-400">
              {calculations.discountAmount > 0 ? `- ${formatBDT(calculations.discountAmount)}` : '৳ 0'}
            </span>
          </div>

          {/* Delivery */}
          <div className="border-r border-slate-700/60 pr-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">+ Delivery</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-teal-400">
              {formatBDT(calculations.deliveryCharge)}
            </span>
          </div>

          {/* Advance */}
          <div className="border-r border-slate-700/60 pr-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">- Advance</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-amber-400">
              {formatBDT(calculations.advancePaid)}
            </span>
          </div>

          {/* Net COD */}
          <div className="col-span-2 sm:col-span-1 bg-white/10 rounded-lg p-2 flex flex-col justify-center">
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block">
              = COD Due (বাকি)
            </span>
            <span className="text-base sm:text-lg font-black font-mono tabular-nums text-white">
              {formatBDT(calculations.codPayable)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
