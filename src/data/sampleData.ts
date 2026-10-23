import { ShopProfile, OrderDetails, CourierType } from '../types';

export const DEFAULT_SHOP_PROFILE: ShopProfile = {
  name: 'Aura Elegance BD',
  phone: '01712-345678',
  logoUrl: '',
  facebookPage: 'facebook.com/AuraEleganceBD',
  address: 'Bashundhara R/A, Dhaka',
  invoiceFooterNote: 'Thank you for shopping with us! Please verify the parcel in front of the delivery rider.',
};

export const COURIER_OPTIONS: { id: CourierType; name: string; tag: string; color: string; bg: string }[] = [
  { id: 'Steadfast', name: 'Steadfast Courier', tag: 'Fastest BD delivery', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { id: 'Pathao', name: 'Pathao Courier', tag: 'Same day / Next day', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  { id: 'RedX', name: 'RedX Delivery', tag: 'Nationwide coverage', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { id: 'Sundarban', name: 'Sundarban Courier', tag: 'Traditional & trusted', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { id: 'Paperfly', name: 'Paperfly', tag: 'Home delivery nationwide', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { id: 'Other', name: 'Other / Hand Delivery', tag: 'Direct delivery', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
];

export const POPULAR_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Gazipur', 'Narayanganj', 'Cumilla', 'Bogura', 'Barisal'
];

export const PRODUCT_TEMPLATES = [
  { name: 'Cotton Premium Panjabi', price: 1450 },
  { name: 'Traditional Jamdani Saree', price: 3200 },
  { name: 'Oversized Streetwear T-Shirt', price: 650 },
  { name: 'Smart Fitness Watch Series 9', price: 2150 },
  { name: 'Wireless Noise-Canceling Earbuds', price: 1650 },
  { name: 'Korean Hydrating Glow Serum', price: 1100 },
  { name: 'Genuine Leather Long Wallet', price: 950 },
  { name: 'Attar Al-Rehab Premium 6ml', price: 350 },
];

export const SAMPLE_ORDERS: { label: string; order: OrderDetails }[] = [
  {
    label: 'Fashion Order (Dhaka - bKash Advance)',
    order: {
      id: 'sample-1',
      invoiceNumber: 'INV-261022-412',
      createdAt: '22 Oct 2026, 03:45 PM',
      customerName: 'Nusrat Jahan',
      customerPhone: '01819283746',
      customerAddress: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
      courier: 'Steadfast',
      items: [
        { id: 'it-1', name: 'Designer Cotton Kurti (Navy Blue - M)', quantity: 1, unitPrice: 1450 },
        { id: 'it-2', name: 'Silk Dupatta with Tassels', quantity: 1, unitPrice: 550 },
      ],
      deliveryPreset: 'inside_dhaka',
      deliveryCharge: 70,
      discountType: 'fixed',
      discountValue: 100,
      advancePaid: 200,
      advancePaymentMethod: 'bKash',
      advanceTrxId: 'BK92837461',
      notes: 'Call before delivery. Morning slot preferred.',
      status: 'shipped',
    },
  },
  {
    label: 'Gadget Order (Chittagong - Full COD)',
    order: {
      id: 'sample-2',
      invoiceNumber: 'INV-261022-789',
      createdAt: '22 Oct 2026, 05:20 PM',
      customerName: 'Rafiqul Islam',
      customerPhone: '01711223344',
      customerAddress: 'Holding 88, Nasirabad Housing Society, GEC Circle, Chattogram',
      courier: 'Pathao',
      items: [
        { id: 'it-3', name: 'Ultra ANC Wireless Headphones', quantity: 1, unitPrice: 2850 },
      ],
      deliveryPreset: 'outside_dhaka',
      deliveryCharge: 130,
      discountType: 'fixed',
      discountValue: 0,
      advancePaid: 130,
      advancePaymentMethod: 'Nagad',
      advanceTrxId: 'NG77665544',
      notes: 'Only delivery charge paid as advance. Collect product price on delivery.',
      status: 'pending',
    },
  },
  {
    label: 'Cosmetics Order (Sylhet - Delivered)',
    order: {
      id: 'sample-3',
      invoiceNumber: 'INV-261021-305',
      createdAt: '21 Oct 2026, 11:15 AM',
      customerName: 'Samira Anjum',
      customerPhone: '01912998877',
      customerAddress: 'Flat 4B, Rose Valley, Zindabazar, Sylhet',
      courier: 'Steadfast',
      items: [
        { id: 'it-4', name: 'Korean Hydrating Glow Serum', quantity: 2, unitPrice: 1100 },
      ],
      deliveryPreset: 'outside_dhaka',
      deliveryCharge: 130,
      discountType: 'percentage',
      discountValue: 5,
      advancePaid: 200,
      advancePaymentMethod: 'bKash',
      advanceTrxId: 'BK44332211',
      notes: 'Delivered successfully and cash collected.',
      status: 'delivered',
    },
  },
];
