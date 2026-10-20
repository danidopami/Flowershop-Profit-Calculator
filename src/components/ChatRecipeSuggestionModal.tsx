import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Check,
  Plus,
  Minus,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Flower2,
  Search,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { SuggestedFlowerItem, ChatSuggestionResult } from '../utils/chatRecipeParser';
import { WholesaleFlowerItem, RecipeItem } from '../types';
import { formatVND } from '../utils/calculator';

interface ChatRecipeSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestionResult: ChatSuggestionResult | null;
  wholesaleCatalog: WholesaleFlowerItem[];
  onApplySuggestions: (
    items: SuggestedFlowerItem[],
    mode: 'replace' | 'append'
  ) => void;
  onRetryWithPrompt?: (newPrompt: string) => void;
}

export const ChatRecipeSuggestionModal: React.FC<
  ChatRecipeSuggestionModalProps
> = ({
  isOpen,
  onClose,
  suggestionResult,
  wholesaleCatalog,
  onApplySuggestions,
  onRetryWithPrompt,
}) => {
  if (!isOpen || !suggestionResult) return null;

  const [items, setItems] = useState<SuggestedFlowerItem[]>(() =>
    suggestionResult.items.map((it) => ({ ...it }))
  );
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Synchronize when suggestionResult changes
  React.useEffect(() => {
    setItems(suggestionResult.items.map((it) => ({ ...it })));
  }, [suggestionResult]);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Change quantity
  const handleUpdateCount = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newCount = Math.max(0.5, Math.round((item.count + delta) * 10) / 10);
        return {
          ...item,
          count: newCount,
          totalPrice: Math.round(newCount * item.unitPrice),
        };
      })
    );
  };

  // Set specific quantity from text input
  const handleSetCount = (id: string, value: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const safeVal = Math.max(0.1, value);
        return {
          ...item,
          count: safeVal,
          totalPrice: Math.round(safeVal * item.unitPrice),
        };
      })
    );
  };

  // Toggle unit (cành vs bó)
  const handleToggleUnit = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newUnit: 'cành' | 'bó' = item.unit === 'cành' ? 'bó' : 'cành';
        let newUnitPrice = item.unitPrice;

        if (item.matchedFlower) {
          if (newUnit === 'bó') {
            newUnitPrice = item.matchedFlower.packPrice;
          } else {
            newUnitPrice =
              item.matchedFlower.unitPrice ||
              Math.round(
                item.matchedFlower.packPrice / (item.matchedFlower.stemsPerPack || 1)
              );
          }
        }

        return {
          ...item,
          unit: newUnit,
          unitPrice: newUnitPrice,
          totalPrice: Math.round(item.count * newUnitPrice),
        };
      })
    );
  };

  // Switch to another flower from Kho Trí Hải
  const handleSwitchFlower = (itemId: string, newFlower: WholesaleFlowerItem) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const unitPrice =
          item.unit === 'bó'
            ? newFlower.packPrice
            : newFlower.unitPrice ||
              Math.round(newFlower.packPrice / (newFlower.stemsPerPack || 1));

        return {
          ...item,
          catalogFlowerId: newFlower.id,
          flowerName: newFlower.name,
          matchedFlower: newFlower,
          matchType: 'exact',
          unitPrice,
          totalPrice: Math.round(item.count * unitPrice),
          note: `Đã đổi sang: ${newFlower.name} (${formatVND(newFlower.packPrice)} / ${newFlower.packUnit || 'bó'})`,
        };
      })
    );
    setEditingItemId(null);
    setCatalogSearch('');
  };

  // Calculate totals
  const selectedItems = items.filter((i) => i.selected);
  const totalCost = selectedItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalStems = selectedItems.reduce((sum, i) => {
    if (i.unit === 'cành') return sum + i.count;
    const stems = i.matchedFlower?.stemsPerPack || 10;
    return sum + i.count * stems;
  }, 0);

  // Filter catalog for flower picker
  const filteredCatalog = wholesaleCatalog
    .filter((f) => {
      if (!catalogSearch.trim()) return true;
      const term = catalogSearch.toLowerCase();
      return (
        f.name.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term)
      );
    })
    .slice(0, 40);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#eedfd5] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#eedfd5] bg-[#faf6f2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5d3a3a] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="text-lg sm:text-xl font-bold text-[#5d3a3a]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Gợi ý hoa từ Kho Trí Hải
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full uppercase tracking-wider">
                  Trí Hải Catalog
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Bóc tách tự động từ mô tả và tra cứu giá sỉ chính xác
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-[#5d3a3a] hover:bg-white rounded-lg transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Prompt Display */}
        <div className="px-5 py-3 bg-[#fdfbf9] border-b border-[#f0e4dc] flex items-center gap-2.5 text-xs text-stone-700">
          <span className="font-semibold text-[#5d3a3a] whitespace-nowrap">
            Mô tả bạn nhập:
          </span>
          <span className="italic text-stone-600 bg-white px-2.5 py-1 rounded-md border border-[#eedfd5] truncate flex-1">
            "{suggestionResult.rawPrompt}"
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Danh sách hoa gợi ý ({items.length} loại)
            </span>
            <span className="text-xs text-stone-400">
              Đánh dấu để chọn hoa muốn đưa vào công thức
            </span>
          </div>

          {/* Flower Items Table / Cards */}
          <div className="space-y-3">
            {items.map((item) => {
              const isMatched = !!item.matchedFlower;
              const isEditingThis = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-3.5 transition-all ${
                    item.selected
                      ? 'bg-white border-[#dfc8ba] shadow-2xs'
                      : 'bg-stone-50/70 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Checkbox and Name info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="mt-1 w-4 h-4 text-[#5d3a3a] rounded border-stone-300 focus:ring-[#5d3a3a] cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-stone-800 text-sm">
                            {item.flowerName}
                          </span>
                          {isMatched ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Kho Trí Hải
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertCircle className="w-2.5 h-2.5" /> Ngoài kho
                            </span>
                          )}
                        </div>

                        {/* Inventory Details & Subtitle */}
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                          {isMatched && item.matchedFlower && (
                            <>
                              <span>
                                Giá sỉ: {formatVND(item.matchedFlower.packPrice)} /{' '}
                                {item.matchedFlower.packUnit || 'Bó'}
                              </span>
                              <span>•</span>
                              <span>
                                {item.matchedFlower.stemsPerPack > 1
                                  ? `${item.matchedFlower.stemsPerPack} cành/bó`
                                  : '1 bó'}
                              </span>
                            </>
                          )}
                          {!isMatched && (
                            <span className="text-amber-700 italic">
                              Hoa tự do (bạn có thể đổi sang hoa trong kho)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Unit Controls & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(item.id, -1)}
                          disabled={!item.selected}
                          className="p-1.5 hover:bg-stone-200 text-stone-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={item.count}
                          disabled={!item.selected}
                          onChange={(e) =>
                            handleSetCount(
                              item.id,
                              parseFloat(e.target.value) || 1
                            )
                          }
                          className="w-12 text-center text-xs font-bold text-stone-800 bg-white py-1 focus:outline-none"
                          min="0.1"
                          step="0.5"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(item.id, 1)}
                          disabled={!item.selected}
                          className="p-1.5 hover:bg-stone-200 text-stone-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Unit Toggle (bó / cành) */}
                      <button
                        type="button"
                        onClick={() => handleToggleUnit(item.id)}
                        disabled={!item.selected}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#eedfd5] bg-[#faf6f2] hover:bg-[#ebdcd3] text-[#5d3a3a] transition-colors cursor-pointer"
                        title="Bấm để chuyển đổi giữa cành và bó"
                      >
                        {item.unit}
                      </button>

                      {/* Price subtotal */}
                      <div className="text-right min-w-[90px]">
                        <div className="text-sm font-bold text-[#5d3a3a]">
                          {formatVND(item.totalPrice)}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {formatVND(item.unitPrice)}/{item.unit}
                        </div>
                      </div>

                      {/* Change flower button */}
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItemId(isEditingThis ? null : item.id)
                        }
                        className="p-1.5 text-stone-400 hover:text-[#5d3a3a] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer text-xs font-medium"
                        title="Đổi loại hoa khác trong kho Trí Hải"
                      >
                        {isEditingThis ? 'Đóng' : 'Đổi hoa'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Flower Switcher Dropdown */}
                  {isEditingThis && (
                    <div className="mt-3 pt-3 border-t border-dashed border-[#eedfd5] bg-[#fbf9f7] p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                        <span>Chọn hoa thay thế từ Kho Trí Hải:</span>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="text-stone-400 hover:text-stone-600"
                        >
                          Hủy
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                          placeholder="Tìm hoa trong 527+ mã kho Trí Hải..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5d3a3a]"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-stone-100 bg-white rounded border border-stone-200">
                        {filteredCatalog.map((f) => (
                          <div
                            key={f.id}
                            onClick={() => handleSwitchFlower(item.id, f)}
                            className="p-2 hover:bg-[#faf4ef] cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <span className="font-medium text-stone-800">
                                {f.name}
                              </span>
                              <span className="text-[10px] text-stone-400 ml-1.5">
                                ({f.category})
                              </span>
                            </div>
                            <span className="font-bold text-[#5d3a3a]">
                              {formatVND(f.packPrice)} / {f.packUnit || 'Bó'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mode Selection: Replace or Append */}
          <div className="p-3 bg-[#faf6f2] rounded-xl border border-[#eedfd5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-medium text-[#5d3a3a]">
              Cách thức áp dụng vào công thức hiện tại:
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="applyMode"
                  value="replace"
                  checked={applyMode === 'replace'}
                  onChange={() => setApplyMode('replace')}
                  className="text-[#5d3a3a] focus:ring-[#5d3a3a]"
                />
                <span className="text-stone-700">Thay thế toàn bộ công thức</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="applyMode"
                  value="append"
                  checked={applyMode === 'append'}
                  onChange={() => setApplyMode('append')}
                  className="text-[#5d3a3a] focus:ring-[#5d3a3a]"
                />
                <span className="text-stone-700">Thêm nối tiếp vào công thức</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer with Human Accept / Ignore Decisions */}
        <div className="px-5 py-4 border-t border-[#eedfd5] bg-[#faf6f2] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Subtotal & Stems Summary */}
          <div className="flex items-center gap-4 text-xs text-stone-600 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span>Đã chọn: </span>
              <span className="font-bold text-stone-900">
                {selectedItems.length} loại hoa
              </span>
              <span className="text-stone-400 ml-1">
                (~{totalStems} cành/bó)
              </span>
            </div>
            <div className="border-l border-stone-300 pl-3">
              <span>Tổng tiền kho sỉ: </span>
              <span className="text-base font-bold text-[#5d3a3a]">
                {formatVND(totalCost)}
              </span>
            </div>
          </div>

          {/* Action Decision Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Ignore button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Bỏ qua / Hủy
            </button>

            {/* Accept & Apply button */}
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={() => onApplySuggestions(selectedItems, applyMode)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#5d3a3a] hover:bg-[#482c2c] rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Áp dụng vào công thức</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
