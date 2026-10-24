import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Trash2,
  Flower2,
  Plus,
  Minus,
  Sparkles,
  X,
  MessageSquare,
  Send,
  Loader2,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  BookmarkPlus,
  Camera,
  ImageIcon,
  Maximize2,
} from 'lucide-react';
import { RecipeItem, WholesaleFlowerItem } from '../types';
import { formatVND } from '../utils/calculator';
import { getFlowerThumbnail } from '../utils/flowerThumbnails';
import { ChatRecipeSuggestionModal } from './ChatRecipeSuggestionModal';
import {
  SuggestedFlowerItem,
  ChatSuggestionResult,
  parseChatRecipe,
} from '../utils/chatRecipeParser';

interface RecipeBuilderProps {
  recipeName: string;
  setRecipeName: (name: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  photoUrl?: string;
  setPhotoUrl: (url: string | undefined) => void;
  orderQuantity: number;
  setOrderQuantity: (qty: number) => void;
  items: RecipeItem[];
  setItems: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  wholesaleCatalog: WholesaleFlowerItem[];
  rawFlowerCost: number;
  onLoadPreset: (presetId: string) => void;
  onItemDeletedWithUndo: (deletedItem: RecipeItem, index: number) => void;
  onSaveRecipe?: () => void;
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
  orderQuantity,
  setOrderQuantity,
  items,
  setItems,
  wholesaleCatalog,
  rawFlowerCost,
  onLoadPreset,
  onItemDeletedWithUndo,
  onSaveRecipe,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [inputStrings, setInputStrings] = useState<{ [id: string]: string }>({});

  // Chat Recipe Suggestion State
  const [chatPrompt, setChatPrompt] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [chatSuggestionResult, setChatSuggestionResult] = useState<ChatSuggestionResult | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // Filter flowers by name or Chinese characters
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
  const handleAddFlower = (flower: WholesaleFlowerItem, customQty?: number, customUnit?: 'cành' | 'bó') => {
    const isSinglePack = flower.stemsPerPack <= 1;
    const defaultUnit = customUnit || (isSinglePack ? 'bó' : 'cành');
    const defaultQty = customQty !== undefined ? customQty : 1;
    const unitPrice =
      defaultUnit === 'bó'
        ? flower.packPrice
        : flower.unitPrice || Math.round(flower.packPrice / (flower.stemsPerPack || 1));

    // Update recents
    const updatedRecents = [flower.id, ...recentFlowerIds.filter((id) => id !== flower.id)].slice(0, 6);
    setRecentFlowerIds(updatedRecents);
    try {
      localStorage.setItem('solelia_recent_flowers_v2', JSON.stringify(updatedRecents));
    } catch {}

    const existingIndex = items.findIndex((i) => i.flowerId === flower.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += defaultQty;
      updated[existingIndex].totalCost = Math.round(
        updated[existingIndex].quantity * updated[existingIndex].unitPrice
      );
      setItems(updated);
    } else {
      const newItem: RecipeItem = {
        id: `recipe-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        flowerId: flower.id,
        flowerName: flower.name,
        origin: flower.origin,
        packSpecification: flower.packUnit,
        unitPrice,
        quantity: defaultQty,
        unitType: defaultUnit,
        totalCost: Math.round(defaultQty * unitPrice),
      };
      setItems((prev) => [...prev, newItem]);
    }

    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  // Add item from search
  const handleTopAddClick = () => {
    if (searchTerm.trim() && filteredCatalog.length > 0) {
      handleAddFlower(filteredCatalog[0]);
    } else {
      searchInputRef.current?.focus();
      setIsDropdownOpen(true);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validQty = Math.max(0.1, isNaN(qty) ? 1 : qty);
          return {
            ...item,
            quantity: validQty,
            totalCost: Math.round(validQty * item.unitPrice),
          };
        }
        return item;
      })
    );
  };

  // Switch unit type (cành vs bó)
  const handleSwitchUnit = (id: string, newUnit: 'cành' | 'bó') => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const flower = wholesaleCatalog.find((f) => f.id === item.flowerId);
          let newUnitPrice = item.unitPrice;

          if (flower) {
            if (newUnit === 'bó') {
              newUnitPrice = flower.packPrice;
            } else {
              newUnitPrice =
                flower.unitPrice ||
                Math.round(flower.packPrice / (flower.stemsPerPack || 1));
            }
          }

          return {
            ...item,
            unitType: newUnit,
            unitPrice: newUnitPrice,
            totalCost: Math.round(item.quantity * newUnitPrice),
          };
        }
        return item;
      })
    );
  };

  // Remove flower with undo tracking
  const handleRemoveItem = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) {
      const deletedItem = items[index];
      setItems((prev) => prev.filter((item) => item.id !== id));
      onItemDeletedWithUndo(deletedItem, index);
    }
  };

  // Natural Language Chat Submission
  const handleSendChatPrompt = async () => {
    const text = chatPrompt.trim();
    if (!text) return;

    setIsChatProcessing(true);

    try {
      const res = await fetch('/api/gemini/parse-recipe-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          catalogFlowers: wholesaleCatalog.slice(0, 160).map((f) => ({
            id: f.id,
            name: f.name,
            packPrice: f.packPrice,
            packUnit: f.packUnit,
            stemsPerPack: f.stemsPerPack,
            unitPrice: f.unitPrice,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const mappedItems: SuggestedFlowerItem[] = data.items.map((it: any, idx: number) => {
            let matched: WholesaleFlowerItem | undefined;
            if (it.catalogFlowerId) {
              matched = wholesaleCatalog.find((f) => f.id === it.catalogFlowerId);
            }
            if (!matched && it.flowerName) {
              const lower = it.flowerName.toLowerCase().trim();
              matched = wholesaleCatalog.find(
                (f) =>
                  f.name.toLowerCase().trim() === lower ||
                  f.name.toLowerCase().includes(lower) ||
                  lower.includes(f.name.toLowerCase())
              );
            }

            const unit: 'cành' | 'bó' = it.unit === 'cành' ? 'cành' : 'bó';
            let unitPrice = 100000;
            if (matched) {
              unitPrice =
                unit === 'bó'
                  ? matched.packPrice
                  : matched.unitPrice ||
                    Math.round(matched.packPrice / (matched.stemsPerPack || 1));
            }

            const count = typeof it.count === 'number' && it.count > 0 ? it.count : 1;
            const totalPrice = Math.round(count * unitPrice);

            return {
              id: `chat-sug-${idx}-${Date.now()}`,
              rawInputText: it.rawText || it.flowerName,
              catalogFlowerId: matched?.id || it.catalogFlowerId || '',
              flowerName: matched?.name || it.flowerName,
              count,
              unit,
              unitPrice,
              totalPrice,
              selected: true,
              matchType: (matched ? 'exact' : 'unmatched') as any,
              matchedFlower: matched,
              note: it.note || (matched ? 'Khớp Kho Trí Hải' : 'Ngoài kho'),
            };
          });

          const totalEstimatedCost = mappedItems.reduce((sum, it) => sum + it.totalPrice, 0);
          const totalStems = mappedItems.reduce((sum, it) => {
            if (it.unit === 'cành') return sum + it.count;
            const stems = it.matchedFlower?.stemsPerPack || 10;
            return sum + it.count * stems;
          }, 0);

          setChatSuggestionResult({
            rawPrompt: text,
            items: mappedItems,
            totalEstimatedCost,
            totalStems,
          });
          setIsSuggestionModalOpen(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Server parse failed, falling back to local NLP:', e);
    } finally {
      setIsChatProcessing(false);
    }

    // Local fallback parser
    const localResult = parseChatRecipe(text, wholesaleCatalog);
    setChatSuggestionResult(localResult);
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
        flowerId: flower?.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        flowerName: flower?.name || sug.flowerName,
        origin: flower?.origin || 'Nhập khẩu',
        packSpecification: flower?.packUnit || (unitType === 'bó' ? 'Bó' : 'Cành'),
        unitPrice,
        quantity: qty,
        unitType,
        totalCost: Math.round(qty * unitPrice),
      };
    });

    if (mode === 'replace') {
      setItems(newRecipeItems);
    } else {
      const updated = [...items];
      newRecipeItems.forEach((newItem) => {
        const existingIndex = updated.findIndex((i) => i.flowerId === newItem.flowerId);
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
    if (!recipeName.trim() && selectedItems.length > 0) {
      setRecipeName(`Bó hoa ${selectedItems[0].flowerName}`);
    }
  };

  // AI Image Analysis Submission
  const handleAnalyzeImage = async (file: File) => {
    setIsAnalyzingImage(true);
    try {
      // 1. Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;
      const base64Image = base64Data.split(',')[1];

      // 2. Call API
      const res = await fetch('/api/gemini/analyze-bouquet-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image,
          catalogFlowers: wholesaleCatalog.slice(0, 160).map((f) => ({
            id: f.id,
            name: f.name,
            packPrice: f.packPrice,
            packUnit: f.packUnit,
            stemsPerPack: f.stemsPerPack,
            unitPrice: f.unitPrice,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const mappedItems: SuggestedFlowerItem[] = data.items.map((it: any, idx: number) => {
            let matched: WholesaleFlowerItem | undefined;
            if (it.catalogFlowerId) {
              matched = wholesaleCatalog.find((f) => f.id === it.catalogFlowerId);
            }
            if (!matched && it.flowerName) {
              const lower = it.flowerName.toLowerCase().trim();
              matched = wholesaleCatalog.find(
                (f) =>
                  f.name.toLowerCase().trim() === lower ||
                  f.name.toLowerCase().includes(lower) ||
                  lower.includes(f.name.toLowerCase())
              );
            }

            const unit: 'cành' | 'bó' = it.unit === 'cành' ? 'cành' : 'bó';
            let unitPrice = 100000;
            if (matched) {
              unitPrice =
                unit === 'bó'
                  ? matched.packPrice
                  : matched.unitPrice ||
                    Math.round(matched.packPrice / (matched.stemsPerPack || 1));
            }

            const count = typeof it.count === 'number' && it.count > 0 ? it.count : 1;
            const totalPrice = Math.round(count * unitPrice);

            return {
              id: `img-sug-${idx}-${Date.now()}`,
              rawInputText: it.flowerName,
              catalogFlowerId: matched?.id || it.catalogFlowerId || '',
              flowerName: matched?.name || it.flowerName,
              count,
              unit,
              unitPrice,
              totalPrice,
              selected: true,
              matchType: (matched ? 'exact' : 'unmatched') as any,
              matchedFlower: matched,
              note: matched ? 'Nhận diện từ ảnh (Khớp kho)' : 'Nhận diện từ ảnh (Ngoài kho)',
            };
          });

          const totalEstimatedCost = mappedItems.reduce((sum, it) => sum + it.totalPrice, 0);
          const totalStems = mappedItems.reduce((sum, it) => {
            if (it.unit === 'cành') return sum + it.count;
            const stems = it.matchedFlower?.stemsPerPack || 10;
            return sum + it.count * stems;
          }, 0);

          setChatSuggestionResult({
            rawPrompt: 'AI quét ảnh bó hoa',
            items: mappedItems,
            totalEstimatedCost,
            totalStems,
          });
          setIsSuggestionModalOpen(true);
        }
      }
    } catch (e) {
      console.error('AI Image scanning failed:', e);
    } finally {
      setIsAnalyzingImage(false);
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
    <div className="space-y-6">
      {/* Dedicated Input Section Card matching reference screenshot */}
      <div className="bg-white rounded-2xl border border-[#EAE1DA] p-5 sm:p-6 shadow-2xs space-y-4">
        {/* 1. HERO CHAT: "Nàng cần bó hoa gì?" - Đưa lên đầu và nổi bật nhất */}
        <div className="bg-[#FAF7F3] rounded-2xl border border-[#EAE1DA] p-4 sm:p-5 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#B77E79] text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base sm:text-lg text-[#392A28]">
              Nàng cần bó hoa gì?
            </h2>
          </div>

          <div className="relative bg-white rounded-xl border border-[#EAE1DA] focus-within:border-[#B77E79] focus-within:ring-1 focus-within:ring-[#B77E79] overflow-hidden shadow-2xs">
            <textarea
              rows={3}
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatPrompt();
                }
              }}
              placeholder="Ví dụ: trong ảnh dùng 1 bó hồng cam Balcony, 1 bó cỏ đồng tiền, 1 bó lá bạc..."
              className="w-full px-3.5 pt-3 pb-11 text-xs sm:text-sm text-[#392A28] placeholder-[#92827C]/70 bg-transparent resize-none focus:outline-none"
            />

            <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAnalyzeImage(file);
                }}
              />
              <button
                type="button"
                disabled={isAnalyzingImage || isChatProcessing}
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#B77E79] bg-[#FAF7F3] hover:bg-[#F4E8E4] border border-[#EAE1DA] rounded-xl transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Quét ảnh AI</span>
              </button>

              <button
                type="button"
                disabled={!chatPrompt.trim() || isChatProcessing || isAnalyzingImage}
                onClick={handleSendChatPrompt}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#B77E79] hover:bg-[#9E6965] rounded-xl transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isChatProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tra giá...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Ingredients Table ("Danh sách hoa") */}
      <div className="bg-white rounded-2xl border border-[#EAE1DA] p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Table Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F3] text-[#B77E79] flex items-center justify-center">
              <Flower2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#392A28]">
              Nguyên liệu
            </h2>
            <span className="text-xs text-[#92827C] font-medium">
              ({items.length} loại)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSaveRecipe && items.length > 0 && (
              <button
                type="button"
                onClick={onSaveRecipe}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#392A28] bg-[#FAF7F3] hover:bg-[#F4E8E4] border border-[#EAE1DA] rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#B77E79]" />
                <span>Lưu bó hoa</span>
              </button>
            )}
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setItems([])}
                className="text-xs text-[#92827C] hover:text-rose-600 transition-colors cursor-pointer px-2 py-1"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Flower Search & Add Bar (Moved to Danh sách hoa, No 'Định lượng' input) */}
        <div className="pt-1">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* Search Flower in Catalog */}
            <div className="flex-1 relative" ref={searchContainerRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-[#92827C] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTopAddClick();
                    }
                  }}
                  placeholder="Tìm hoa thêm vào công thức (Kho Trí Hải)..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-[#FAF7F3] hover:bg-white focus:bg-white border border-[#EAE1DA] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#B77E79] focus:border-[#B77E79] text-[#392A28] placeholder:text-[#92827C]/70 shadow-2xs transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#92827C] hover:text-[#392A28]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white border border-[#EAE1DA] rounded-xl shadow-xl divide-y divide-stone-100">
                  {searchTerm.trim() === '' && recentFlowers.length > 0 && (
                    <div className="p-2.5 bg-[#FAF7F3] border-b border-[#EAE1DA]">
                      <div className="text-[10px] font-bold text-[#92827C] uppercase tracking-wider mb-1.5">
                        Hoa hay dùng trong kho
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {recentFlowers.map((flower) => (
                          <button
                            key={`recent-${flower.id}`}
                            type="button"
                            onClick={() => handleAddFlower(flower)}
                            className="p-2 rounded-lg text-left bg-white border border-[#EAE1DA] hover:border-[#B77E79] text-xs transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-medium text-[#392A28] truncate">
                              {flower.name}
                            </span>
                            <span className="font-bold text-[#B77E79] ml-1 shrink-0 tabular-nums">
                              {formatVND(flower.unitPrice)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredCatalog.length > 0 ? (
                    filteredCatalog.slice(0, 30).map((flower, idx) => (
                      <button
                        key={flower.id}
                        type="button"
                        onClick={() => handleAddFlower(flower)}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          highlightedIndex === idx
                            ? 'bg-[#F4E8E4] text-[#392A28]'
                            : 'hover:bg-stone-50 text-[#392A28]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs sm:text-sm">
                            {flower.name}
                          </span>
                          <div className="text-[11px] text-[#92827C]">
                            {flower.packUnit} · {formatVND(flower.packPrice)}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="text-xs font-bold text-[#B77E79] tabular-nums">
                            {formatVND(flower.unitPrice)}
                            <span className="text-[10px] font-normal text-[#92827C] ml-0.5">
                              / cành
                            </span>
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[#92827C]">
                      Không tìm thấy hoa "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Button: Thêm hoa */}
            <button
              type="button"
              onClick={handleTopAddClick}
              className="h-[42px] px-5 flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#B77E79] hover:bg-[#9E6965] rounded-xl transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-bold">Thêm hoa</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="border border-dashed border-[#EAE1DA] rounded-xl p-8 text-center bg-[#FAF7F3]/60 space-y-2">
            <Flower2 className="w-8 h-8 text-[#92827C]/60 mx-auto" />
            <p className="text-sm font-semibold text-[#392A28]">
              Chưa có hoa nào trong danh sách
            </p>
            <p className="text-xs text-[#92827C] max-w-sm mx-auto">
              Nhập tên hoa ở ô trên hoặc dán mô tả chat để tự động tính giá.
            </p>
          </div>
        ) : (
          /* High-end Editorial Ingredient Table */
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#EAE1DA] text-[11px] font-semibold text-[#92827C] uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-semibold">Nguyên liệu</th>
                    <th className="pb-3 px-3 text-left font-semibold">Đơn giá</th>
                    <th className="pb-3 px-3 text-center font-semibold">
                      Số lượng
                    </th>
                    {orderQuantity > 1 && (
                      <th className="pb-3 px-3 text-center font-semibold text-[#B77E79]">
                        Tổng cả đơn ({orderQuantity} bó)
                      </th>
                    )}
                    <th className="pb-3 px-3 text-right font-semibold">
                      {orderQuantity > 1 ? `Thành tiền (${orderQuantity} bó)` : 'Thành tiền'}
                    </th>
                    <th className="pb-3 pl-3 text-center w-10 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE1DA]/70">
                  {items.map((item) => {
                    const flower = wholesaleCatalog.find((f) => f.id === item.flowerId);
                    const displaySpecification = flower ? flower.packUnit : item.packSpecification;
                    const thumbnail = getFlowerThumbnail(item.flowerName, flower?.category);
                    const totalOrderCount = Math.round(item.quantity * orderQuantity * 10) / 10;
                    const totalOrderCost = item.totalCost * orderQuantity;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FAF7F3]/60 transition-colors group"
                      >
                        {/* Flower Thumbnail + Name + Specification */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="relative group/img cursor-pointer"
                              onClick={() => setLightboxImage({ url: thumbnail, name: item.flowerName })}
                            >
                              <img
                                src={thumbnail}
                                alt={item.flowerName}
                                className="w-11 h-11 rounded-xl object-cover border border-[#EAE1DA] shrink-0 shadow-2xs group-hover/img:brightness-90 transition-all"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <Maximize2 className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#392A28] block truncate text-xs sm:text-sm">
                                {item.flowerName}
                              </span>
                              <span className="text-[11px] text-[#92827C] block font-normal">
                                {displaySpecification}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="py-3.5 px-3 text-left tabular-nums">
                          <span className="font-semibold text-[#392A28]">
                            {formatVND(item.unitPrice)}
                          </span>
                          <span className="text-[11px] text-[#92827C] block">
                            /{item.unitType}
                          </span>
                        </td>

                        {/* Quantity & Unit Stepper (for 1 bouquet) */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center border border-[#EAE1DA] rounded-xl bg-white px-2 py-1 shadow-2xs">
                            <input
                              ref={(el) => {
                                quantityInputRefs.current[item.id] = el;
                              }}
                              type="number"
                              step={item.unitType === 'cành' ? '1' : '0.1'}
                              min="0.1"
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
                                  if (num > 0) handleUpdateQuantity(item.id, num);
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
                                  handleUpdateQuantity(item.id, 1);
                                } else {
                                  handleUpdateQuantity(item.id, num);
                                }
                              }}
                              className="w-10 text-center font-bold text-[#392A28] focus:outline-none tabular-nums text-xs sm:text-sm"
                            />

                            <span className="text-[#EAE1DA] mx-1">|</span>

                            <select
                              value={item.unitType}
                              onChange={(e) => handleSwitchUnit(item.id, e.target.value as any)}
                              className="text-xs font-semibold text-[#92827C] hover:text-[#392A28] bg-transparent focus:outline-none cursor-pointer"
                            >
                              <option value="cành">cành</option>
                              <option value="bó">bó</option>
                            </select>
                          </div>
                        </td>

                        {/* Total for Whole Order (when orderQuantity > 1) */}
                        {orderQuantity > 1 && (
                          <td className="py-3.5 px-3 text-center tabular-nums">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#F4E8E4] border border-[#EAE1DA] text-[#392A28] font-bold text-xs sm:text-sm shadow-2xs">
                              <span>{totalOrderCount}</span>
                              <span className="text-[11px] font-normal text-[#92827C]">{item.unitType}</span>
                            </div>
                          </td>
                        )}

                        {/* Total Cost */}
                        <td className="py-3.5 px-3 text-right tabular-nums text-xs sm:text-sm">
                          <span className="font-bold text-[#392A28] block">
                            {formatVND(totalOrderCost)}
                          </span>
                        </td>

                        {/* Trash action */}
                        <td className="py-3.5 pl-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-[#92827C]/60 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa hoa"
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

            {/* Mobile Card List View */}
            <div className="sm:hidden space-y-3">
              {items.map((item) => {
                const flower = wholesaleCatalog.find((f) => f.id === item.flowerId);
                const thumbnail = getFlowerThumbnail(item.flowerName, flower?.category);
                const totalOrderCount = Math.round(item.quantity * orderQuantity * 10) / 10;
                const totalOrderCost = item.totalCost * orderQuantity;

                return (
                  <div 
                    key={item.id}
                    className="p-3.5 bg-[#FAF7F3] rounded-2xl border border-[#EAE1DA] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="relative cursor-pointer shrink-0"
                          onClick={() => setLightboxImage({ url: thumbnail, name: item.flowerName })}
                        >
                          <img
                            src={thumbnail}
                            alt={item.flowerName}
                            className="w-12 h-12 rounded-xl object-cover border border-[#EAE1DA] shadow-xs"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#392A28] text-sm truncate leading-tight">
                            {item.flowerName}
                          </h3>
                          <div className="text-[11px] text-[#92827C] mt-0.5">
                            {formatVND(item.unitPrice)}/{item.unitType}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-rose-600/60 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#EAE1DA]/50">
                      <div className="inline-flex items-center border border-[#EAE1DA] rounded-xl bg-white px-2 py-1 shadow-2xs">
                        <button 
                          className="p-1 text-[#B77E79]"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseFloat(e.target.value))}
                          className="w-10 text-center font-bold text-[#392A28] text-xs focus:outline-none bg-transparent"
                        />
                        <button 
                          className="p-1 text-[#B77E79]"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[#EAE1DA] mx-1">|</span>
                        <select
                          value={item.unitType}
                          onChange={(e) => handleSwitchUnit(item.id, e.target.value as any)}
                          className="text-[11px] font-bold text-[#92827C] bg-transparent focus:outline-none"
                        >
                          <option value="cành">cành</option>
                          <option value="bó">bó</option>
                        </select>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-[#92827C] font-medium uppercase tracking-wider mb-0.5">Thành tiền</div>
                        <div className="font-bold text-[#392A28] text-sm tabular-nums">
                          {formatVND(totalOrderCost)}
                        </div>
                        {orderQuantity > 1 && (
                          <div className="text-[10px] text-[#B77E79] font-bold">
                            ({totalOrderCount} {item.unitType})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions of Table */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#EAE1DA]/70">
          <button
            type="button"
            onClick={() => {
              searchInputRef.current?.focus();
              setIsDropdownOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B77E79] hover:text-[#9E6965] px-3 py-1.5 rounded-lg hover:bg-[#F4E8E4]/60 transition-colors w-fit cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm nguyên liệu khác</span>
          </button>

          {/* Subtotal of Raw Flowers */}
          <div className="text-xs text-[#92827C] flex items-center gap-2">
            <span>{orderQuantity > 1 ? `Tiền hoa thô (${orderQuantity} bó):` : 'Tiền hoa thô:'}</span>
            <span className="font-bold text-[#392A28] tabular-nums text-sm">
              {formatVND(rawFlowerCost * orderQuantity)}
            </span>
            {orderQuantity > 1 && (
              <span className="text-[11px] text-[#92827C] font-normal">
                ({formatVND(rawFlowerCost)} / bó)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Suggestion Modal */}
      <ChatRecipeSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        suggestionResult={chatSuggestionResult}
        wholesaleCatalog={wholesaleCatalog}
        onApplySuggestions={handleApplyChatSuggestions}
      />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-square sm:aspect-video overflow-hidden">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.name}
                className="w-full h-full object-contain bg-white"
              />
            </div>
            <div className="p-4 bg-white border-t border-[#EAE1DA] flex items-center justify-between">
              <h3 className="font-bold text-[#392A28] text-lg">{lightboxImage.name}</h3>
              <span className="px-3 py-1 bg-[#FAF7F3] border border-[#EAE1DA] rounded-full text-xs font-bold text-[#B77E79]">
                Nguyên liệu Kho Trí Hải
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
