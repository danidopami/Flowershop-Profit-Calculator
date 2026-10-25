import { Menu, Bell, Plus, BookmarkCheck } from 'lucide-react';

interface TopBarProps {
  onOpenMobileMenu?: () => void;
  onNewRecipe: () => void;
  onOpenLibrary?: () => void;
  savedCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  onNewRecipe,
  onOpenLibrary,
  savedCount,
}) => {
  return (
    <header className="h-16 border-b border-[#EAE1DA]/70 bg-[#FAF7F3]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#392A28] hover:bg-[#F4E8E4] rounded-lg transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenLibrary && (
          <button
            type="button"
            onClick={onOpenLibrary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#392A28] bg-white hover:bg-[#FAF7F3] border border-[#EAE1DA] rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Mở thư viện mẫu công thức hoa"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#B77E79]" />
            <span className="hidden sm:inline">Thư viện mẫu</span>
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#B77E79] text-white rounded-full">
              {savedCount}
            </span>
          </button>
        )}

        {/* Quick New Recipe Button */}
        <button
          type="button"
          onClick={onNewRecipe}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B77E79] hover:bg-[#9E6965] rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tạo mẫu mới</span>
        </button>

        {/* User Profile matching reference */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#EAE1DA] cursor-pointer group">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#EAE1DA] shadow-2xs shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Daniel Bui"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-[#392A28] group-hover:text-[#B77E79] transition-colors">
              Daniel Bui
            </span>
            <span className="text-[10px] text-[#92827C]">Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
};
