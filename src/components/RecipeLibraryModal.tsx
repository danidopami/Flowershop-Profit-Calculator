import React, { useState } from 'react';
import {
  X,
  BookmarkCheck,
  Search,
  Trash2,
  Copy,
  ArrowRight,
  Flower,
} from 'lucide-react';
import { SavedRecipe } from '../types';
import { formatVND } from '../utils/calculator';
import { SoleliaLogo } from './SoleliaLogo';

interface RecipeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: SavedRecipe[];
  onLoadRecipe: (recipe: SavedRecipe) => void;
  onDeleteRecipe: (id: string) => void;
  onDuplicateRecipe: (recipe: SavedRecipe) => void;
}

export const RecipeLibraryModal: React.FC<RecipeLibraryModalProps> = ({
  isOpen,
  onClose,
  recipes,
  onLoadRecipe,
  onDeleteRecipe,
  onDuplicateRecipe,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  if (!isOpen) return null;

  const categories = [
    'Tất cả',
    'Bó hoa tươi',
    'Giỏ hoa để bàn',
    'Lẵng khai trương',
    'Hoa cưới cô dâu',
    'Bình hoa nghệ thuật',
  ];

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.items.some((i) =>
        i.flowerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCat =
      selectedCategory === 'Tất cả' ||
      r.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#392A28]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF7F3] rounded-2xl max-w-4xl w-full border border-[#EAE1DA] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#392A28] text-white px-6 py-4 flex items-center justify-between border-b border-[#392A28]">
          <div className="flex items-center gap-3">
            <SoleliaLogo size="sm" showText={false} />
            <div>
              <h3 className="font-serif-title font-bold text-lg tracking-tight">Thư viện công thức mẫu hoa Soleliá</h3>
              <p className="text-xs text-[#EAE1DA]/80">
                Lưu trữ định lượng cành hoa giúp nhân viên cắm đúng mẫu và đồng nhất giá bán
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#EAE1DA] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#EAE1DA] bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#92827C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mẫu theo tên hoặc loài hoa đã sử dụng..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#FAF7F3] border border-[#EAE1DA] rounded-xl text-[#392A28] placeholder-[#92827C] focus:outline-none focus:ring-2 focus:ring-[#B77E79]/30 focus:border-[#B77E79]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
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
        </div>

        {/* Recipe Cards List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#EAE1DA] rounded-2xl bg-white">
              <Flower className="w-10 h-10 text-[#92827C] mx-auto mb-2" />
              <p className="font-semibold text-[#392A28]">Chưa tìm thấy mẫu hoa nào</p>
              <p className="text-xs text-[#92827C] mt-1">
                Hãy quay lại trang tính giá và bấm "Lưu mẫu" để tạo công thức mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white border border-[#EAE1DA] rounded-xl p-5 hover:border-[#B77E79]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {recipe.photoUrl && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#EAE1DA] shrink-0 bg-[#FAF7F3]">
                            <img
                              src={recipe.photoUrl}
                              alt={recipe.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-[11px] font-semibold text-[#B77E79] bg-[#F4E8E4] border border-[#EAE1DA] px-2 py-0.5 rounded-md">
                            {recipe.category}
                          </span>
                          <h4 className="font-serif-title font-bold text-base text-[#392A28] mt-1">
                            {recipe.name}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-[#92827C]">Giá đề nghị</div>
                        <div className="text-base font-bold text-[#392A28] tabular-nums">
                          {formatVND(recipe.suggestedPrice)}
                        </div>
                      </div>
                    </div>

                    {recipe.description && (
                      <p className="text-xs text-[#92827C] line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    {/* Flower Items List Summary */}
                    <div className="bg-[#FAF7F3] rounded-lg p-3 text-xs space-y-1 border border-[#EAE1DA]">
                      <div className="font-semibold text-[#392A28] text-[11px] uppercase tracking-wider">
                        Định lượng ({recipe.items.length} loại hoa):
                      </div>
                      <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                        {recipe.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-[#92827C] text-[11px]"
                          >
                            <span className="truncate max-w-[200px]">
                              • {item.flowerName}
                            </span>
                            <span className="font-semibold text-[#392A28]">
                              {item.quantity} {item.unitType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#EAE1DA] text-xs">
                    <span className="text-[#92827C] text-[11px]">
                      {new Date(recipe.savedAt).toLocaleDateString('vi-VN')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDuplicateRecipe(recipe)}
                        title="Tạo bản sao mẫu này"
                        className="p-1.5 text-[#92827C] hover:text-[#392A28] hover:bg-[#FAF7F3] rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteRecipe(recipe.id)}
                        title="Xóa mẫu hoa"
                        className="p-1.5 text-[#92827C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadRecipe(recipe);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#B77E79] hover:bg-[#a66e69] text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Dùng mẫu</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
