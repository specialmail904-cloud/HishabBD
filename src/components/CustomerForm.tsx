import React from 'react';
import { User, Phone, MapPin, Truck, Calendar, Hash, CheckCircle2 } from 'lucide-react';
import { OrderDetails, CourierType } from '../types';
import { COURIER_OPTIONS, POPULAR_DISTRICTS } from '../data/sampleData';
import { validateBDPhone } from '../utils/calculator';

interface CustomerFormProps {
  order: OrderDetails;
  onChange: (updated: Partial<OrderDetails>) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ order, onChange }) => {
  const phoneValidation = validateBDPhone(order.customerPhone);

  const handleDistrictClick = (district: string) => {
    if (!order.customerAddress.includes(district)) {
      const newAddress = order.customerAddress.trim()
        ? `${order.customerAddress.trim()}, ${district}`
        : district;
      onChange({ customerAddress: newAddress });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Customer & Delivery Info</h2>
            <p className="text-xs text-slate-500">গ্রাহকের নাম, মোবাইল নম্বর এবং কুরিয়ার নির্বাচন করুন</p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap border border-slate-200">
            {order.invoiceNumber}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Name */}
        <div>
          <label htmlFor="customer-name-field" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Customer Name (গ্রাহকের নাম) *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="customer-name-field"
              type="text"
              required
              value={order.customerName}
              onChange={(e) => onChange({ customerName: e.target.value })}
              placeholder="e.g. Tanvir Hossain"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Customer Phone */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="customer-phone-field" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Customer Mobile (ফোন নম্বর) *
            </label>
            {phoneValidation.operator && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                {phoneValidation.operator}
              </span>
            )}
          </div>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="customer-phone-field"
              type="tel"
              required
              value={order.customerPhone}
              onChange={(e) => onChange({ customerPhone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className={`w-full pl-9 pr-8 py-2 text-sm bg-slate-50/50 hover:bg-white focus:bg-white border rounded-xl focus:outline-none focus:ring-2 font-mono transition-colors ${
                order.customerPhone && !phoneValidation.isValid
                  ? 'border-amber-300 focus:ring-amber-500'
                  : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {phoneValidation.isValid && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
            )}
          </div>
        </div>

        {/* Full Delivery Address */}
        <div className="md:col-span-2">
          <label htmlFor="customer-address-field" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Delivery Address (সম্পূর্ণ ঠিকানা) *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <textarea
              id="customer-address-field"
              rows={2}
              required
              value={order.customerAddress}
              onChange={(e) => onChange({ customerAddress: e.target.value })}
              placeholder="House #, Road #, Area/Thana, District (e.g. House 14, Road 5, Block B, Mirpur-10, Dhaka)"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Quick District selector */}
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Add:</span>
            {POPULAR_DISTRICTS.map((district) => (
              <button
                key={district}
                type="button"
                onClick={() => handleDistrictClick(district)}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent rounded-md transition-colors"
              >
                +{district}
              </button>
            ))}
          </div>
        </div>

        {/* Courier Selection Dropdown */}
        <div>
          <label htmlFor="courier-select-field" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Courier Service (কুরিয়ার পার্টনার) *
          </label>
          <div className="relative">
            <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="courier-select-field"
              value={order.courier}
              onChange={(e) => onChange({ courier: e.target.value as CourierType })}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none font-medium text-slate-800 cursor-pointer"
            >
              {COURIER_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tag})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        {/* Invoice Date & Time */}
        <div>
          <label htmlFor="order-date-field" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Invoice Date (তারিখ ও সময়)
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="order-date-field"
              type="text"
              value={order.createdAt}
              onChange={(e) => onChange({ createdAt: e.target.value })}
              placeholder="e.g. 22 Oct 2026, 04:30 PM"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
