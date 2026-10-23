import React, { useState, useRef } from 'react';
import { X, Upload, Store, Phone, Globe, MapPin, Check, Image as ImageIcon, Trash2 } from 'lucide-react';
import { ShopProfile } from '../types';

interface ShopSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopProfile;
  onSave: (updated: ShopProfile) => void;
}

export const ShopSetupModal: React.FC<ShopSetupModalProps> = ({
  isOpen,
  onClose,
  shop,
  onSave,
}) => {
  const [formData, setFormData] = useState<ShopProfile>(shop);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please upload an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Shop Setup</h2>
              <p className="text-xs text-slate-500">Saved in browser storage for all your invoices</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Logo Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Shop Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden group">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Shop Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">No Logo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="shop-logo-upload"
                />
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="shop-logo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Recommended: Square PNG/JPG (Max 2MB). Fits on receipt header.
                </p>
              </div>
            </div>
          </div>

          {/* Shop Name */}
          <div>
            <label htmlFor="shop-name-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop / Facebook Page Name *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="shop-name-input"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aura Elegance BD"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Shop Phone Number */}
          <div>
            <label htmlFor="shop-phone-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact / Helpline Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="shop-phone-input"
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 01712-345678"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Facebook Page Link / Handle */}
          <div>
            <label htmlFor="shop-fb-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Facebook Page Link (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="shop-fb-input"
                type="text"
                value={formData.facebookPage || ''}
                onChange={(e) => setFormData({ ...formData, facebookPage: e.target.value })}
                placeholder="e.g. facebook.com/AuraEleganceBD"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Shop Physical Address */}
          <div>
            <label htmlFor="shop-address-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop Location / Office (Optional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="shop-address-input"
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Dhanmondi, Dhaka"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Note */}
          <div>
            <label htmlFor="shop-footer-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Receipt Footer Note
            </label>
            <textarea
              id="shop-footer-input"
              rows={2}
              value={formData.invoiceFooterNote || ''}
              onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
              placeholder="e.g. Please check items while receiving from rider. No return after rider leaves."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save Shop Info</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
