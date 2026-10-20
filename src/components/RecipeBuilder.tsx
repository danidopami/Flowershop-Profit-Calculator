import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Trash2,
  Flower,
  Layers,
  Camera,
  X,
  Sparkles,
} from 'lucide-react';
import { RecipeItem, WholesaleFlowerItem } from '../types';
import { formatVND } from '../utils/calculator';
import { ChatRecipeInput } from './ChatRecipeInput';
import { ChatRecipeSuggestionModal } from './ChatRecipeSuggestionModal';
import {
  SuggestedFlowerItem,
  ChatSuggestionResult,
} from '../utils/chatRecipeParser';

interface RecipeBuilderProps {
  recipeName: string;
  setRecipeName: (name: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  photoUrl?: string;
  setPhotoUrl: (url: string | undefined) => void;
  items: RecipeItem[];
  setItems: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  wholesaleCatalog: WholesaleFlowerItem[];
  rawFlowerCost: number;
  onLoadPreset: (presetId: string) => void;
  onItemDeletedWithUndo: (deletedItem: RecipeItem, index: number) => void;
}

const PRESET_BOUQUET_PHOTOS = [
  {
    name: 'Hoàng hôn mùa thu',
    url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Bó hồng vintage',
    url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Hoa cưới thanh lịch',
    url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tulip tươi tắn',
    url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80',
  },
];

export const RecipeBuilder: React.FC<RecipeBuilderProps> = ({
  recipeName,
  setRecipeName,
  category,
  setCategory,
  photoUrl,
  setPhotoUrl,
  items,
  setItems,
  wholesaleCatalog,
  rawFlowerCost,
  onLoadPreset,
  onItemDeletedWithUndo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [inputStrings, setInputStrings] = useState<{ [id: string]: string }>({});

  // Chat Recipe Suggestion State
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [chatSuggestionResult, setChatSuggestionResult] = useState<ChatSuggestionResult | null>(null);

  // Recently used flowers tracker
  const [recentFlowerIds, setRecentFlowerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('solelia_recent_flowers_v2');
      return saved
        ? JSON.parse(saved)
        : [
            'th-hong-ohara-vang',
            'th-cuc-mau-don-cam-dao-malaysia',
            'th-tulip-cam-orange-time-out-hl',
            'th-la-bac-to',
          ];
    } catch {
      return [
        'th-hong-ohara-vang',
        'th-cuc-mau-don-cam-dao-malaysia',
        'th-tulip-cam-orange-time-out-hl',
        'th-la-bac-to',
      ];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter flowers by name or Chinese characters (no origin filter)
  const filteredCatalog = wholesaleCatalog.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.originalChineseName && item.originalChineseName.includes(searchTerm)) ||
      item.category.toLowerCase().includes(term)
    );
  });

  // Recent items list when search is empty
  const recentFlowers = recentFlowerIds
    .map((id) => wholesaleCatalog.find((f) => f.id === id))
    .filter((f): f is WholesaleFlowerItem => f !== undefined);

  // Add flower item to recipe
  const handleAddFlower = (flower: WholesaleFlowerItem) => {
    const isSinglePack = flower.stemsPerPack <= 1;
    const defaultUnit = isSinglePack ? 'bó' : 'cành';
    const defaultQty = isSinglePack ? 1 : 5;
    const unitPrice = isSinglePack
      ? flower.packPrice
      : flower.unitPrice || Math.round(flower.packPrice / flower.stemsPerPack);

    // Update recents
    const updatedRecents = [flower.id, ...recentFlowerIds.filter((id) => id !== flower.id)].slice(0, 6);
    setRecentFlowerIds(updatedRecents);
    try {
      localStorage.setItem('solelia_recent_flowers', JSON.stringify(updatedRecents));
    } catch {}

    const existingIndex = items.findIndex((i) => i.flowerId === flower.id);
    let targetId = '';

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += defaultQty;
      updated[existingIndex].totalCost = Math.round(
        updated[existingIndex].quantity * updated[existingIndex].unitPrice
      );
      setItems(updated);
      targetId = updated[existingIndex].id;
    } else {
      const newItemId = `recipe-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      targetId = newItemId;
      const newItem: RecipeItem = {
        id: newItemId,
        flowerId: flower.id,
        flowerName: flower.name,
        origin: flower.origin,
        packSpecification: flower.packUnit,
        unitPrice,
        quantity: defaultQty,
        unitType: defaultUnit as 'cành' | 'bó',
        totalCost: Math.round(defaultQty * unitPrice),
      };
      setItems([...items, newItem]);
    }

    setSearchTerm('');
    setIsDropdownOpen(false);

    // Focus the added item's quantity input
    setTimeout(() => {
      quantityInputRefs.current[targetId]?.focus();
      quantityInputRefs.current[targetId]?.select();
    }, 100);
  };

  // Keyboard navigation for search dropdown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = searchTerm.trim() === '' && recentFlowers.length > 0 ? recentFlowers : filteredCatalog;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, list.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) => (prev - 1 + list.length) % Math.max(1, list.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list[highlightedIndex]) {
        handleAddFlower(list[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Switch unit between 'cành' and 'bó'
  const handleSwitchUnit = (id: string, newUnit: 'cành' | 'bó') => {
    const item = items.find((i) => i.id === id);
    if (!item || item.unitType === newUnit) return;

    const flower = wholesaleCatalog.find((f) => f.id === item.flowerId);
    const stemsPerPack = flower?.stemsPerPack && flower.stemsPerPack > 0 ? flower.stemsPerPack : 1;
    const packPrice = flower?.packPrice || item.unitPrice;
    const stemPrice = flower?.unitPrice || Math.round(packPrice / stemsPerPack);

    let newQuantity: number;
    let newUnitPrice: number;

    if (newUnit === 'bó') {
      newUnitPrice = packPrice;
      if (stemsPerPack > 1) {
        // Convert cành -> bó
        const rawPacks = item.quantity / stemsPerPack;
        newQuantity = Number.isInteger(rawPacks)
          ? rawPacks
          : Number(rawPacks.toFixed(2));
      } else {
        newQuantity = item.quantity;
      }
      if (newQuantity <= 0) newQuantity = 1;
    } else {
      // Convert bó -> cành
      newUnitPrice = stemPrice;
      if (stemsPerPack > 1) {
        newQuantity = Math.max(1, Math.round(item.quantity * stemsPerPack));
      } else {
        newQuantity = Math.max(1, Math.round(item.quantity));
      }
    }

    // Clear temporary typing buffer
    setInputStrings((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              unitType: newUnit,
              unitPrice: newUnitPrice,
              quantity: newQuantity,
              totalCost: Math.round(newQuantity * newUnitPrice),
            }
          : it
      )
    );
  };

  // Update item quantity safely without 0.05 snaps
  const handleUpdateQuantity = (id: string, newQty: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const isBranch = item.unitType === 'cành';
    const minVal = isBranch ? 1 : 0.1;
    const qty = Math.max(minVal, isBranch ? Math.round(newQty) : Math.round(newQty * 10) / 10);

    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              quantity: qty,
              totalCost: Math.round(qty * it.unitPrice),
            }
          : it
      )
    );
  };

  // Arrow key handling inside quantity input
  const handleQuantityKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string,
    currentQty: number,
    unitType: string
  ) => {
    const step = unitType === 'cành' ? 1 : 0.5;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleUpdateQuantity(id, currentQty + step);
      setInputStrings((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const minVal = unitType === 'cành' ? 1 : 0.1;
      handleUpdateQuantity(id, Math.max(minVal, currentQty - step));
      setInputStrings((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  // Remove flower row with Undo capability
  const handleRemoveItem = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index >= 0) {
      const deletedItem = items[index];
      setItems((prev) => prev.filter((item) => item.id !== id));
      onItemDeletedWithUndo(deletedItem, index);
    }
  };

  // Open suggestion modal with parsed flowers
  const handleOpenSuggestionModal = (result: ChatSuggestionResult) => {
    setChatSuggestionResult(result);
    setIsSuggestionModalOpen(true);
  };

  // Apply chat suggestions to recipe
  const handleApplyChatSuggestions = (
    selectedItems: SuggestedFlowerItem[],
    mode: 'replace' | 'append'
  ) => {
    if (selectedItems.length === 0) {
      setIsSuggestionModalOpen(false);
      return;
    }

    const newRecipeItems: RecipeItem[] = selectedItems.map((sug) => {
      const flower = sug.matchedFlower;
      const unitType = sug.unit;
      const qty = sug.count;
      const unitPrice = sug.unitPrice;

      return {
        id: `recipe-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        flowerId:
          flower?.id ||
          `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        flowerName: flower?.name || sug.flowerName,
        origin: flower?.origin || 'Nhập khẩu',
        packSpecification:
          flower?.packUnit || (unitType === 'bó' ? 'Bó' : 'Cành'),
        unitPrice,
        quantity: qty,
        unitType,
        totalCost: Math.round(qty * unitPrice),
      };
    });

    if (mode === 'replace') {
      setItems(newRecipeItems);
    } else {
      // Append mode: merge with existing items
      const updated = [...items];
      newRecipeItems.forEach((newItem) => {
        const existingIndex = updated.findIndex(
          (i) => i.flowerId === newItem.flowerId
        );
        if (existingIndex >= 0) {
          updated[existingIndex].quantity += newItem.quantity;
          updated[existingIndex].unitType = newItem.unitType;
          updated[existingIndex].unitPrice = newItem.unitPrice;
          updated[existingIndex].totalCost = Math.round(
            updated[existingIndex].quantity * newItem.unitPrice
          );
        } else {
          updated.push(newItem);
        }
      });
      setItems(updated);
    }

    setIsSuggestionModalOpen(false);

    // Auto fill recipe name if empty
    if (!recipeName.trim() && selectedItems.length > 0) {
      const mainFlower = selectedItems[0].flowerName;
      setRecipeName(`Bó hoa ${mainFlower}`);
    }
  };

  // Handle image upload from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoUrl(dataUrl);
      setShowPhotoPicker(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eedfd5] p-5 sm:p-7 shadow-xs space-y-6">
      {/* Recipe Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5d3a3a]"></span>
            <h2
              className="text-xl sm:text-2xl font-bold text-[#5d3a3a] tracking-tight font-title"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Công thức bó hoa
            </h2>
          </div>
        </div>

        {/* Chat / Natural Language Recipe Input */}
        <ChatRecipeInput
          wholesaleCatalog={wholesaleCatalog}
          onOpenSuggestionModal={handleOpenSuggestionModal}
        />

        {/* Recipe Meta Fields with Photo Thumbnail */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Photo Thumbnail */}
          <div className="relative shrink-0 flex flex-col items-center gap-1.5">
            {photoUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#eedfd5] group shadow-xs">
                <img
                  src={photoUrl}
                  alt={recipeName}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhotoPicker(true)}
                className="w-20 h-20 rounded-xl border border-dashed border-[#eedfd5] bg-[#f9f4f0] hover:bg-[#ebdcd3]/50 text-[#7c6363] hover:text-[#5d3a3a] flex flex-col items-center justify-center gap-1 text-[11px] transition-colors cursor-pointer"
                title="Thêm ảnh mẫu hoa"
              >
                <Camera className="w-5 h-5 text-[#7c6363]" />
                <span>Thêm ảnh</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6e5454] mb-1">
                Tên mẫu bó hoa
              </label>
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="VD: Bó hồng Ohara vintage..."
                className="w-full px-3.5 py-2 text-sm bg-[#f9f4f0] border border-[#eedfd5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5d3a3a] font-medium text-stone-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6e5454] mb-1">
                Kiểu thiết kế
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#f9f4f0] border border-[#eedfd5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5d3a3a] text-stone-800"
              >
                <option value="Bó hoa tươi">Bó hoa tươi</option>
                <option value="Giỏ hoa để bàn">Giỏ hoa để bàn</option>
                <option value="Lẵng khai trương">Lẵng khai trương</option>
                <option value="Hoa cưới cô dâu">Hoa cưới cô dâu</option>
                <option value="Bình hoa nghệ thuật">Bình hoa nghệ thuật</option>
              </select>
            </div>
          </div>
        </div>

        {/* Photo Selection Modal Drawer */}
        {showPhotoPicker && (
          <div className="p-4 bg-[#f9f4f0] border border-[#eedfd5] rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between font-semibold text-[#5d3a3a]">
              <span>Chọn ảnh bìa mẫu hoa</span>
              <button
                type="button"
                onClick={() => setShowPhotoPicker(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {PRESET_BOUQUET_PHOTOS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setPhotoUrl(p.url);
                    setShowPhotoPicker(false);
                  }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[#eedfd5] hover:border-[#5d3a3a] transition-all"
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-0.5 truncate px-1">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#eedfd5] flex items-center justify-between">
              <span className="text-stone-500">Hoặc tải ảnh từ thiết bị:</span>
              <label className="cursor-pointer px-3 py-1 bg-white hover:bg-stone-50 border border-[#eedfd5] rounded-lg text-[#5d3a3a] font-medium transition-colors">
                <span>Tải ảnh lên</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Search Input - Clean, Full-width, Fast (Country Origin Removed) */}
      <div className="space-y-3" ref={searchContainerRef}>
        <div className="relative">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7c6363]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Gõ tìm hoa theo tên (Ohara, Tulip, Mẫu đơn, Lá bạc...) hoặc nhấn Enter để thêm..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#f9f4f0] border border-[#eedfd5] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5d3a3a] text-stone-900 placeholder:text-stone-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-stone-400 hover:text-stone-600"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1.5 max-h-80 overflow-y-auto bg-white border border-[#eedfd5] rounded-xl shadow-xl divide-y divide-stone-100">
              {/* Recently Used Section */}
              {searchTerm.trim() === '' && recentFlowers.length > 0 && (
                <div className="p-2 bg-[#f9f4f0]/70 border-b border-[#eedfd5]">
                  <div className="px-2 py-1 text-[11px] font-bold text-[#7c6363] uppercase tracking-wider">
                    Hoa hay dùng
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1">
                    {recentFlowers.map((flower) => (
                      <button
                        key={`recent-${flower.id}`}
                        type="button"
                        onClick={() => handleAddFlower(flower)}
                        className="px-2.5 py-1.5 rounded-lg text-left bg-white border border-[#eedfd5] hover:border-[#5d3a3a] text-xs transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-stone-900 truncate">
                          {flower.name}
                        </span>
                        <span className="font-bold text-[#5d3a3a] ml-1 shrink-0 tabular-nums">
                          {formatVND(flower.unitPrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtered Search Results */}
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map((flower, idx) => (
                  <button
                    key={flower.id}
                    type="button"
                    onClick={() => handleAddFlower(flower)}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                      highlightedIndex === idx
                        ? 'bg-[#f9f4f0] text-[#5d3a3a]'
                        : 'hover:bg-stone-50 text-stone-900'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {flower.name}
                        </span>
                        {flower.originalChineseName && (
                          <span className="text-xs text-stone-400">
                            ({flower.originalChineseName})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500">
                        {flower.packUnit} · {formatVND(flower.packPrice)} / kiện
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <div className="text-sm font-bold text-[#5d3a3a] tabular-nums">
                        {formatVND(flower.unitPrice)}
                        <span className="text-xs font-normal text-stone-500 ml-1">
                          / cành
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-stone-500">
                  Không tìm thấy loại hoa nào khớp với từ khóa "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Flower Items Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#6e5454]">
          <span>Nguyên liệu đã chọn ({items.length} loại)</span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-stone-400 hover:text-rose-600 transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="border border-dashed border-[#eedfd5] rounded-xl p-8 text-center bg-[#f9f4f0]/60">
            <Flower className="w-8 h-8 text-[#a38f8f] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#5d3a3a]">
              Chưa có loại hoa nào trong công thức
            </p>
            <p className="text-xs text-[#7c6363] mt-1 max-w-sm mx-auto">
              Gõ tìm hoa hoặc bấm mẫu có sẵn ở trên để bắt đầu tính giá.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#eedfd5] rounded-xl">
            <table className="w-full text-left text-sm divide-y divide-[#eedfd5]">
              <thead className="bg-[#f9f4f0] text-xs font-semibold text-[#5d3a3a] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Tên hoa / Nguyên liệu</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3 text-center">Số lượng &amp; Đơn vị</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3e9e2] bg-white">
                {items.map((item) => {
                  const flower = wholesaleCatalog.find((f) => f.id === item.flowerId);
                  const displaySpecification = flower ? flower.packUnit : item.packSpecification;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f9f4f0]/40 transition-colors group"
                    >
                      {/* Flower Name & Specs (Single clean specification, origin removed) */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-900">
                          {item.flowerName}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 font-normal">
                          Quy cách: {displaySpecification}
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3 px-3 text-right text-xs sm:text-sm text-stone-700 tabular-nums font-medium">
                        {formatVND(item.unitPrice)}
                        <span className="text-[11px] text-stone-400 block font-normal">
                          /{item.unitType}
                        </span>
                      </td>

                      {/* Quantity & Unit Toggle [cành | bó] - Smooth typing without 0.05 bug */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <input
                            ref={(el) => {
                              quantityInputRefs.current[item.id] = el;
                            }}
                            type="number"
                            step={item.unitType === 'cành' ? '1' : '0.1'}
                            min={item.unitType === 'cành' ? '1' : '0.1'}
                            value={
                              inputStrings[item.id] !== undefined
                                ? inputStrings[item.id]
                                : item.quantity
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setInputStrings((prev) => ({ ...prev, [item.id]: val }));
                              if (val !== '' && !isNaN(Number(val))) {
                                const num = parseFloat(val);
                                if (num > 0) {
                                  handleUpdateQuantity(item.id, num);
                                }
                              }
                            }}
                            onBlur={() => {
                              const raw = inputStrings[item.id];
                              if (raw === undefined) return;
                              setInputStrings((prev) => {
                                const updated = { ...prev };
                                delete updated[item.id];
                                return updated;
                              });
                              const num = parseFloat(raw);
                              if (isNaN(num) || num <= 0) {
                                handleUpdateQuantity(item.id, item.unitType === 'cành' ? 1 : 1);
                              } else {
                                handleUpdateQuantity(item.id, num);
                              }
                            }}
                            onKeyDown={(e) =>
                              handleQuantityKeyDown(e, item.id, item.quantity, item.unitType)
                            }
                            className="w-16 py-1 px-2 text-center text-sm font-bold rounded-lg bg-stone-50 hover:bg-stone-100 focus:bg-white border border-[#eedfd5] focus:border-[#5d3a3a] focus:ring-1 focus:ring-[#5d3a3a] outline-none tabular-nums transition-colors text-stone-900"
                          />

                          {/* Unit Selector Toggle */}
                          <div className="inline-flex rounded-lg border border-[#eedfd5] bg-[#f9f4f0] p-0.5 text-xs font-medium">
                            <button
                              type="button"
                              onClick={() => handleSwitchUnit(item.id, 'cành')}
                              className={`px-2 py-0.5 rounded-md transition-colors ${
                                item.unitType === 'cành'
                                  ? 'bg-[#5d3a3a] text-white font-semibold shadow-xs'
                                  : 'text-[#6e5454] hover:text-[#5d3a3a]'
                              }`}
                            >
                              cành
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSwitchUnit(item.id, 'bó')}
                              className={`px-2 py-0.5 rounded-md transition-colors ${
                                item.unitType === 'bó'
                                  ? 'bg-[#5d3a3a] text-white font-semibold shadow-xs'
                                  : 'text-[#6e5454] hover:text-[#5d3a3a]'
                              }`}
                            >
                              bó
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Row Total Cost */}
                      <td className="py-3 px-3 text-right font-bold text-stone-900 tabular-nums">
                        {formatVND(item.totalCost)}
                      </td>

                      {/* Delete action */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Xóa loại hoa này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Raw Flower Cost Subtotal Bar */}
        <div className="bg-[#f9f4f0] border border-[#eedfd5] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5d3a3a]" />
            <span className="text-xs sm:text-sm font-semibold text-[#5d3a3a]">
              Tổng tiền hoa thô:
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#5d3a3a] tabular-nums">
            {formatVND(rawFlowerCost)}
          </div>
        </div>
      </div>

      {/* Chat Recipe Suggestion Modal (Kho Trí Hải) */}
      <ChatRecipeSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        suggestionResult={chatSuggestionResult}
        wholesaleCatalog={wholesaleCatalog}
        onApplySuggestions={handleApplyChatSuggestions}
      />
    </div>
  );
};
