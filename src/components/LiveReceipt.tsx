import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Download,
  Copy,
  Printer,
  Check,
  Share2,
  Store,
  Phone,
  MapPin,
  Truck,
  Calendar,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Package,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { ShopProfile, OrderDetails, CalculationResult } from '../types';
import {
  formatBDT,
  toBanglaDigits,
  generateOrderSummaryText,
  copyToClipboard,
  sanitizeClonedElementForHtml2Canvas,
  validateBDPhone,
} from '../utils/calculator';
import { COURIER_OPTIONS } from '../data/sampleData';

interface LiveReceiptProps {
  shop: ShopProfile;
  order: OrderDetails;
  calculations: CalculationResult;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  isDownloading: boolean;
  setIsDownloading: (val: boolean) => void;
  receiptRef: React.RefObject<HTMLDivElement | null>;
}

export const LiveReceipt: React.FC<LiveReceiptProps> = ({
  shop,
  order,
  calculations,
  onShowToast,
  isDownloading,
  setIsDownloading,
  receiptRef,
}) => {
  const [previewMode, setPreviewMode] = useState<'invoice' | 'sticker'>('invoice');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [receiptStyle, setReceiptStyle] = useState<'modern' | 'classic' | 'thermal'>('modern');
  const [useBanglaNumerals, setUseBanglaNumerals] = useState(false);

  const selectedCourier = COURIER_OPTIONS.find((c) => c.id === order.courier);
  const phoneValidation = validateBDPhone(order.customerPhone || '');
  const totalPieces = order.items.reduce(
    (sum, item) => sum + (Math.max(0, Number(item.quantity)) || 0),
    0
  );
  const validItems = order.items.filter(
    (item) => item.name && item.name.trim().length > 0
  );

  // Copy Order Summary Text for Messenger / WhatsApp
  const handleCopyText = async () => {
    try {
      const summaryText = generateOrderSummaryText(shop, order);
      const success = await copyToClipboard(summaryText);
      if (success) {
        setCopiedText(true);
        onShowToast('অর্ডার মেমো কপি হয়েছে! মেসেঞ্জার বা হোয়াটসঅ্যাপে পেস্ট করুন।', 'success');
        setTimeout(() => setCopiedText(false), 2500);
      } else {
        onShowToast('Could not copy to clipboard. Please select and copy manually.', 'error');
      }
    } catch {
      onShowToast('Could not copy to clipboard. Please select and copy manually.', 'error');
    }
  };

  // Download Image using html2canvas
  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);

    try {
      // Small pause to ensure all fonts and DOM nodes are painted
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2.5, // 2.5x high-res for ultra crisp text on retina/mobile
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeClonedElementForHtml2Canvas(clonedDoc);
        },
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      const cleanShopName = (shop.name || 'Shop').replace(/[^a-zA-Z0-9]/g, '_');
      link.download =
        previewMode === 'sticker'
          ? `${cleanShopName}_ShippingLabel_${order.courier}_${order.invoiceNumber || 'Sticker'}.png`
          : `${cleanShopName}_${order.invoiceNumber || 'Invoice'}.png`;
      link.click();

      onShowToast(
        previewMode === 'sticker'
          ? 'পার্সেল স্টিকার ইমেজ সফলভাবে ডাউনলোড হয়েছে!'
          : 'ইনভয়েস ইমেজ সফলভাবে ডাউনলোড হয়েছে!',
        'success'
      );
    } catch (err) {
      console.error('html2canvas error:', err);
      onShowToast('Failed to export image. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Image directly to clipboard (for instant paste in Facebook Messenger web)
  const handleCopyImage = async () => {
    if (!receiptRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeClonedElementForHtml2Canvas(clonedDoc);
        },
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Blob creation failed');
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedImage(true);
          onShowToast(
            previewMode === 'sticker'
              ? 'Shipping label copied! Paste directly in chat (Ctrl+V).'
              : 'Receipt image copied! Paste directly in Messenger (Ctrl+V).',
            'success'
          );
          setTimeout(() => setCopiedImage(false), 2500);
        } catch {
          // If browser restricts image clipboard writes, download instead
          handleDownloadImage();
        } finally {
          setIsDownloading(false);
        }
      }, 'image/png');
    } catch {
      setIsDownloading(false);
      handleDownloadImage();
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 1. VIEW MODE TOGGLE BUTTONS: Customer Invoice vs Parcel Box Sticker */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setPreviewMode('invoice')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              previewMode === 'invoice'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 Customer Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode('sticker')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              previewMode === 'sticker'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>📦 Parcel Box Sticker (Shipping Label)</span>
          </button>
        </div>
      </div>

      {/* Top Action Ribbon for Receipt / Sticker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              {previewMode === 'invoice' ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Customer Invoice Preview</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 text-slate-800" />
                  <span>Parcel Box Shipping Label Sticker</span>
                </>
              )}
            </span>
            <p className="text-[11px] text-slate-500">
              {previewMode === 'invoice'
                ? 'মেসেঞ্জার বা হোয়াটসঅ্যাপে পাঠানোর জন্য ছবি ডাউনলোড বা টেক্সট কপি করুন'
                : 'পার্সেল বক্সে লাগানোর জন্য হাই-কনট্রাস্ট লেবেল ডাউনলোড বা প্রিন্ট করুন'}
            </p>
          </div>

          {/* Quick Style & Numeral Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setUseBanglaNumerals(!useBanglaNumerals)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                useBanglaNumerals
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {useBanglaNumerals ? 'বাংলা সংখ্যা (১২৩৪)' : 'English Numbers (1234)'}
            </button>

            {previewMode === 'invoice' && (
              <select
                value={receiptStyle}
                onChange={(e) => setReceiptStyle(e.target.value as any)}
                className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
              >
                <option value="modern">Modern Invoice</option>
                <option value="classic">Classic Challan</option>
                <option value="thermal">POS Slip Style</option>
              </select>
            )}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 1. Download Image */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-xs ${
              previewMode === 'sticker'
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Generating...' : previewMode === 'sticker' ? 'Download Sticker' : 'Download Image'}</span>
          </button>

          {/* 2. Copy Image */}
          <button
            type="button"
            onClick={handleCopyImage}
            disabled={isDownloading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-50 rounded-xl transition-all border border-slate-200"
          >
            {copiedImage ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          {/* 3. Copy Text Summary */}
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all border border-slate-200"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Text!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* 4. Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print {previewMode === 'sticker' ? 'Sticker' : ''}</span>
          </button>
        </div>
      </div>

      {/* THE ACTUAL RECEIPT / STICKER CARD (Target for html2canvas & Print) */}
      <div className="flex justify-center p-1 sm:p-2 bg-slate-200/60 rounded-3xl overflow-x-auto">
        {previewMode === 'sticker' ? (
          /* ============================================================ */
          /* 📦 PARCEL BOX STICKER (SHIPPING LABEL) MODE                  */
          /* High-contrast, no prices, courier-ready parcel sticker      */
          /* ============================================================ */
          <div
            ref={receiptRef}
            id="printable-receipt"
            className="receipt-capture-surface bg-white text-slate-900 shadow-xl relative overflow-visible w-full max-w-[500px] p-5 sm:p-6 rounded-2xl border-2 border-slate-900"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderColor: '#0f172a',
            }}
          >
            {/* 1. TOP HEADER: Courier Name & Delivery Zone */}
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck
                  style={{
                    width: '20px',
                    height: '20px',
                    color: '#38bdf8',
                    stroke: '#38bdf8',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      lineHeight: '16px',
                      color: '#ffffff',
                    }}
                  >
                    {order.courier.toUpperCase()} COURIER - HOME DELIVERY
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '14px', marginTop: '1px' }}>
                    Tracking / Invoice:{' '}
                    <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 800 }}>
                      {order.invoiceNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '11px',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '28px',
                  lineHeight: '16px',
                  paddingTop: '3px',
                  paddingBottom: '7px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                }}
              >
                {order.deliveryPreset === 'inside_dhaka'
                  ? 'INSIDE DHAKA'
                  : order.deliveryPreset === 'sub_dhaka'
                  ? 'SUB-DHAKA'
                  : order.deliveryPreset === 'outside_dhaka'
                  ? 'OUTSIDE DHAKA'
                  : 'CUSTOM ZONE'}
              </div>
            </div>

            {/* 2. TWO-COLUMN SENDER (FROM) & RECEIVER (TO) BLOCK */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.35fr',
                gap: '12px',
                border: '2px solid #0f172a',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '12px',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Left Column: FROM (প্রেরক) */}
              <div
                style={{
                  borderRight: '1.5px dashed #cbd5e1',
                  paddingRight: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748b',
                    marginBottom: '4px',
                    lineHeight: '14px',
                  }}
                >
                  FROM (প্রেরক):
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: '17px',
                  }}
                >
                  {shop.name || 'F-Commerce Shop'}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#334155',
                    marginTop: '4px',
                    lineHeight: '15px',
                  }}
                >
                  📞 {shop.phone || 'N/A'}
                </div>
                {shop.address && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#64748b',
                      marginTop: '3px',
                      lineHeight: '14px',
                    }}
                  >
                    📍 {shop.address}
                  </div>
                )}
                {shop.facebookPage && (
                  <div
                    style={{
                      fontSize: '9px',
                      color: '#047857',
                      fontWeight: 700,
                      marginTop: '3px',
                      lineHeight: '13px',
                    }}
                  >
                    fb.com/{shop.facebookPage.replace('facebook.com/', '').replace('https://', '')}
                  </div>
                )}
              </div>

              {/* Right Column: TO (প্রাপক) - LARGE & BOLD */}
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '24px',
                    lineHeight: '16px',
                    paddingTop: '2px',
                    paddingBottom: '6px',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    borderRadius: '5px',
                    marginBottom: '8px',
                    boxSizing: 'border-box',
                  }}
                >
                  TO (প্রাপক) — DESTINATION
                </div>

                {/* Customer Name */}
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: '18px',
                  }}
                >
                  {order.customerName || 'Customer Name'}
                </div>

                {/* Customer Phone - Prominent */}
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: '#0f172a',
                    letterSpacing: '0.04em',
                    margin: '3px 0 4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <span>
                    📞{' '}
                    {order.customerPhone
                      ? useBanglaNumerals
                        ? toBanglaDigits(order.customerPhone)
                        : order.customerPhone
                      : '01XXXXXXXXX'}
                  </span>
                  {phoneValidation.operator && (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '20px',
                        lineHeight: '14px',
                        paddingTop: '1px',
                        paddingBottom: '5px',
                        paddingLeft: '7px',
                        paddingRight: '7px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        color: '#475569',
                        boxSizing: 'border-box',
                      }}
                    >
                      {phoneValidation.operator}
                    </span>
                  )}
                </div>

                {/* Customer Address */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#1e293b',
                    lineHeight: '16px',
                    wordBreak: 'break-word',
                  }}
                >
                  📍 {order.customerAddress || 'Delivery Address'}
                </div>
              </div>
            </div>

            {/* 3. PRODUCT CONTENTS (WITHOUT PRICES - ONLY NAMES & QUANTITIES) */}
            <div
              style={{
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#475569',
                  }}
                >
                  📦 PARCEL CONTENTS / পণ্যের বিবরণ
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '24px',
                    lineHeight: '16px',
                    paddingTop: '2px',
                    paddingBottom: '6px',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                  }}
                >
                  Items: {useBanglaNumerals ? toBanglaDigits(totalPieces) : totalPieces} pcs
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: '20px' }}>
                {validItems.length === 0 ? (
                  <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                    General E-Commerce Package (1 pc)
                  </span>
                ) : (
                  validItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1px 0',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        {idx + 1}. {item.name || 'Item'}
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          color: '#334155',
                          marginLeft: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Qty: {useBanglaNumerals ? toBanglaDigits(item.quantity) : item.quantity} pcs
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. GIANT BOLD BOX: CONDITION / COD TO COLLECT */}
            <div
              style={{
                margin: '12px 0',
                padding: '14px 14px',
                border: '3px solid #0f172a',
                borderRadius: '10px',
                backgroundColor:
                  calculations.isFullyPaid || calculations.codPayable === 0
                    ? '#f0fdf4'
                    : '#ffffff',
                textAlign: 'center',
                overflow: 'visible',
              }}
            >
              {calculations.isFullyPaid || calculations.codPayable === 0 ? (
                <div style={{ overflow: 'visible' }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#166534',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      overflow: 'visible',
                    }}
                  >
                    ✅ PAID - NO CASH TO COLLECT
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#15803d',
                      marginTop: '4px',
                      overflow: 'visible',
                    }}
                  >
                    সম্পূর্ণ মূল্য অগ্রিম পরিশোধিত • ডেলিভারি ম্যান কাস্টমার থেকে কোনো টাকা আদায় করবেন না
                  </div>
                </div>
              ) : (
                <div style={{ overflow: 'visible' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      color: '#475569',
                      textTransform: 'uppercase',
                      lineHeight: '16px',
                      overflow: 'visible',
                    }}
                  >
                    CONDITION / COD TO COLLECT (ক্যাশ অন ডেলিভারি বকেয়া)
                  </div>
                  <div
                    style={{
                      fontSize: '34px',
                      lineHeight: '44px',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      color: '#0f172a',
                      marginTop: '6px',
                      marginBottom: '14px',
                      paddingBottom: '4px',
                      letterSpacing: '-0.02em',
                      overflow: 'visible',
                      display: 'block',
                    }}
                  >
                    {formatBDT(calculations.codPayable, useBanglaNumerals)}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#b91c1c',
                      backgroundColor: '#fef2f2',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '26px',
                      lineHeight: '16px',
                      paddingTop: '3px',
                      paddingBottom: '6px',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      boxSizing: 'border-box',
                      overflow: 'visible',
                    }}
                  >
                    ⚠️ ডেলিভারির সময় কাস্টমার থেকে উল্লেখিত টাকা অবশ্যই সংগ্রহ করুন
                  </div>
                </div>
              )}
            </div>

            {/* 5. SPECIAL DELIVERY NOTE (IF AVAILABLE) */}
            {order.notes && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#92400e',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 800, marginRight: '4px' }}>
                  📌 SPECIAL DELIVERY INSTRUCTION:
                </span>
                <span style={{ fontWeight: 600 }}>{order.notes}</span>
              </div>
            )}

            {/* 6. BOTTOM ROW: FRAGILE BADGE & BARCODE GRAPHIC */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '2px solid #0f172a',
                gap: '12px',
              }}
            >
              {/* Fragile / Handle with Care Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  border: '2px solid #dc2626',
                  borderRadius: '6px',
                  backgroundColor: '#fef2f2',
                }}
              >
                <AlertTriangle
                  style={{
                    width: '18px',
                    height: '18px',
                    color: '#dc2626',
                    stroke: '#dc2626',
                    flexShrink: 0,
                  }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      color: '#dc2626',
                      lineHeight: '12px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    FRAGILE / HANDLE WITH CARE
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#991b1b',
                      lineHeight: '11px',
                    }}
                  >
                    সাবধানে নাড়াচাড়া করুন
                  </div>
                </div>
              </div>

              {/* Barcode Graphic & Invoice ID */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    height: '24px',
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '2px',
                  }}
                >
                  {[
                    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 4, 1, 3, 2, 1, 4, 2,
                  ].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        width: `${w * 1.3}px`,
                        backgroundColor: '#0f172a',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#334155',
                    marginTop: '2px',
                  }}
                >
                  *{order.invoiceNumber}*
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 📄 CUSTOMER INVOICE MODE                                     */
          /* Standard Customer Memo with detailed itemized pricing        */
          /* ============================================================ */
          <div
            ref={receiptRef}
            id="printable-receipt"
            className={`receipt-capture-surface bg-white text-slate-900 shadow-xl transition-all relative overflow-hidden ${
              receiptStyle === 'thermal'
                ? 'w-full max-w-[420px] p-6 rounded-none font-mono text-xs border-dashed border-2 border-slate-300'
                : receiptStyle === 'classic'
                ? 'w-full max-w-[480px] p-7 rounded-2xl border-4 border-double border-slate-800'
                : 'w-full max-w-[500px] p-7 sm:p-8 rounded-2xl border border-slate-200'
            }`}
          >
            {/* Subtle Top Decorative Accent Bar for Modern Style */}
            {receiptStyle === 'modern' && (
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
            )}

            {/* SHOP HEADER */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="w-14 h-14 rounded-xl object-contain border border-slate-100 bg-white p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    {shop.name ? shop.name.charAt(0).toUpperCase() : 'H'}
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                    {shop.name || 'Your Shop Name'}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{shop.phone || 'Phone Number'}</span>
                  </p>
                  {shop.facebookPage && (
                    <div style={{ paddingTop: '2px', paddingBottom: '3px', marginTop: '2px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          lineHeight: '16px',
                          color: '#047857',
                          fontWeight: 600,
                          display: 'inline-block',
                        }}
                      >
                        fb.com/{shop.facebookPage.replace('facebook.com/', '').replace('https://', '')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice & Date Stamp */}
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  INVOICE / মেমো
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {order.invoiceNumber}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {order.createdAt}
                </span>
              </div>
            </div>

            {/* CUSTOMER & COURIER INFO BLOCK */}
            <div className="py-4 border-b border-slate-200">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Customer Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Customer Details (গ্রাহক)
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {order.customerName || 'Customer Name'}
                  </p>
                  <p className="font-mono text-slate-700 font-medium">
                    {order.customerPhone
                      ? useBanglaNumerals
                        ? toBanglaDigits(order.customerPhone)
                        : order.customerPhone
                      : '01XXXXXXXXX'}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed break-words">
                    {order.customerAddress || 'Delivery Address'}
                  </p>
                </div>

                {/* Courier & Shipping Details */}
                <div className="text-right sm:border-l sm:border-slate-100 sm:pl-3 flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Courier Partner (কুরিয়ার)
                  </span>

                  {/* Courier Badge with explicit inline colors for guaranteed html2canvas rendering */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      lineHeight: '16px',
                      backgroundColor:
                        order.courier === 'Steadfast'
                          ? '#ecfdf5'
                          : order.courier === 'Pathao'
                          ? '#fef2f2'
                          : order.courier === 'RedX'
                          ? '#fffbeb'
                          : order.courier === 'Sundarban'
                          ? '#eff6ff'
                          : '#f1f5f9',
                      color:
                        order.courier === 'Steadfast'
                          ? '#065f46'
                          : order.courier === 'Pathao'
                          ? '#991b1b'
                          : order.courier === 'RedX'
                          ? '#92400e'
                          : order.courier === 'Sundarban'
                          ? '#1e40af'
                          : '#334155',
                      border: `1px solid ${
                        order.courier === 'Steadfast'
                          ? '#a7f3d0'
                          : order.courier === 'Pathao'
                          ? '#fecaca'
                          : order.courier === 'RedX'
                          ? '#fde68a'
                          : order.courier === 'Sundarban'
                          ? '#bfdbfe'
                          : '#cbd5e1'
                      }`,
                    }}
                  >
                    <Truck
                      style={{
                        width: '14px',
                        height: '14px',
                        marginRight: '6px',
                        display: 'inline-block',
                        stroke:
                          order.courier === 'Steadfast'
                            ? '#065f46'
                            : order.courier === 'Pathao'
                            ? '#991b1b'
                            : order.courier === 'RedX'
                            ? '#92400e'
                            : order.courier === 'Sundarban'
                            ? '#1e40af'
                            : '#334155',
                      }}
                    />
                    <span
                      style={{
                        color:
                          order.courier === 'Steadfast'
                            ? '#065f46'
                            : order.courier === 'Pathao'
                            ? '#991b1b'
                            : order.courier === 'RedX'
                            ? '#92400e'
                            : order.courier === 'Sundarban'
                            ? '#1e40af'
                            : '#334155',
                        fontWeight: 700,
                      }}
                    >
                      {order.courier} Courier
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '11px',
                      color: '#64748b',
                      lineHeight: '16px',
                    }}
                  >
                    {order.deliveryPreset === 'inside_dhaka'
                      ? 'ঢাকার ভেতরে (Inside Dhaka)'
                      : order.deliveryPreset === 'sub_dhaka'
                      ? 'সাব-ঢাকা (Sub-Dhaka)'
                      : order.deliveryPreset === 'outside_dhaka'
                      ? 'ঢাকার বাইরে (Outside Dhaka)'
                      : 'কাস্টম ডেলিভারি (Custom Area)'}
                  </div>
                </div>
              </div>

              {/* Delivery Note */}
              {order.notes && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '10px',
                    fontSize: '11px',
                    lineHeight: '16px',
                    color: '#92400e',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 700, marginRight: '4px' }}>📌 ডেলিভারি নোট (Note):</span>
                  <span>{order.notes}</span>
                </div>
              )}
            </div>

            {/* PRODUCT ITEMS TABLE */}
            <div className="py-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="text-left pb-2 font-semibold">Item Description</th>
                    <th className="text-center pb-2 font-semibold w-12">Qty</th>
                    <th className="text-right pb-2 font-semibold w-16">Price</th>
                    <th className="text-right pb-2 font-semibold w-20">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.length === 0 ||
                  (!order.items[0].name.trim() && order.items[0].unitPrice === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                        No items added yet
                      </td>
                    </tr>
                  ) : (
                    order.items.map((item, idx) => {
                      const lineTotal = item.quantity * item.unitPrice;
                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 pr-2 font-medium text-slate-900">
                            <span className="mr-1 text-slate-400 font-mono">{idx + 1}.</span>
                            {item.name || 'Item'}
                          </td>
                          <td className="py-2.5 text-center font-mono text-slate-700">
                            {useBanglaNumerals ? toBanglaDigits(item.quantity) : item.quantity}
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-700 tabular-nums">
                            {useBanglaNumerals ? toBanglaDigits(item.unitPrice) : item.unitPrice}
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {formatBDT(lineTotal, useBanglaNumerals)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* FINANCIAL BREAKDOWN */}
            <div className="pt-3 border-t-2 border-slate-200 space-y-1.5 text-xs">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal (পণ্যের মোট মূল্য):</span>
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  {formatBDT(calculations.subtotal, useBanglaNumerals)}
                </span>
              </div>

              {/* Discount (When > 0) */}
              {calculations.discountAmount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#047857',
                    backgroundColor: '#ecfdf5',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #d1fae5',
                    margin: '3px 0',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    Discount (বিশেষ ছাড়)
                    {order.discountType === 'percentage' && (
                      <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.9 }}>
                        ({order.discountValue}%)
                      </span>
                    )}
                    :
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#065f46',
                    }}
                  >
                    - {formatBDT(calculations.discountAmount, useBanglaNumerals)}
                  </span>
                </div>
              )}

              {/* Delivery Charge */}
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Delivery Charge (ডেলিভারি চার্জ):</span>
                </span>
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  + {formatBDT(calculations.deliveryCharge, useBanglaNumerals)}
                </span>
              </div>

              {/* Total Order Amount */}
              <div className="flex justify-between items-center text-slate-700 font-medium pt-1 border-t border-slate-100">
                <span>Total Bill (সর্বমোট বিল):</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatBDT(calculations.totalWithDelivery, useBanglaNumerals)}
                </span>
              </div>

              {/* Advance Paid */}
              <div className="flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span>Advance Paid (অগ্রিম পরিশোধ):</span>
                  {calculations.advancePaid > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {order.advancePaymentMethod}
                      {order.advanceTrxId ? ` · ${order.advanceTrxId}` : ''}
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold text-amber-700 tabular-nums">
                  - {formatBDT(calculations.advancePaid, useBanglaNumerals)}
                </span>
              </div>
            </div>

            {/* BIG PROMINENT BADGE FOR "COD AMOUNT DUE" (IN ৳ BDT) */}
            <div className="mt-5 mb-4">
              <div
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  calculations.isFullyPaid
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-emerald-600 border-emerald-700 text-white shadow-md'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-widest opacity-90">
                    {calculations.isFullyPaid
                      ? 'PAID IN FULL / কোনো বকেয়া নেই'
                      : 'CASH ON DELIVERY (COD DUE)'}
                  </span>
                </div>

                {/* Big amount headline */}
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums drop-shadow-xs my-0.5">
                  {formatBDT(calculations.codPayable, useBanglaNumerals)}
                </div>

                <div className="text-xs font-semibold opacity-95">
                  {calculations.isFullyPaid ? (
                    <span>সম্পূর্ণ মূল্য অগ্রিম পরিশোধিত। রাইডারকে কোনো টাকা দিতে হবে না।</span>
                  ) : (
                    <span>ক্যাশ কালেকশন: ডেলিভারির সময় গ্রাহক এই টাকা পরিশোধ করবেন</span>
                  )}
                </div>

                {calculations.excessPaid > 0 && (
                  <div className="mt-1 text-[11px] text-emerald-800 font-bold bg-white/60 py-0.5 rounded">
                    Excess Paid: {formatBDT(calculations.excessPaid, useBanglaNumerals)} (Refund due)
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER & TERMS */}
            <div className="pt-3 border-t border-slate-200 text-center space-y-1.5 text-[11px] text-slate-500">
              <p className="font-medium text-slate-700">
                {shop.invoiceFooterNote ||
                  'Thank you for shopping with us! Please verify items upon receiving.'}
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono">
                <span>HishabBD Verified Invoice</span>
                <span>•</span>
                <span>COD Guaranteed</span>
                <span>•</span>
                <span>{order.courier} Shipping</span>
              </div>

              {/* Aesthetic Barcode graphic */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <div className="h-7 w-48 flex items-stretch gap-[2px] opacity-75">
                  {[
                    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 4, 1, 3, 2, 1, 4, 2,
                    1, 3, 1,
                  ].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-800"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 mt-1">
                  *{order.invoiceNumber}*
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

