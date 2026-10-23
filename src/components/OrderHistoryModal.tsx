import React from 'react';
import { X, Clock, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { OrderDetails } from '../types';
import { formatBDT } from '../utils/calculator';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderDetails[];
  onSelectOrder: (order: OrderDetails) => void;
  onDeleteOrder: (id: string) => void;
  onClearAll: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onDeleteOrder,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Saved Invoices & Orders</h2>
              <p className="text-xs text-slate-500">
                {orders.length} orders saved locally in your browser
              </p>
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

        {/* Orders list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">No saved orders yet</p>
              <p className="text-xs text-slate-400 mt-1">
                When you download or save a receipt, it will appear here for fast access.
              </p>
            </div>
          ) : (
            orders.map((ord) => {
              const subtotal = ord.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
              const cod = Math.max(0, subtotal + ord.deliveryCharge - ord.advancePaid);

              return (
                <div
                  key={ord.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {ord.invoiceNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {ord.customerName || 'Unnamed Customer'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({ord.customerPhone || 'No phone'})
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate max-w-md">
                      {ord.customerAddress || 'No address'}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>{ord.courier}</span>
                      </span>
                      <span>·</span>
                      <span>{ord.items.length} items</span>
                      <span>·</span>
                      <span>{ord.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        COD Payable
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-700">
                        {formatBDT(cod)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectOrder(ord);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteOrder(ord.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete order"
                        aria-label={`Delete order ${ord.invoiceNumber}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {orders.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Clear All Orders
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
