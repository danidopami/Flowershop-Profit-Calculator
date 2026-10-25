import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  Trash2,
  Copy,
  ArrowRight,
  Flower,
  Camera,
  Eye,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Info,
  Printer,
  Check,
  Upload,
  ImageIcon,
} from 'lucide-react';
import { SavedRecipe, RecipeItem } from '../types';
import { formatVND } from '../utils/calculator';
import { SoleliaLogo } from './SoleliaLogo';
import { PRESET_BOUQUET_PHOTOS } from '../data/presetRecipes';

export interface RecipeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: SavedRecipe[];
  onLoadRecipe: (recipe: SavedRecipe) => void;
  onDeleteRecipe: (id: string) => void;
  onDuplicateRecipe: (recipe: SavedRecipe) => void;
  onUpdatePhoto?: (recipeId: string, newPhotoUrl: string) => void;
  onRestorePresets?: () => void;
}

export const RecipeLibraryModal: React.FC<RecipeLibraryModalProps> = ({
  isOpen,
  onClose,
  recipes,
  onLoadRecipe,
  onDeleteRecipe,
  onDuplicateRecipe,
  onUpdatePhoto,
  onRestorePresets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-desc' | 'price-asc' | 'stems-desc'>('newest');
  
  // Detail sheet state for viewing full recipe specification
  const [inspectingRecipe, setInspectingRecipe] = useState<SavedRecipe | null>(null);

  // Photo change modal state
  const [photoTargetRecipeId, setPhotoTargetRecipeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = [
    'Tất cả',
    'Bó hoa tươi',
    'Giỏ hoa để bàn',
    'Lẵng khai trương',
    'Hoa cưới cô dâu',
    'Bình hoa nghệ thuật',
  ];

  // Helper: calculate total stems across items
  const getTotalStems = (items: RecipeItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Helper: calculate raw flower cost
  const getRawFlowerCost = (items: RecipeItem[]) => {
    return items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  };

  // Filtering
  const filteredRecipes = recipes.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      r.items.some((i) => i.flowerName.toLowerCase().includes(term));
    const matchesCat =
      selectedCategory === 'Tất cả' ||
      r.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  // Sorting
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
    }
    if (sortBy === 'price-desc') {
      return (b.suggestedPrice || 0) - (a.suggestedPrice || 0);
    }
    if (sortBy === 'price-asc') {
      return (a.suggestedPrice || 0) - (b.suggestedPrice || 0);
    }
    if (sortBy === 'stems-desc') {
      return getTotalStems(b.items) - getTotalStems(a.items);
    }
    return 0;
  });

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && photoTargetRecipeId && onUpdatePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdatePhoto(photoTargetRecipeId, reader.result);
          setPhotoTargetRecipeId(null);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSelectPresetPhoto = (url: string) => {
    if (photoTargetRecipeId && onUpdatePhoto) {
      onUpdatePhoto(photoTargetRecipeId, url);
      setPhotoTargetRecipeId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#392A28]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="bg-[#FAF7F3] rounded-2xl max-w-5xl w-full border border-[#EAE1DA] shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#392A28] text-white px-6 py-4 flex items-center justify-between border-b border-[#392A28] shrink-0">
          <div className="flex items-center gap-3">
            <SoleliaLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title font-bold text-lg tracking-tight">Thư viện công thức cắm hoa Soleliá</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#B77E79]/30 text-[#EAE1DA] border border-[#B77E79]/40">
                  {recipes.length} mẫu đã lưu
                </span>
              </div>
              <p className="text-xs text-[#EAE1DA]/80">
                Kho định lượng cành hoa, kỹ thuật cắm và giá thành giúp thợ cắm đúng mẫu và đồng nhất chất lượng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRestorePresets && (
              <button
                type="button"
                onClick={onRestorePresets}
                title="Khôi phục các mẫu hoa tiêu chuẩn của tiệm"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#EAE1DA] hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mẫu chuẩn</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#EAE1DA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#EAE1DA] bg-white space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#92827C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mẫu theo tên bó hoa, loại hoa sử dụng hoặc ghi chú thợ cắm..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#FAF7F3] border border-[#EAE1DA] rounded-xl text-[#392A28] placeholder-[#92827C] focus:outline-none focus:ring-2 focus:ring-[#B77E79]/30 focus:border-[#B77E79]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs text-[#92827C] whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-[#FAF7F3] border border-[#EAE1DA] rounded-xl px-3 py-2 text-[#392A28] focus:outline-none focus:ring-2 focus:ring-[#B77E79]/30"
              >
                <option value="newest">Mới lưu nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-desc">Giá bán cao nhất</option>
                <option value="price-asc">Giá bán thấp nhất</option>
                <option value="stems-desc">Nhiều cành hoa nhất</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#392A28] text-white shadow-xs'
                    : 'bg-[#FAF7F3] text-[#92827C] border border-[#EAE1DA] hover:bg-[#F4E8E4] hover:text-[#392A28]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {sortedRecipes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#EAE1DA] rounded-2xl bg-white px-4">
              <Flower className="w-12 h-12 text-[#92827C] mx-auto mb-3 opacity-60" />
              <h4 className="font-serif-title text-base font-bold text-[#392A28]">
                Không tìm thấy mẫu hoa nào phù hợp
              </h4>
              <p className="text-xs text-[#92827C] mt-1 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'Tất cả'
                  ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.'
                  : 'Chưa có công thức nào được lưu. Bạn có thể khôi phục các mẫu có sẵn tiêu chuẩn của tiệm hoa.'}
              </p>
              {onRestorePresets && (
                <button
                  type="button"
                  onClick={onRestorePresets}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#B77E79] hover:bg-[#a66e69] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục mẫu tiêu chuẩn</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedRecipes.map((recipe) => {
                const totalStems = getTotalStems(recipe.items);
                const rawCost = getRawFlowerCost(recipe.items);
                const marginPercent = recipe.variables?.targetMarginPercent || 50;

                return (
                  <div
                    key={recipe.id}
                    className="bg-white border border-[#EAE1DA] rounded-2xl p-4 sm:p-5 hover:border-[#B77E79]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                  >
                    {/* Top Row: Photo, Title, Pricing */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        {/* Recipe Bouquet Photo */}
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#EAE1DA] shrink-0 bg-[#FAF7F3] group/photo shadow-xs">
                          {recipe.photoUrl ? (
                            <img
                              src={recipe.photoUrl}
                              alt={recipe.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#92827C] p-2 text-center">
                              <Flower className="w-6 h-6 mb-1 opacity-50 text-[#B77E79]" />
                              <span className="text-[9px] leading-tight text-[#92827C]">Chưa có ảnh</span>
                            </div>
                          )}

                          {/* Quick change photo button */}
                          {onUpdatePhoto && (
                            <button
                              type="button"
                              onClick={() => setPhotoTargetRecipeId(recipe.id)}
                              title="Cập nhật ảnh thành phẩm"
                              className="absolute inset-0 bg-[#392A28]/50 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium transition-opacity cursor-pointer"
                            >
                              <Camera className="w-4 h-4 mb-0.5" />
                              <span>Đổi ảnh</span>
                            </button>
                          )}
                        </div>

                        {/* Title, Category & Suggested Price */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-[#B77E79] bg-[#F4E8E4] border border-[#EAE1DA] px-2 py-0.5 rounded-md">
                              {recipe.category}
                            </span>
                            <span className="text-[10px] text-[#92827C] flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(recipe.savedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          <h4 className="font-serif-title font-bold text-base text-[#392A28] mt-1 line-clamp-1">
                            {recipe.name}
                          </h4>

                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="font-serif-title text-base font-bold text-[#392A28] tabular-nums">
                              {formatVND(recipe.suggestedPrice)}
                            </span>
                            <span className="text-[10px] text-[#7B8061] font-semibold px-1.5 py-0.5 rounded bg-[#7B8061]/10">
                              Lãi {marginPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Florist Description / Notes preview */}
                      {recipe.description && (
                        <p className="text-xs text-[#92827C] line-clamp-2 italic bg-[#FAF7F3]/70 px-2.5 py-1.5 rounded-lg border border-[#EAE1DA]/60">
                          "{recipe.description}"
                        </p>
                      )}

                      {/* Key Metrics Strip */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#FAF7F3] rounded-xl border border-[#EAE1DA] text-center text-xs">
                        <div>
                          <div className="text-[10px] text-[#92827C]">Số loại hoa</div>
                          <div className="font-bold text-[#392A28]">{recipe.items.length} loại</div>
                        </div>
                        <div className="border-x border-[#EAE1DA]">
                          <div className="text-[10px] text-[#92827C]">Tổng cành/bó</div>
                          <div className="font-bold text-[#392A28]">{totalStems} cành</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#92827C]">Tiền hoa gốc</div>
                          <div className="font-bold text-[#392A28] tabular-nums">{formatVND(rawCost)}</div>
                        </div>
                      </div>

                      {/* Flower Items Ingredients List Preview */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-[#392A28] uppercase tracking-wider flex items-center justify-between">
                          <span>Chi tiết định lượng ({recipe.items.length} loại hoa):</span>
                          <span className="text-[10px] text-[#92827C] normal-case font-normal">
                            Đã tính giá sỉ
                          </span>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {recipe.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] text-[#92827C] hover:bg-[#FAF7F3] px-1.5 py-0.5 rounded"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#B77E79]/80 shrink-0" />
                                <span className="truncate text-[#392A28] font-medium">
                                  {item.flowerName}
                                </span>
                              </div>
                              <span className="font-semibold text-[#392A28] shrink-0 ml-2">
                                {item.quantity} {item.unitType}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions Bottom Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#EAE1DA] text-xs gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setInspectingRecipe(recipe)}
                          title="Xem phiếu công thức định lượng chi tiết cho thợ cắm"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[#392A28] bg-[#FAF7F3] hover:bg-[#F4E8E4] border border-[#EAE1DA] font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#B77E79]" />
                          <span>Chi tiết</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicateRecipe(recipe)}
                          title="Tạo bản sao mẫu này"
                          className="p-1.5 text-[#92827C] hover:text-[#392A28] hover:bg-[#FAF7F3] rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa mẫu "${recipe.name}"?`)) {
                              onDeleteRecipe(recipe.id);
                            }
                          }}
                          title="Xóa mẫu hoa"
                          className="p-1.5 text-[#92827C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadRecipe(recipe);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#392A28] hover:bg-[#251717] text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>Dùng mẫu</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#FAF7F3] border-t border-[#EAE1DA] text-xs text-[#92827C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#B77E79]" />
            <span>Mẹo: Florist có thể nhấn "Dùng mẫu" để nạp toàn bộ nguyên liệu vào bảng tính và tùy chỉnh đơn giá ngay.</span>
          </div>
          <span className="font-medium text-[#392A28]">{sortedRecipes.length} công thức hiển thị</span>
        </div>
      </div>

      {/* DETAILED RECIPE SHEET MODAL */}
      {inspectingRecipe && (
        <div className="fixed inset-0 z-60 bg-[#392A28]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#FAF7F3] rounded-2xl max-w-3xl w-full border border-[#EAE1DA] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Sheet Header */}
            <div className="bg-[#392A28] text-white px-6 py-4 flex items-center justify-between border-b border-[#392A28]">
              <div className="flex items-center gap-2">
                <SoleliaLogo size="sm" showText={false} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B77E79] text-white">
                      {inspectingRecipe.category}
                    </span>
                    <span className="text-xs text-[#EAE1DA]/70">
                      Phiếu công thức cắm hoa
                    </span>
                  </div>
                  <h3 className="font-serif-title font-bold text-lg text-white mt-0.5">
                    {inspectingRecipe.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 text-[#EAE1DA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="In phiếu công thức"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingRecipe(null)}
                  className="p-1.5 text-[#EAE1DA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sheet Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
              {/* Photo & Technical Notes Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                <div className="sm:col-span-4 rounded-xl overflow-hidden border border-[#EAE1DA] bg-[#FAF7F3] shadow-xs aspect-square">
                  {inspectingRecipe.photoUrl ? (
                    <img
                      src={inspectingRecipe.photoUrl}
                      alt={inspectingRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#92827C] p-4 text-center">
                      <Flower className="w-8 h-8 mb-2 opacity-50 text-[#B77E79]" />
                      <span className="text-xs">Chưa có ảnh thành phẩm</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-8 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FAF7F3] p-3 rounded-xl border border-[#EAE1DA]">
                      <div className="text-[#92827C] text-[11px]">Giá bán đề xuất</div>
                      <div className="font-serif-title text-lg font-bold text-[#392A28] tabular-nums mt-0.5">
                        {formatVND(inspectingRecipe.suggestedPrice)}
                      </div>
                    </div>
                    <div className="bg-[#FAF7F3] p-3 rounded-xl border border-[#EAE1DA]">
                      <div className="text-[#92827C] text-[11px]">Tổng giá vốn (COGS)</div>
                      <div className="font-serif-title text-lg font-bold text-[#392A28] tabular-nums mt-0.5">
                        {formatVND(inspectingRecipe.totalCost)}
                      </div>
                    </div>
                  </div>

                  {inspectingRecipe.description && (
                    <div className="bg-[#FAF7F3] p-3.5 rounded-xl border border-[#EAE1DA] text-xs space-y-1">
                      <div className="font-semibold text-[#392A28] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#B77E79]" />
                        <span>Kỹ thuật cắm & Hướng dẫn florist:</span>
                      </div>
                      <p className="text-[#92827C] leading-relaxed">
                        {inspectingRecipe.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#92827C]">
                    <span>• Tổng cành hoa: <strong className="text-[#392A28]">{getTotalStems(inspectingRecipe.items)} cành</strong></span>
                    <span>• Số loại nguyên liệu: <strong className="text-[#392A28]">{inspectingRecipe.items.length} loại</strong></span>
                    <span>• Biên lợi nhuận: <strong className="text-[#7B8061]">{inspectingRecipe.variables?.targetMarginPercent || 50}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Itemized Ingredients Table */}
              <div className="space-y-2">
                <h4 className="font-serif-title text-sm font-bold text-[#392A28] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B77E79]" />
                  <span>Bảng định lượng chi tiết từng loài hoa</span>
                </h4>

                <div className="border border-[#EAE1DA] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F3] text-[#392A28] font-bold border-b border-[#EAE1DA]">
                      <tr>
                        <th className="py-2.5 px-3">STT</th>
                        <th className="py-2.5 px-3">Tên hoa / Nguyên liệu</th>
                        <th className="py-2.5 px-3">Xuất xứ</th>
                        <th className="py-2.5 px-3 text-center">Định lượng</th>
                        <th className="py-2.5 px-3 text-right">Đơn giá cành</th>
                        <th className="py-2.5 px-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE1DA]">
                      {inspectingRecipe.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-[#FAF7F3]/50">
                          <td className="py-2.5 px-3 text-[#92827C]">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#392A28]">
                            {item.flowerName}
                          </td>
                          <td className="py-2.5 px-3 text-[#92827C]">{item.origin}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#392A28]">
                            {item.quantity} {item.unitType}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#92827C] tabular-nums">
                            {formatVND(item.unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#392A28] tabular-nums">
                            {formatVND(item.totalCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#FAF7F3] font-bold border-t border-[#EAE1DA]">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-[#392A28]">
                          Tổng cộng ({getTotalStems(inspectingRecipe.items)} cành)
                        </td>
                        <td className="py-2.5 px-3 text-center text-[#392A28]">
                          {getTotalStems(inspectingRecipe.items)} cành
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#92827C]">
                          Tiền hoa:
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#B77E79] tabular-nums text-sm">
                          {formatVND(getRawFlowerCost(inspectingRecipe.items))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Packaging, Wastage, Labor Breakdown */}
              <div className="bg-[#FAF7F3] rounded-xl p-4 border border-[#EAE1DA] text-xs space-y-2">
                <div className="font-semibold text-[#392A28]">Chi phí phụ liệu & Sản xuất cấu thành:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#92827C]">
                  <div>
                    <span className="block text-[10px]">Tỉ lệ hao hụt hoa:</span>
                    <strong className="text-[#392A28]">{inspectingRecipe.variables?.wastagePercent || 5}%</strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">Giấy gói & Nơ ruy băng:</span>
                    <strong className="text-[#392A28]">{formatVND(inspectingRecipe.variables?.packagingCost || 30000)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">Công thợ cắm hoa:</span>
                    <strong className="text-[#392A28]">
                      {inspectingRecipe.variables?.laborCostType === 'percent'
                        ? `${inspectingRecipe.variables?.laborCostValue}% tiền hoa`
                        : formatVND(inspectingRecipe.variables?.laborCostValue || 0)}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">Chế độ định giá:</span>
                    <strong className="text-[#392A28]">
                      {inspectingRecipe.variables?.pricingMode === 'markup'
                        ? `Markup ${inspectingRecipe.variables?.markupFactor || 2.0}x`
                        : `Lợi nhuận ${inspectingRecipe.variables?.targetMarginPercent || 50}%`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Sheet Footer Actions */}
            <div className="p-4 sm:p-5 bg-[#FAF7F3] border-t border-[#EAE1DA] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectingRecipe(null)}
                className="px-4 py-2 text-xs font-semibold text-[#92827C] hover:text-[#392A28] rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                Đóng chi tiết
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadRecipe(inspectingRecipe);
                  setInspectingRecipe(null);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B77E79] hover:bg-[#a66e69] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Dùng mẫu này để cắm ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PHOTO PICKER / UPLOADER MODAL */}
      {photoTargetRecipeId && (
        <div className="fixed inset-0 z-70 bg-[#392A28]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F3] rounded-2xl max-w-md w-full border border-[#EAE1DA] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-serif-title font-bold text-base text-[#392A28]">
                Cập nhật ảnh thành phẩm
              </h4>
              <button
                type="button"
                onClick={() => setPhotoTargetRecipeId(null)}
                className="p-1 text-[#92827C] hover:text-[#392A28] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#92827C]">
              Tải lên ảnh chụp thực tế từ điện thoại/máy ảnh của tiệm hoặc chọn một ảnh mẫu hoa có sẵn:
            </p>

            {/* Direct Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-white border border-dashed border-[#B77E79] hover:bg-[#F4E8E4]/40 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#392A28] transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#B77E79]" />
              <span>Tải ảnh từ máy tính / điện thoại</span>
            </button>

            {/* Preset Photos Grid */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-[#92827C] uppercase tracking-wider">
                Hoặc chọn ảnh mẫu có sẵn:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_BOUQUET_PHOTOS.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetPhoto(photo.url)}
                    className="relative group rounded-xl overflow-hidden border border-[#EAE1DA] aspect-square hover:border-[#B77E79] transition-all cursor-pointer shadow-xs"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity p-1 text-center">
                      Chọn ảnh
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPhotoTargetRecipeId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#92827C] hover:text-[#392A28]"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
