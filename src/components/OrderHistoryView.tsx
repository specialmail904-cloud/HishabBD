import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Trash2,
  Phone,
  MessageCircle,
  ExternalLink,
  Package,
  Clock,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Truck,
  XCircle,
  FileText,
  Filter,
  PlusCircle,
  ArrowUpDown,
  Copy,
} from 'lucide-react';
import { OrderDetails, OrderStatus, CourierType } from '../types';
import {
  calculateSubtotal,
  calculateOrderTotals,
  calculateHistoryAnalytics,
  formatBDT,
  formatBDWhatsAppLink,
  validateBDPhone,
  copyToClipboard,
} from '../utils/calculator';
import { COURIER_OPTIONS } from '../data/sampleData';

interface OrderHistoryViewProps {
  orders: OrderDetails[];
  onSelectOrder: (order: OrderDetails) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onDeleteOrder: (id: string) => void;
  onClearAll: () => void;
  onNavigateToEditor: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bangla: string; badgeClass: string; selectClass: string; icon: any }
> = {
  pending: {
    label: 'Pending',
    bangla: 'অপেক্ষমাণ',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    selectClass: 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-500',
    icon: Clock,
  },
  shipped: {
    label: 'Shipped',
    bangla: 'কুরিয়ারে রওয়ানা',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    selectClass: 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-500',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    bangla: 'ডেলিভারি সম্পন্ন',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    selectClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500',
    icon: CheckCircle2,
  },
  returned: {
    label: 'Returned',
    bangla: 'রিটার্ন / বাতিল',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    selectClass: 'bg-rose-50 text-rose-800 border-rose-300 focus:ring-rose-500',
    icon: XCircle,
  },
};

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onSelectOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onClearAll,
  onNavigateToEditor,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 1. High-level Summary Metrics (across all saved orders)
  const analytics = useMemo(() => calculateHistoryAnalytics(orders), [orders]);

  // 2. Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = order.status || 'pending';
      if (selectedStatusFilter !== 'all' && status !== selectedStatusFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const qDigits = q.replace(/[^0-9]/g, '');
      const matchName = (order.customerName || '').toLowerCase().includes(q);
      const matchPhone = (qDigits.length >= 2 && (order.customerPhone || '').replace(/[^0-9]/g, '').includes(qDigits)) ||
        (order.customerPhone || '').toLowerCase().includes(q);
      const matchInvoice = (order.invoiceNumber || '').toLowerCase().includes(q);
      const matchCourier = (order.courier || '').toLowerCase().includes(q);

      return matchName || matchPhone || matchInvoice || matchCourier;
    });
  }, [orders, searchQuery, selectedStatusFilter]);

  // Counts for filter pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length, pending: 0, shipped: 0, delivered: 0, returned: 0 };
    orders.forEach((o) => {
      const s = o.status || 'pending';
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [orders]);

  const handleCopyInvoice = async (inv: string) => {
    const success = await copyToClipboard(inv);
    if (success) {
      onShowToast(`Invoice number ${inv} copied!`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Order History & Analytics (অর্ডার ও হিসাব)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {orders.length} Orders Saved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily F-Commerce sales, Courier COD dues (Steadfast, Pathao), deliver status & customer WhatsApp records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToEditor}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Invoice (নতুন অর্ডার)</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analytics.totalOrders}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              মোট অর্ডার সংখ্যা
            </div>
          </div>
        </div>

        {/* KPI 2: Total Sales Amount */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Total Sales Amount
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              {formatBDT(analytics.totalSales)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              মোট বিক্রি (পণ্য + ডেলিভারি)
            </div>
          </div>
        </div>

        {/* KPI 3: Total COD Pending */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-2xs flex flex-col justify-between bg-gradient-to-b from-amber-50/40 to-white hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Total COD Pending
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900">
              {formatBDT(analytics.totalCODPending)}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-semibold">
              কুরিয়ারে আটকে থাকা বকেয়া টাকা
            </div>
          </div>
        </div>

        {/* KPI 4: Total Collected / Advance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-2xs flex flex-col justify-between bg-gradient-to-b from-emerald-50/40 to-white hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Total Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
              {formatBDT(analytics.totalCollected)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
              হাতে পাওয়া টাকা (অগ্রিম + ডেলিভার্ড)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone (017...), or invoice #..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Clear History button */}
          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all order history? This cannot be undone.')) {
                  onClearAll();
                }
              }}
              className="text-xs text-slate-500 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors shrink-0"
            >
              Clear All History
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px] shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Orders (সব)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {statusCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>⏳ Pending (অপেক্ষমাণ)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatusFilter === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-800'
              }`}
            >
              {statusCounts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('shipped')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatusFilter === 'shipped'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span>🚚 Shipped (কুরিয়ারে)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatusFilter === 'shipped' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-800'
              }`}
            >
              {statusCounts.shipped}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatusFilter === 'delivered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>✅ Delivered (সম্পন্ন)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatusFilter === 'delivered' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-800'
              }`}
            >
              {statusCounts.delivered}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('returned')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatusFilter === 'returned'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>❌ Returned (রিটার্ন)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatusFilter === 'returned' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-800'
              }`}
            >
              {statusCounts.returned}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Saved Orders Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400 mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {searchQuery || selectedStatusFilter !== 'all'
                ? 'কোনো অর্ডার পাওয়া যায়নি (No matching orders found)'
                : 'এখনও কোনো অর্ডার সেভ করা হয়নি (No orders saved yet)'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedStatusFilter !== 'all'
                ? 'অনুগ্রহ করে সার্চ কীওয়ার্ড বা ফিল্টার পরিবর্তন করে দেখুন।'
                : 'এডিটর ট্যাবে গিয়ে যেকোনো ইনভয়েস তৈরি করে "Save Invoice to History" বাটনে ক্লিক করুন।'}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={onNavigateToEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <span>Go to Editor (অর্ডার তৈরি করুন)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Courier</th>
                  <th className="py-3 px-4">Total Bill</th>
                  <th className="py-3 px-4">COD Due</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredOrders.map((ord) => {
                  const subtotal = calculateSubtotal(ord.items);
                  const totals = calculateOrderTotals(
                    subtotal,
                    ord.deliveryCharge,
                    ord.advancePaid,
                    ord.discountType || 'fixed',
                    ord.discountValue || 0
                  );

                  const status = ord.status || 'pending';
                  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                  const phoneValidation = validateBDPhone(ord.customerPhone || '');
                  const waUrl = formatBDWhatsAppLink(
                    ord.customerPhone || '',
                    ord.customerName,
                    ord.invoiceNumber,
                    totals.codPayable
                  );

                  const courierMeta = COURIER_OPTIONS.find((c) => c.id === ord.courier);

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. Invoice & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {ord.invoiceNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyInvoice(ord.invoiceNumber)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            title="Copy invoice number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {ord.createdAt || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {ord.items.length} item(s) •{' '}
                          {ord.items.map((i) => i.name).filter(Boolean).slice(0, 2).join(', ') || 'General'}
                        </div>
                      </td>

                      {/* 2. Customer Name & Phone */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate">
                          {ord.customerName || '(Unnamed Customer)'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs text-slate-700">
                            {ord.customerPhone || 'N/A'}
                          </span>
                          {phoneValidation.operator && (
                            <span className="text-[9px] font-semibold px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {phoneValidation.operator}
                            </span>
                          )}
                        </div>
                        {ord.customerAddress && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[190px] mt-0.5" title={ord.customerAddress}>
                            📍 {ord.customerAddress}
                          </div>
                        )}
                      </td>

                      {/* 3. Courier */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            courierMeta?.bg || 'bg-slate-100 border-slate-200'
                          } ${courierMeta?.color || 'text-slate-800'}`}
                        >
                          <Truck className="w-3 h-3" />
                          <span>{ord.courier}</span>
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Charge: ৳{ord.deliveryCharge}
                        </div>
                      </td>

                      {/* 4. Total Bill */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatBDT(totals.totalWithDelivery)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Subtotal: ৳{totals.subtotal}
                          {totals.discountAmount > 0 && ` (-৳${totals.discountAmount})`}
                        </div>
                        {totals.advancePaid > 0 && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            Paid: ৳{totals.advancePaid} ({ord.advancePaymentMethod})
                          </div>
                        )}
                      </td>

                      {/* 5. COD Due */}
                      <td className="py-3.5 px-4 align-top">
                        <div
                          className={`font-black text-sm ${
                            totals.codPayable > 0 ? 'text-amber-800' : 'text-emerald-700'
                          }`}
                        >
                          {totals.codPayable > 0 ? (
                            `৳ ${totals.codPayable}`
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {totals.codPayable > 0 ? 'ক্যাশ অন ডেলিভারি' : 'সম্পূর্ণ পরিশোধিত'}
                        </div>
                      </td>

                      {/* 6. Status Dropdown */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="relative inline-block w-36">
                          <select
                            value={status}
                            onChange={(e) => {
                              const newStatus = e.target.value as OrderStatus;
                              onUpdateOrderStatus(ord.id, newStatus);
                              onShowToast(`Order ${ord.invoiceNumber} status set to ${newStatus.toUpperCase()}`, 'success');
                            }}
                            className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 ${statusInfo.selectClass}`}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="delivered">✅ Delivered</option>
                            <option value="returned">❌ Returned</option>
                          </select>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 pl-1">
                          {statusInfo.bangla}
                        </div>
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reload to Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectOrder(ord);
                              onShowToast(`Loaded ${ord.invoiceNumber} into order editor!`, 'info');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                            title="Reload order to editor form"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Reload to Edit</span>
                          </button>

                          {/* WhatsApp Call / Message */}
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden md:inline">WhatsApp</span>
                            </a>
                          ) : (
                            <button
                              disabled
                              className="px-2 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs opacity-50 cursor-not-allowed"
                              title="No valid BD phone"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Order */}
                          {confirmDeleteId === ord.id ? (
                            <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                              <span className="text-[10px] font-bold text-rose-700">Sure?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteOrder(ord.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(ord.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
