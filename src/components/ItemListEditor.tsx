import React from 'react';
import { Plus, Trash2, ShoppingBag, PlusCircle, Sparkles } from 'lucide-react';
import { OrderItem } from '../types';
import { PRODUCT_TEMPLATES } from '../data/sampleData';
import { formatBDT, calculateSubtotal } from '../utils/calculator';

interface ItemListEditorProps {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
}

export const ItemListEditor: React.FC<ItemListEditorProps> = ({ items, onChange }) => {
  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      // Keep at least one empty item row
      onChange([{ id: `item-${Date.now()}`, name: '', quantity: 1, unitPrice: 0 }]);
      return;
    }
    onChange(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<OrderItem>) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const handleAddPreset = (template: { name: string; price: number }) => {
    // If the first row is completely empty, replace it
    if (items.length === 1 && !items[0].name.trim() && items[0].unitPrice === 0) {
      onChange([
        {
          id: items[0].id,
          name: template.name,
          quantity: 1,
          unitPrice: template.price,
        },
      ]);
      return;
    }

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: template.name,
      quantity: 1,
      unitPrice: template.price,
    };
    onChange([...items, newItem]);
  };

  const subtotal = calculateSubtotal(items);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Products & Pricing</h2>
            <p className="text-xs text-slate-500">পণ্যের নাম, পরিমাণ ও ইউনিট মূল্য যোগ করুন</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500">Subtotal: </span>
          <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
            {formatBDT(subtotal)}
          </span>
        </div>
      </div>

      {/* Preset quick buttons */}
      <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Product Presets (জনপ্রিয় পণ্যসমূহ):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleAddPreset(tmpl)}
              className="text-xs px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3 text-slate-400" />
              <span>{tmpl.name}</span>
              <span className="font-mono text-emerald-700 font-medium">৳{tmpl.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {/* Header row for desktop */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 rounded-lg">
          <div className="col-span-6">Item Description (পণ্যের বিবরণ)</div>
          <div className="col-span-2 text-center">Qty (পরিমাণ)</div>
          <div className="col-span-2 text-right">Price (৳ মূল্য)</div>
          <div className="col-span-2 text-right">Total (৳ মোট)</div>
        </div>

        {items.map((item, index) => {
          const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);

          return (
            <div
              key={item.id}
              className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-colors"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Item Name */}
                <div className="sm:col-span-6 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 w-5 shrink-0 text-center">
                    {index + 1}.
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      placeholder="e.g. Cotton Embroidered Panjabi - Size L"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
                  <span className="sm:hidden text-xs text-slate-500 font-medium">Quantity:</span>
                  <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateItem(item.id, { quantity: Math.max(1, (item.quantity || 1) - 1) })
                      }
                      className="w-7 h-8 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        handleUpdateItem(item.id, { quantity: isNaN(val) ? 0 : Math.max(0, val) });
                      }}
                      className="w-12 text-center text-sm py-1 font-mono font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateItem(item.id, { quantity: (item.quantity || 0) + 1 })
                      }
                      className="w-7 h-8 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                  <span className="sm:hidden text-xs text-slate-500 font-medium">Unit Price:</span>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-slate-400">
                      ৳
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice === 0 ? '' : item.unitPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleUpdateItem(item.id, { unitPrice: isNaN(val) ? 0 : Math.max(0, val) });
                      }}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Line Total & Remove */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                  <span className="sm:hidden text-xs text-slate-500 font-medium">Total:</span>
                  <span className="text-sm font-bold text-slate-800 font-mono tabular-nums text-right">
                    ৳{lineTotal.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                    title="Remove item"
                    aria-label={`Remove ${item.name || 'item'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Row Button */}
      <div className="mt-4 flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition-colors border border-emerald-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Another Product (+ পণ্য যোগ করুন)</span>
        </button>

        <span className="text-xs text-slate-500">
          Total Items: <strong className="text-slate-800">{items.length}</strong>
        </span>
      </div>
    </div>
  );
};
