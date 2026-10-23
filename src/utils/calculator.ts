import { OrderItem, CalculationResult, ShopProfile, OrderDetails } from '../types';

/**
 * Calculates subtotal for all valid order items.
 */
export function calculateSubtotal(items: OrderItem[]): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    return sum + (qty * price);
  }, 0);
}

/**
 * Calculates complete order totals including Discount, Delivery Charge, and COD payable.
 * Rule:
 * 1. Subtotal - Discount + Delivery Charge = Total Bill
 * 2. Total Bill - Advance Paid = Total Payable on Delivery (COD Due)
 */
export function calculateOrderTotals(
  subtotal: number,
  deliveryCharge: number,
  advancePaid: number,
  discountType: 'fixed' | 'percentage' = 'fixed',
  discountValue: number = 0
): CalculationResult {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const safeDelivery = Math.max(0, Number(deliveryCharge) || 0);
  const safeAdvance = Math.max(0, Number(advancePaid) || 0);
  const safeDiscVal = Math.max(0, Number(discountValue) || 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((safeSubtotal * safeDiscVal) / 100);
  } else {
    discountAmount = Math.round(safeDiscVal);
  }
  // Discount cannot exceed subtotal
  discountAmount = Math.min(safeSubtotal, discountAmount);

  const totalWithDelivery = Math.max(0, safeSubtotal - discountAmount + safeDelivery);
  const netDue = totalWithDelivery - safeAdvance;

  const codPayable = Math.max(0, netDue);
  const isFullyPaid = safeAdvance >= totalWithDelivery && totalWithDelivery > 0;
  const excessPaid = safeAdvance > totalWithDelivery ? safeAdvance - totalWithDelivery : 0;

  return {
    subtotal: safeSubtotal,
    discountType,
    discountValue: safeDiscVal,
    discountAmount,
    deliveryCharge: safeDelivery,
    totalWithDelivery,
    advancePaid: safeAdvance,
    codPayable,
    isFullyPaid,
    excessPaid,
  };
}

/**
 * Converts English digits (0-9) to Bengali numerals (০-৯)
 */
export function toBanglaDigits(val: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (digit) => banglaDigits[Number(digit)]);
}

/**
 * Formats a number as Bangladeshi Taka (৳ 1,250)
 */
export function formatBDT(amount: number, useBanglaDigits = false): string {
  const safe = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat('en-IN').format(safe);
  if (useBanglaDigits) {
    return `৳ ${toBanglaDigits(formatted)}`;
  }
  return `৳ ${formatted}`;
}

/**
 * Generates an aesthetic invoice number, e.g., INV-241022-841
 */
export function generateInvoiceNumber(date = new Date()): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `INV-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Validates Bangladeshi 11-digit mobile numbers and detects operator
 */
export function validateBDPhone(phone: string): {
  isValid: boolean;
  operator?: string;
  cleaned: string;
} {
  const cleaned = phone.replace(/[^0-9]/g, '');
  // Format should be 11 digits starting with 01
  // Or 13 digits starting with 8801
  let normalized = cleaned;
  if (cleaned.startsWith('8801') && cleaned.length === 13) {
    normalized = cleaned.slice(2);
  }

  const isValid = /^01[3-9]\d{8}$/.test(normalized);

  let operator: string | undefined;
  if (normalized.length >= 3) {
    const prefix = normalized.slice(0, 3);
    if (prefix === '017' || prefix === '013') operator = 'Grameenphone';
    else if (prefix === '018') operator = 'Robi';
    else if (prefix === '019' || prefix === '014') operator = 'Banglalink';
    else if (prefix === '015') operator = 'Teletalk';
    else if (prefix === '016') operator = 'Airtel';
  }

  return {
    isValid,
    operator,
    cleaned: normalized,
  };
}

/**
 * Generates an aesthetic, share-ready text summary for Facebook Messenger and WhatsApp
 */
export function generateOrderSummaryText(
  shop: ShopProfile,
  order: OrderDetails
): string {
  const subtotal = calculateSubtotal(order.items);
  const totals = calculateOrderTotals(
    subtotal,
    order.deliveryCharge,
    order.advancePaid,
    order.discountType || 'fixed',
    order.discountValue || 0
  );

  const itemsList = order.items
    .filter((item) => item.name.trim().length > 0)
    .map((item, index) => {
      const lineTotal = item.quantity * item.unitPrice;
      return `${index + 1}. ${item.name} (${item.quantity}টি x ৳${item.unitPrice}) = ৳${lineTotal}`;
    })
    .join('\n');

  const discountText = totals.discountAmount > 0
    ? `🎁 বিশেষ ছাড় (Discount): - ৳${totals.discountAmount}${order.discountType === 'percentage' ? ` (${order.discountValue}%)` : ''}\n`
    : '';

  const advanceText = totals.advancePaid > 0
    ? `💳 অগ্রিম পরিশোধ (Advance Paid): ৳${totals.advancePaid} [${order.advancePaymentMethod}${order.advanceTrxId ? ` - Trx: ${order.advanceTrxId}` : ''}]\n`
    : `💳 অগ্রিম পরিশোধ: ৳০ (সম্পূর্ণ ক্যাশ অন ডেলিভারি)\n`;

  const codText = totals.isFullyPaid
    ? `✅ পরিশোধিত (Paid in Full): ৳০ COD`
    : `💰 ক্যাশ অন ডেলিভারি (COD Due): ৳${totals.codPayable} টাকা`;

  return `📦 অর্ডার মেমো / Order Confirmation
━━━━━━━━━━━━━━━━━━━━
🏪 দোকান: ${shop.name || 'F-Commerce Shop'}
📱 হেল্পলাইন: ${shop.phone || 'N/A'}
${shop.facebookPage ? `🌐 ফেসবুক: ${shop.facebookPage}\n` : ''}🧾 ইনভয়েস নং: ${order.invoiceNumber}
📅 তারিখ: ${order.createdAt}
━━━━━━━━━━━━━━━━━━━━
👤 কাস্টমার: ${order.customerName || 'N/A'}
📞 মোবাইল: ${order.customerPhone || 'N/A'}
📍 ঠিকানা: ${order.customerAddress || 'N/A'}
🚚 কুরিয়ার: ${order.courier}
━━━━━━━━━━━━━━━━━━━━
🛍️ পণ্যের বিবরণ:
${itemsList || '(কোন পণ্য যোগ করা হয়নি)'}
━━━━━━━━━━━━━━━━━━━━
💵 পণ্যের মূল্য (Subtotal): ৳${totals.subtotal}
${discountText}🚚 ডেলিভারি চার্জ: ৳${totals.deliveryCharge} (${order.deliveryPreset === 'inside_dhaka' ? 'ঢাকার ভেতরে' : order.deliveryPreset === 'sub_dhaka' ? 'সাব-ঢাকা' : order.deliveryPreset === 'outside_dhaka' ? 'ঢাকার বাইরে' : 'কাস্টম'})
🧾 সর্বমোট বিল (Total Bill): ৳${totals.totalWithDelivery}
${advanceText}━━━━━━━━━━━━━━━━━━━━
👉 ${codText}
━━━━━━━━━━━━━━━━━━━━
পণ্য ডেলিভারি পাওয়ার সময় অনুগ্রহ করে চেক করে নিবেন। আমাদের সাথে থাকার জন্য ধন্যবাদ! ❤️`;
}

/**
 * Robust copy to clipboard with document.execCommand fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback to execCommand
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
}

/**
 * Calculates high-level summary KPIs for order history:
 * - Total Orders (মোট অর্ডার)
 * - Total Sales Amount (মোট বিক্রি ৳)
 * - Total COD Pending (কুরিয়ারে আটকে থাকা বকেয়া টাকা ৳) - for pending or shipped orders
 * - Total Collected / Advance (হাতে পাওয়া টাকা ৳) - all advance payments + collected COD from delivered orders
 */
export interface HistoryAnalytics {
  totalOrders: number;
  totalSales: number;
  totalCODPending: number;
  totalCollected: number;
}

export function calculateHistoryAnalytics(orders: OrderDetails[]): HistoryAnalytics {
  if (!Array.isArray(orders) || orders.length === 0) {
    return {
      totalOrders: 0,
      totalSales: 0,
      totalCODPending: 0,
      totalCollected: 0,
    };
  }

  let totalSales = 0;
  let totalCODPending = 0;
  let totalCollected = 0;

  for (const ord of orders) {
    const subtotal = calculateSubtotal(ord.items);
    const totals = calculateOrderTotals(
      subtotal,
      ord.deliveryCharge,
      ord.advancePaid,
      ord.discountType || 'fixed',
      ord.discountValue || 0
    );

    const status = ord.status || 'pending';

    // Total sales is the full bill
    totalSales += totals.totalWithDelivery;

    // Advance payment is always collected right away by the shop (bKash/Nagad)
    totalCollected += totals.advancePaid;

    if (status === 'delivered') {
      // Delivered order: the rider collected the COD amount and it is handed to the seller
      totalCollected += totals.codPayable;
    } else if (status === 'pending' || status === 'shipped') {
      // In transit or waiting to ship: COD is pending collection from courier
      totalCODPending += totals.codPayable;
    }
    // Note: if status === 'returned', COD is 0 (customer refused/returned, no cash to collect)
  }

  return {
    totalOrders: orders.length,
    totalSales,
    totalCODPending,
    totalCollected,
  };
}

/**
 * Builds a direct WhatsApp chat URL with Bangladesh prefix (+880) and prefilled Bangla order message
 */
export function formatBDWhatsAppLink(
  phone: string,
  customerName = '',
  invoiceNumber = '',
  codDue = 0
): string {
  const { cleaned } = validateBDPhone(phone);
  if (!cleaned) return '';

  let fullNumber = cleaned;
  if (fullNumber.startsWith('01')) {
    fullNumber = `880${fullNumber.slice(1)}`;
  } else if (!fullNumber.startsWith('880')) {
    fullNumber = `880${fullNumber}`;
  }

  const greeting = customerName ? `আসসালামু আলাইকুম ${customerName}!` : 'আসসালামু আলাইকুম!';
  const invInfo = invoiceNumber ? ` আপনার অর্ডার (ইনভয়েস: ${invoiceNumber})` : ' আপনার অর্ডার';
  const codInfo = codDue > 0 ? ` ক্যাশ অন ডেলিভারি বকেয়া: ৳${codDue} টাকা।` : ' বিল পরিশোধিত।';
  const text = `${greeting}${invInfo} সংক্রান্ত তথ্য জানার জন্য মেসেজ দেওয়া হলো।${codInfo} পণ্য সম্পর্কিত কোনো প্রশ্ন থাকলে জানান। ধন্যবাদ!`;

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Sanitizes any oklch color values on cloned DOM nodes so html2canvas doesn't crash
 */
export function sanitizeClonedElementForHtml2Canvas(clonedDoc: Document): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colorProperties = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderBottomColor',
    'borderLeftColor',
    'borderRightColor',
    'outlineColor',
  ];

  const elements = clonedDoc.querySelectorAll('*');
  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);

    colorProperties.forEach((prop) => {
      const val = (computed as any)[prop];
      if (typeof val === 'string' && val.includes('oklch')) {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = val;
        (htmlEl.style as any)[prop] = ctx.fillStyle;
      }
    });
  });
}

