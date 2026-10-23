import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateOrderTotals,
  toBanglaDigits,
  formatBDT,
  validateBDPhone,
  generateOrderSummaryText,
  calculateHistoryAnalytics,
  formatBDWhatsAppLink,
} from './calculator';
import { OrderItem, ShopProfile, OrderDetails } from '../types';

test('calculateSubtotal sums up item quantity * unitPrice correctly', () => {
  const items: OrderItem[] = [
    { id: '1', name: 'Cotton Panjabi', quantity: 2, unitPrice: 1200 },
    { id: '2', name: 'Attar Al-Haramain', quantity: 1, unitPrice: 450 },
    { id: '3', name: 'Gift Box', quantity: 3, unitPrice: 50 },
  ];
  // 2*1200=2400 + 450 + 150 = 3000
  assert.equal(calculateSubtotal(items), 3000);
});

test('calculateSubtotal handles empty or invalid items gracefully', () => {
  assert.equal(calculateSubtotal([]), 0);
  assert.equal(calculateSubtotal([
    { id: '1', name: 'Broken', quantity: -2, unitPrice: 100 },
    { id: '2', name: 'NaN test', quantity: 0, unitPrice: 500 },
  ]), 0);
});

test('calculateOrderTotals executes BD Delivery & Payment Logic accurately', () => {
  // Scenario: Subtotal 1500, Delivery Inside Dhaka (70), Advance Paid 200 (bKash)
  // Total with Delivery = 1570
  // Net COD Payable = 1570 - 200 = 1370
  const result = calculateOrderTotals(1500, 70, 200);
  assert.equal(result.subtotal, 1500);
  assert.equal(result.deliveryCharge, 70);
  assert.equal(result.totalWithDelivery, 1570);
  assert.equal(result.advancePaid, 200);
  assert.equal(result.codPayable, 1370);
  assert.equal(result.isFullyPaid, false);
  assert.equal(result.excessPaid, 0);
});

test('calculateOrderTotals handles 100% advance payment (full payment)', () => {
  // Scenario: Subtotal 800, Outside Dhaka Delivery (130) = 930
  // Advance paid full 930
  const result = calculateOrderTotals(800, 130, 930);
  assert.equal(result.codPayable, 0);
  assert.equal(result.isFullyPaid, true);
  assert.equal(result.excessPaid, 0);
});

test('calculateOrderTotals handles overpayment without negative COD', () => {
  const result = calculateOrderTotals(500, 70, 600);
  assert.equal(result.codPayable, 0);
  assert.equal(result.isFullyPaid, true);
  assert.equal(result.excessPaid, 30);
});

test('calculateOrderTotals calculates fixed discount accurately: Subtotal - Discount + Delivery - Advance = COD', () => {
  // Scenario: Subtotal 2000, Fixed Discount 100, Delivery 70, Advance 200
  // Total Bill = 2000 - 100 + 70 = 1970
  // COD Due = 1970 - 200 = 1770
  const result = calculateOrderTotals(2000, 70, 200, 'fixed', 100);
  assert.equal(result.subtotal, 2000);
  assert.equal(result.discountAmount, 100);
  assert.equal(result.totalWithDelivery, 1970);
  assert.equal(result.codPayable, 1770);
});

test('calculateOrderTotals calculates percentage discount accurately', () => {
  // Scenario: Subtotal 2000, 10% Discount = 200, Delivery 70, Advance 200
  // Total Bill = 2000 - 200 + 70 = 1870
  // COD Due = 1870 - 200 = 1670
  const result = calculateOrderTotals(2000, 70, 200, 'percentage', 10);
  assert.equal(result.subtotal, 2000);
  assert.equal(result.discountAmount, 200);
  assert.equal(result.totalWithDelivery, 1870);
  assert.equal(result.codPayable, 1670);
});

test('calculateOrderTotals caps discount at subtotal', () => {
  // Scenario: Subtotal 500, Discount 800 -> Discount capped to 500
  // Delivery 70, Advance 0 -> Total Bill 70 -> COD Due 70
  const result = calculateOrderTotals(500, 70, 0, 'fixed', 800);
  assert.equal(result.discountAmount, 500);
  assert.equal(result.totalWithDelivery, 70);
  assert.equal(result.codPayable, 70);
});

test('toBanglaDigits converts standard numbers to Bengali script', () => {
  assert.equal(toBanglaDigits('01712345678'), '০১৭১২৩৪৫৬৭৮');
  assert.equal(toBanglaDigits(1450), '১৪৫০');
});

test('formatBDT formats currency with BDT symbol', () => {
  assert.equal(formatBDT(1500), '৳ 1,500');
  assert.equal(formatBDT(25000), '৳ 25,000');
  assert.equal(formatBDT(1500, true), '৳ ১,৫০০');
});

test('validateBDPhone detects valid Bangladeshi numbers and operators', () => {
  const gp = validateBDPhone('01711223344');
  assert.equal(gp.isValid, true);
  assert.equal(gp.operator, 'Grameenphone');

  const robi = validateBDPhone('+8801812345678');
  assert.equal(robi.isValid, true);
  assert.equal(robi.operator, 'Robi');

  const bl = validateBDPhone('01999887766');
  assert.equal(bl.isValid, true);
  assert.equal(bl.operator, 'Banglalink');

  const invalid = validateBDPhone('01234567890');
  assert.equal(invalid.isValid, false);
});

test('generateOrderSummaryText creates structured Messenger-ready text', () => {
  const shop: ShopProfile = {
    name: 'Aura BD',
    phone: '01711000000',
    logoUrl: '',
    facebookPage: 'fb.com/aurabd',
  };
  const order: OrderDetails = {
    id: '1',
    invoiceNumber: 'INV-241022-101',
    createdAt: '22 Oct 2026',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01712345678',
    customerAddress: 'House 12, Road 4, Dhanmondi, Dhaka',
    courier: 'Pathao',
    items: [{ id: '1', name: 'Linen Shirt', quantity: 1, unitPrice: 1200 }],
    deliveryPreset: 'inside_dhaka',
    deliveryCharge: 70,
    discountType: 'fixed',
    discountValue: 0,
    advancePaid: 150,
    advancePaymentMethod: 'bKash',
  };

  const text = generateOrderSummaryText(shop, order);
  assert.match(text, /Aura BD/);
  assert.match(text, /Tanvir Ahmed/);
  assert.match(text, /Pathao/);
  assert.match(text, /1200/);
  assert.match(text, /1120/); // 1200 + 70 - 150 = 1120
  assert.match(text, /bKash/);
});

test('calculateHistoryAnalytics computes 4 KPIs correctly across various statuses', () => {
  const sampleOrders: OrderDetails[] = [
    {
      id: 'o1',
      invoiceNumber: 'INV-1',
      createdAt: '22 Oct',
      customerName: 'Customer A',
      customerPhone: '01711111111',
      customerAddress: 'Dhaka',
      courier: 'Steadfast',
      items: [{ id: 'i1', name: 'Product 1', quantity: 1, unitPrice: 1000 }],
      deliveryPreset: 'inside_dhaka',
      deliveryCharge: 70,
      discountType: 'fixed',
      discountValue: 0,
      advancePaid: 200,
      advancePaymentMethod: 'bKash',
      status: 'pending', // Subtotal 1000, Delivery 70 -> Total 1070. Advance 200 -> COD due: 870
    },
    {
      id: 'o2',
      invoiceNumber: 'INV-2',
      createdAt: '22 Oct',
      customerName: 'Customer B',
      customerPhone: '01822222222',
      customerAddress: 'Chittagong',
      courier: 'Pathao',
      items: [{ id: 'i2', name: 'Product 2', quantity: 2, unitPrice: 500 }],
      deliveryPreset: 'outside_dhaka',
      deliveryCharge: 130,
      discountType: 'fixed',
      discountValue: 50,
      advancePaid: 130,
      advancePaymentMethod: 'Nagad',
      status: 'delivered', // Subtotal 1000 - 50 + 130 = 1080. Advance 130 -> COD 950 delivered!
    },
    {
      id: 'o3',
      invoiceNumber: 'INV-3',
      createdAt: '22 Oct',
      customerName: 'Customer C',
      customerPhone: '01933333333',
      customerAddress: 'Khulna',
      courier: 'RedX',
      items: [{ id: 'i3', name: 'Product 3', quantity: 1, unitPrice: 600 }],
      deliveryPreset: 'outside_dhaka',
      deliveryCharge: 130,
      discountType: 'fixed',
      discountValue: 0,
      advancePaid: 130,
      advancePaymentMethod: 'bKash',
      status: 'returned', // Subtotal 600 + 130 = 730. Advance 130. COD 600 was returned (not collected, not pending).
    },
  ];

  const analytics = calculateHistoryAnalytics(sampleOrders);

  // Total Orders: 3
  assert.equal(analytics.totalOrders, 3);

  // Total Sales = 1070 + 1080 + 730 = 2880
  assert.equal(analytics.totalSales, 2880);

  // Total COD Pending: Only o1 (pending, COD=870). o2 is delivered, o3 is returned.
  assert.equal(analytics.totalCODPending, 870);

  // Total Collected:
  // Advance paid across all = 200 + 130 + 130 = 460
  // Plus delivered order COD collected = 950
  // Total Collected = 460 + 950 = 1410
  assert.equal(analytics.totalCollected, 1410);
});

test('formatBDWhatsAppLink generates valid BD international wa.me URL with Bangla text', () => {
  const link = formatBDWhatsAppLink('01712345678', 'Rahim', 'INV-101', 500);
  assert.match(link, /^https:\/\/wa\.me\/8801712345678\?text=/);
  assert.match(decodeURIComponent(link), /Rahim/);
  assert.match(decodeURIComponent(link), /INV-101/);
  assert.match(decodeURIComponent(link), /500/);
});

