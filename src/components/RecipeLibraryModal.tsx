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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#f9f4f0] rounded-2xl max-w-4xl w-full border border-[#eedfd5] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#5d3a3a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SoleliaLogo size="sm" showText={false} />
            <div>
              <h3 className="font-bold text-base">Thư viện công thức mẫu hoa Soleliá</h3>
              <p className="text-xs text-[#eedfd5]">
                Lưu trữ định lượng cành hoa giúp nhân viên cắm đúng mẫu và đồng nhất giá bán
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#eedfd5] hover:text-white rounded-lg hover:bg-[#4a2e2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#eedfd5] bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#7c6363]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mẫu theo tên hoặc loài hoa đã sử dụng..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#f9f4f0] border border-[#eedfd5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5d3a3a]/20 focus:border-[#5d3a3a]"
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
                      ? 'bg-[#5d3a3a] text-white shadow-xs'
                      : 'bg-[#f9f4f0] text-[#6e5454] border border-[#eedfd5] hover:bg-[#ebdcd3]'
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
            <div className="text-center py-12 border border-dashed border-[#eedfd5] rounded-2xl bg-white">
              <Flower className="w-10 h-10 text-[#a38f8f] mx-auto mb-2" />
              <p className="font-semibold text-[#5d3a3a]">Chưa tìm thấy mẫu hoa nào</p>
              <p className="text-xs text-[#7c6363] mt-1">
                Hãy quay lại trang tính giá và bấm "Lưu mẫu" để tạo công thức mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white border border-[#eedfd5] rounded-xl p-5 hover:border-[#5d3a3a]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {recipe.photoUrl && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#eedfd5] shrink-0 bg-stone-100">
                            <img
                              src={recipe.photoUrl}
                              alt={recipe.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-[11px] font-semibold text-[#5d3a3a] bg-[#f9f4f0] border border-[#eedfd5] px-2 py-0.5 rounded-md">
                            {recipe.category}
                          </span>
                          <h4 className="font-title font-bold text-base text-stone-900 mt-1">
                            {recipe.name}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-stone-500">Giá đề nghị</div>
                        <div className="text-base font-bold text-[#5d3a3a] tabular-nums">
                          {formatVND(recipe.suggestedPrice)}
                        </div>
                      </div>
                    </div>

                    {recipe.description && (
                      <p className="text-xs text-stone-600 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    {/* Flower Items List Summary */}
                    <div className="bg-[#f9f4f0] rounded-lg p-3 text-xs space-y-1 border border-[#eedfd5]">
                      <div className="font-semibold text-[#5d3a3a] text-[11px] uppercase tracking-wider">
                        Định lượng ({recipe.items.length} loại hoa):
                      </div>
                      <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                        {recipe.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-stone-600 font-mono text-[11px]"
                          >
                            <span className="truncate max-w-[200px]">
                              • {item.flowerName}
                            </span>
                            <span className="font-semibold text-stone-900">
                              {item.quantity} {item.unitType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#eedfd5] text-xs">
                    <span className="text-stone-400 font-mono text-[11px]">
                      {new Date(recipe.savedAt).toLocaleDateString('vi-VN')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDuplicateRecipe(recipe)}
                        title="Tạo bản sao mẫu này"
                        className="p-1.5 text-stone-500 hover:text-[#5d3a3a] hover:bg-[#f9f4f0] rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteRecipe(recipe.id)}
                        title="Xóa mẫu hoa"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadRecipe(recipe);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#5d3a3a] hover:bg-[#4a2e2e] text-white font-medium rounded-lg transition-colors"
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
