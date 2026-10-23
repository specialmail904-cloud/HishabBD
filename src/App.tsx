import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  RotateCcw,
  Store,
  Layers,
  HelpCircle,
  CheckCircle,
  Eye,
  Edit3,
} from 'lucide-react';

import { ShopProfile, OrderDetails, OrderItem, DeliveryPreset, PaymentMethod, OrderStatus } from './types';
import { DEFAULT_SHOP_PROFILE, SAMPLE_ORDERS } from './data/sampleData';
import { calculateSubtotal, calculateOrderTotals, generateInvoiceNumber } from './utils/calculator';

import { TopNav, MainTabType } from './components/TopNav';
import { ShopSetupModal } from './components/ShopSetupModal';
import { CustomerForm } from './components/CustomerForm';
import { ItemListEditor } from './components/ItemListEditor';
import { DeliveryAndPayment } from './components/DeliveryAndPayment';
import { LiveReceipt } from './components/LiveReceipt';
import { OrderHistoryView } from './components/OrderHistoryView';
import { ToastContainer, ToastMessage } from './components/Toast';

const STORAGE_KEY_SHOP = 'fcommerce_shop_profile_v1';
const STORAGE_KEY_HISTORY = 'fcommerce_order_history_v1';

export default function App() {
  // 1. Shop Setup State (LocalStorage)
  const [shop, setShop] = useState<ShopProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOP);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved shop profile:', e);
    }
    return DEFAULT_SHOP_PROFILE;
  });

  // 2. Order Details State
  const createNewEmptyOrder = (): OrderDetails => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    return {
      id: `ord-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      createdAt: dateFormatted,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      courier: 'Steadfast',
      items: [
        { id: `item-1`, name: '', quantity: 1, unitPrice: 0 },
      ],
      deliveryPreset: 'inside_dhaka',
      deliveryCharge: 70,
      discountType: 'fixed',
      discountValue: 0,
      advancePaid: 0,
      advancePaymentMethod: 'bKash',
      advanceTrxId: '',
      notes: '',
      status: 'pending',
    };
  };

  const [order, setOrder] = useState<OrderDetails>(() => {
    // Start with a clean realistic sample so user can immediately see the receipt working!
    return SAMPLE_ORDERS[0].order;
  });

  // 3. Saved Orders History State (LocalStorage)
  const [orderHistory, setOrderHistory] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse history:', e);
    }
    return SAMPLE_ORDERS.map((s) => s.order);
  });

  // 4. Main Navigation Tab State
  const [activeTab, setActiveTab] = useState<MainTabType>('editor');

  // Modals & UI View State
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ref for html2canvas export
  const receiptCardRef = useRef<HTMLDivElement | null>(null);

  // Sync Shop Profile to LocalStorage
  const handleSaveShop = (updated: ShopProfile) => {
    setShop(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(updated));
      addToast('Shop details saved successfully!', 'success');
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  // Sync Order History to LocalStorage
  const saveOrderToHistory = (orderToSave: OrderDetails) => {
    const withStatus: OrderDetails = {
      ...orderToSave,
      status: orderToSave.status || 'pending',
    };

    setOrderHistory((prev) => {
      const filtered = prev.filter((o) => o.id !== withStatus.id);
      const updated = [withStatus, ...filtered].slice(0, 50); // limit to latest 50
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
    setOrderHistory((prev) => {
      const updated = prev.map((ord) => (ord.id === id ? { ...ord, status } : ord));
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });

    // Also update active form order if matching
    if (order.id === id) {
      setOrder((prev) => ({ ...prev, status }));
    }
  };

  const handleDeleteHistoryOrder = (id: string) => {
    setOrderHistory((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });
    addToast('Order removed from history.', 'info');
  };

  const handleClearAllHistory = () => {
    setOrderHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.error('Storage error:', e);
    }
    addToast('History cleared.', 'info');
  };

  // Toast Helpers
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Order update handlers
  const handleUpdateOrder = (patch: Partial<OrderDetails>) => {
    setOrder((prev) => {
      const updated = { ...prev, ...patch };
      return updated;
    });
  };

  const handleItemsChange = (items: OrderItem[]) => {
    setOrder((prev) => ({ ...prev, items }));
  };

  const handleDeliveryChange = (preset: DeliveryPreset, charge: number) => {
    setOrder((prev) => ({
      ...prev,
      deliveryPreset: preset,
      deliveryCharge: charge,
    }));
  };

  const handleAdvanceChange = (advance: number) => {
    setOrder((prev) => ({ ...prev, advancePaid: advance }));
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setOrder((prev) => ({ ...prev, advancePaymentMethod: method }));
  };

  // Auto-calculated Financials
  const calculations = useMemo(() => {
    const subtotal = calculateSubtotal(order.items);
    return calculateOrderTotals(
      subtotal,
      order.deliveryCharge,
      order.advancePaid,
      order.discountType || 'fixed',
      order.discountValue || 0
    );
  }, [
    order.items,
    order.deliveryCharge,
    order.advancePaid,
    order.discountType,
    order.discountValue,
  ]);

  // Quick Action: Reset Order Form
  const handleResetOrder = () => {
    const newOrder = createNewEmptyOrder();
    setOrder(newOrder);
    setActiveTab('editor');
    addToast('New invoice created! Ready for new order.', 'info');
  };

  // Quick Action: Load Sample Order
  const handleLoadSample = () => {
    const sample = SAMPLE_ORDERS[Math.floor(Math.random() * SAMPLE_ORDERS.length)].order;
    setOrder({
      ...sample,
      id: `ord-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
    });
    setActiveTab('editor');
    addToast('Loaded demo order template!', 'success');
  };

  // Trigger Download from Top Bar button
  const handleTriggerDownload = () => {
    saveOrderToHistory(order);
    if (activeTab === 'history') {
      setActiveTab('receipt');
    }
    // Give state tick to render, then click download in LiveReceipt
    setTimeout(() => {
      const downloadBtn = document.querySelector('[data-download-receipt-btn]') as HTMLButtonElement;
      if (downloadBtn) {
        downloadBtn.click();
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* 1. Header / TopNav with 3 Tabs */}
      <TopNav
        shop={shop}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenShopSettings={() => setIsShopModalOpen(true)}
        onLoadSample={handleLoadSample}
        onResetOrder={handleResetOrder}
        onTriggerDownload={handleTriggerDownload}
        isDownloading={isDownloading}
        historyCount={orderHistory.length}
        codPayable={calculations.codPayable}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* TAB 3: ORDER HISTORY & ANALYTICS DASHBOARD */}
        {activeTab === 'history' ? (
          <OrderHistoryView
            orders={orderHistory}
            onSelectOrder={(selected) => {
              setOrder(selected);
              setActiveTab('editor');
            }}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteHistoryOrder}
            onClearAll={handleClearAllHistory}
            onNavigateToEditor={() => setActiveTab('editor')}
            onShowToast={addToast}
          />
        ) : (
          /* TAB 1 & 2: INVOICE EDITOR & LIVE RECEIPT PREVIEW */
          <div>
            {/* Welcome / Tips Strip */}
            <div className="mb-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">
                    {shop.name ? `${shop.name} - Instant Receipt Maker` : 'F-Commerce Receipt Maker'}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Customer info, Pathao/Steadfast courier selection, COD auto-calc & 1-click Messenger image export.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsShopModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/20"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Change Shop Info</span>
                </button>
              </div>
            </div>

            {/* 2-Column Desktop Grid / Tabbed Mobile View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Input Forms (Customer, Items, BD Delivery & Payment) */}
              <div
                className={`space-y-6 ${
                  activeTab === 'editor' ? 'block lg:col-span-7' : 'hidden lg:block lg:col-span-7'
                }`}
              >
                {/* 1. Customer Details */}
                <CustomerForm order={order} onChange={handleUpdateOrder} />

                {/* 2. Dynamic Items List */}
                <ItemListEditor items={order.items} onChange={handleItemsChange} />

                {/* 3. BD Delivery & Payment Logic */}
                <DeliveryAndPayment
                  deliveryPreset={order.deliveryPreset}
                  deliveryCharge={order.deliveryCharge}
                  discountType={order.discountType || 'fixed'}
                  discountValue={order.discountValue || 0}
                  advancePaid={order.advancePaid}
                  advancePaymentMethod={order.advancePaymentMethod}
                  advanceTrxId={order.advanceTrxId || ''}
                  notes={order.notes || ''}
                  calculations={calculations}
                  onDeliveryChange={handleDeliveryChange}
                  onDiscountChange={(type, value) =>
                    handleUpdateOrder({ discountType: type, discountValue: value })
                  }
                  onAdvanceChange={handleAdvanceChange}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onTrxIdChange={(trxId) => handleUpdateOrder({ advanceTrxId: trxId })}
                  onNotesChange={(notes) => handleUpdateOrder({ notes })}
                />

                {/* Action Row: Save to History & View History */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        saveOrderToHistory(order);
                        addToast('Invoice saved to your history!', 'success');
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <span>💾 Save Invoice to History</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition-colors"
                    >
                      View Order History ({orderHistory.length}) →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('receipt')}
                    className="lg:hidden inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl"
                  >
                    <span>View Receipt Preview →</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Live Receipt Preview (Sticky) */}
              <div
                className={`${
                  activeTab === 'receipt'
                    ? 'block lg:col-span-5 lg:sticky lg:top-24'
                    : 'hidden lg:block lg:col-span-5 lg:sticky lg:top-24'
                }`}
              >
                <LiveReceipt
                  shop={shop}
                  order={order}
                  calculations={calculations}
                  onShowToast={addToast}
                  isDownloading={isDownloading}
                  setIsDownloading={setIsDownloading}
                  receiptRef={receiptCardRef}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      <ShopSetupModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        shop={shop}
        onSave={handleSaveShop}
      />

      {/* Hidden button for top nav to trigger LiveReceipt's download */}
      <button
        data-download-receipt-btn
        className="hidden"
        onClick={() => {
          const downloadBtn = document.querySelector('.receipt-capture-surface')
            ?.parentElement?.parentElement?.querySelector('button') as HTMLButtonElement;
          if (downloadBtn) {
            downloadBtn.click();
          }
        }}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Clean Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            HishabBD © {new Date().getFullYear()} — Made for Bangladeshi F-Commerce & Social Sellers
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Pathao & Steadfast Ready</span>
            <span>•</span>
            <span>bKash & Nagad Tracked</span>
            <span>•</span>
            <span>No Server Storage (100% Private LocalStorage)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
