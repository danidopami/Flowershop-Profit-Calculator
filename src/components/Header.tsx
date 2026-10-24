import React from 'react';
import { BookmarkCheck, Database, Calculator, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'library' | 'catalog';
  setActiveTab: (tab: 'calculator' | 'library' | 'catalog') => void;
  savedCount: number;
  catalogCount: number;
  onNewRecipe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  catalogCount,
  onNewRecipe,
}) => {
  return (
    <div className="sticky top-3 z-40 max-w-6xl mx-auto px-3 sm:px-6">
      <header className="bg-white/75 backdrop-blur-xl border border-white/80 shadow-lg shadow-stone-900/5 rounded-full px-4 sm:px-6 py-2 flex items-center justify-between gap-4 transition-all">
        {/* Solelia Logo & Brand Name */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          onClick={() => setActiveTab('calculator')}
        >
          <img
            src="/assets/aistudio/Solelia_Logo_a5167299.png"
            alt="Soleliá"
            className="h-10 sm:h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col border-l border-stone-200/80 pl-3 py-0.5 leading-tight">
            <span className="text-xs sm:text-sm font-bold text-[#3b2828] tracking-tight">
              Bảng tính giá hoa
            </span>
            <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
              Tiệm hoa ấm áp
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Modern Pill Style */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Tab 1: Tính giá */}
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#3b2828] text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Tính giá</span>
          </button>

          {/* Tab 2: Mẫu (with Facebook-style notification badge) */}
          <button
            onClick={() => setActiveTab('library')}
            className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#3b2828] text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span className="relative">
              Mẫu
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-3.5 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs border-2 border-white animate-in zoom-in-50">
                  {savedCount}
                </span>
              )}
            </span>
          </button>

          {/* Tab 3: Giá sỉ (with Facebook-style notification badge) */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#3b2828] text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="relative">
              Giá sỉ
              {catalogCount > 0 && (
                <span className="absolute -top-1.5 -right-4 min-w-[17px] h-[17px] px-1 bg-stone-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs border-2 border-white">
                  {catalogCount}
                </span>
              )}
            </span>
          </button>
        </nav>

        {/* Right Action Button - Dark rounded-full pill button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNewRecipe}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-[#251717] hover:bg-[#3d2727] rounded-full transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tạo mẫu mới</span>
          </button>
        </div>
      </header>
    </div>
  );
};
