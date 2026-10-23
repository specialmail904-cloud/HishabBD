export type CourierType = 'Pathao' | 'Steadfast' | 'RedX' | 'Sundarban' | 'Paperfly' | 'Other';

export type DeliveryPreset = 'inside_dhaka' | 'sub_dhaka' | 'outside_dhaka' | 'custom';

export type PaymentMethod = 'bKash' | 'Nagad' | 'Cash' | 'Rocket' | 'Bank';

export interface ShopProfile {
  name: string;
  phone: string;
  logoUrl: string;
  facebookPage?: string;
  address?: string;
  invoiceFooterNote?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'returned';

export interface OrderDetails {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  courier: CourierType;
  items: OrderItem[];
  deliveryPreset: DeliveryPreset;
  deliveryCharge: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  advancePaid: number;
  advancePaymentMethod: PaymentMethod;
  advanceTrxId?: string;
  notes?: string;
  status?: OrderStatus;
}

export interface CalculationResult {
  subtotal: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountAmount: number;
  deliveryCharge: number;
  totalWithDelivery: number;
  advancePaid: number;
  codPayable: number;
  isFullyPaid: boolean;
  excessPaid: number;
}
