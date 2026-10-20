import React from 'react';
import { BookmarkCheck, Database, Calculator, PlusCircle } from 'lucide-react';
import { SoleliaLogo } from './SoleliaLogo';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#eedfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-6">
          {/* Solelia Logo & Brand Presentation */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none py-1 group"
            onClick={() => setActiveTab('calculator')}
          >
            <img
              src="/assets/aistudio/Solelia_Logo_a5167299.png"
              alt="Soleliá"
              className="h-12 sm:h-14 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col border-l border-[#eedfd5] pl-3 py-0.5">
              <span
                className="text-sm sm:text-base font-bold tracking-wide text-[#5d3a3a] leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Bảng tính giá hoa
              </span>
              <span className="text-[10px] text-[#8c6b6b] tracking-wider uppercase font-medium">
                Kho Sỉ Trí Hải
              </span>
            </div>
          </div>

          {/* Navigation Tabs - Quiet Underline instead of filled dark pill */}
          <nav className="flex items-center gap-4 sm:gap-6 h-full">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 py-5 text-sm transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'calculator'
                  ? 'border-[#5d3a3a] text-[#5d3a3a] font-bold'
                  : 'border-transparent text-stone-500 hover:text-[#5d3a3a] font-medium'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Tính giá bó hoa</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-1.5 py-5 text-sm transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'library'
                  ? 'border-[#5d3a3a] text-[#5d3a3a] font-bold'
                  : 'border-transparent text-stone-500 hover:text-[#5d3a3a] font-medium'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Mẫu đã lưu ({savedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 py-5 text-sm transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'catalog'
                  ? 'border-[#5d3a3a] text-[#5d3a3a] font-bold'
                  : 'border-transparent text-stone-500 hover:text-[#5d3a3a] font-medium'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Giá kho sỉ ({catalogCount})</span>
            </button>
          </nav>

          {/* Single Subtle Secondary Action in Header */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNewRecipe}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5d3a3a] hover:bg-[#f9f4f0] rounded-xl transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-[#5d3a3a]" />
              <span className="hidden sm:inline">Tạo mẫu mới</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
