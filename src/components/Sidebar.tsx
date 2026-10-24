import React from 'react';
import {
  Calculator,
  BookmarkCheck,
  Flower2,
  SlidersHorizontal,
  PlusCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'calculator' | 'library' | 'catalog';
  setActiveTab: (tab: 'calculator' | 'library' | 'catalog') => void;
  savedCount: number;
  catalogCount: number;
  onNewRecipe: () => void;
  onOpenCostSliders?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  catalogCount,
  onNewRecipe,
  onOpenCostSliders,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'calculator',
      label: 'Tính giá',
      icon: Calculator,
      onClick: () => {
        setActiveTab('calculator');
        onCloseMobile?.();
      },
      isActive: activeTab === 'calculator',
    },
    {
      id: 'library',
      label: 'Mẫu',
      icon: BookmarkCheck,
      badge: savedCount,
      onClick: () => {
        setActiveTab('library');
        onCloseMobile?.();
      },
      isActive: activeTab === 'library',
    },
    {
      id: 'catalog',
      label: 'Giá hoa',
      icon: Flower2,
      badge: catalogCount,
      onClick: () => {
        setActiveTab('catalog');
        onCloseMobile?.();
      },
      isActive: activeTab === 'catalog',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF7F3] border-r border-[#EAE1DA] select-none">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-[#EAE1DA]/60">
        <div
          onClick={() => {
            setActiveTab('calculator');
            onCloseMobile?.();
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/assets/aistudio/Solelia_Logo_a5167299.png"
            alt="Solelia"
            className="h-10 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-serif-title text-base font-bold tracking-wider text-[#392A28] uppercase leading-tight">
              Solelia
            </span>
            <span className="text-[10px] text-[#92827C] tracking-wide font-medium">
              Tiệm Hoa Ấm Áp
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-[#92827C] hover:text-[#392A28] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#F4E8E4] text-[#392A28] shadow-2xs'
                  : 'text-[#92827C] hover:text-[#392A28] hover:bg-[#F2ECE6]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    active ? 'text-[#B77E79]' : 'text-[#92827C]'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none ${
                    item.id === 'library'
                      ? 'bg-[#B77E79] text-white'
                      : 'bg-[#EAE1DA] text-[#392A28]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Romantic Botanical Sidebar Footer */}
      <div className="p-6 pt-4 border-t border-[#EAE1DA]/60 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <p
            className="italic text-sm text-[#92827C] leading-snug"
          >
            "Tiệm hoa nhỏ của 2 người iu nhau"
          </p>
          <span className="text-[10px] text-[#B77E79] tracking-wider uppercase font-medium block">
            Solelia - Tiệm Hoa Ấm Áp
          </span>
        </div>

        {/* Delicate subtle floral watermark */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 pointer-events-none text-[#B77E79]">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C60 25 75 40 100 50 C75 60 60 75 50 100 C40 75 25 60 0 50 C25 40 40 25 50 0 Z" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Slim Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
