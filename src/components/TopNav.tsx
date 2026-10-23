import React from 'react';
import {
  Store,
  Sparkles,
  RotateCcw,
  Download,
  Edit3,
  Eye,
  BarChart3,
} from 'lucide-react';
import { ShopProfile } from '../types';

export type MainTabType = 'editor' | 'receipt' | 'history';

interface TopNavProps {
  shop: ShopProfile;
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  onOpenShopSettings: () => void;
  onLoadSample: () => void;
  onResetOrder: () => void;
  onTriggerDownload: () => void;
  isDownloading: boolean;
  historyCount: number;
  codPayable: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  shop,
  activeTab,
  onChangeTab,
  onOpenShopSettings,
  onLoadSample,
  onResetOrder,
  onTriggerDownload,
  isDownloading,
  historyCount,
  codPayable,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              হ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  HishabBD
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 hidden sm:inline-block">
                  F-Commerce
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[120px] sm:max-w-[180px]">
                {shop.name || 'Setup your shop'}
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => onChangeTab('editor')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>1. Edit Order Info</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('receipt')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'receipt'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Live Receipt</span>
              {codPayable > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                  ৳{codPayable}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>3. Order History & Analytics (অর্ডার ও হিসাব)</span>
              {historyCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    activeTab === 'history'
                      ? 'bg-emerald-800 text-emerald-100'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions (Demo, Reset, Shop Setup, Download) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLoadSample}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-200"
              title="Load demo order"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo</span>
            </button>

            <button
              type="button"
              onClick={onResetOrder}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
              title="Start a new blank order"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={onOpenShopSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              title="Configure Shop Info"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Shop Setup</span>
            </button>

            <button
              type="button"
              onClick={onTriggerDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Saving...' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* Zone 4: Mobile Tab Bar (Visible on mobile/tablet screens < md) */}
        <div className="md:hidden flex items-center gap-1 pb-2 pt-0.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => onChangeTab('editor')}
            className={`flex-1 min-w-[105px] py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'editor'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>1. Edit Order</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('receipt')}
            className={`flex-1 min-w-[105px] py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'receipt'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>2. Live Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('history')}
            className={`flex-1 min-w-[140px] py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>3. Order History</span>
            {historyCount > 0 && (
              <span className="px-1 py-0.2 rounded-full text-[9px] bg-emerald-800 text-white">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
