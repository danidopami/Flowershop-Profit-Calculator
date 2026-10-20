import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, ArrowRight, CornerDownLeft } from 'lucide-react';
import { WholesaleFlowerItem } from '../types';
import { parseChatRecipe, ChatSuggestionResult } from '../utils/chatRecipeParser';

interface ChatRecipeInputProps {
  wholesaleCatalog: WholesaleFlowerItem[];
  onOpenSuggestionModal: (result: ChatSuggestionResult) => void;
}

export const ChatRecipeInput: React.FC<ChatRecipeInputProps> = ({
  wholesaleCatalog,
  onOpenSuggestionModal,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Quick preset sample prompts that florists frequently use
  const samplePrompts = [
    'trong ảnh dùng 1 bó hồng cam Balcony, 1 bó cỏ đồng tiền, 1 bó lá bạc',
    '10 cành Calla Lily Cam, 2 bó Cát Tường Tròn Trắng, 1 bó Lá Bạc Nhỏ',
    '2 bó Cúc Daisy Trắng, 1 bó Baby Trắng Bông Nhỡ, 1 bó Cỏ Sao Xanh',
    '5 cành Hoa Huệ Tây Amaryllis Đỏ, 1 bó Lan Tiên Trắng, 1 bó Lá Bạc To',
  ];

  const handleParsePrompt = async (textToParse?: string) => {
    const text = (textToParse !== undefined ? textToParse : promptText).trim();
    if (!text) return;

    setIsProcessing(true);

    try {
      // 1. Try server-side Gemini parsing with Trí Hải catalog context
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
          // Map server items to SuggestedFlowerItem format
          const mappedItems = data.items.map((it: any, idx: number) => {
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

          const totalEstimatedCost = mappedItems.reduce(
            (sum: number, it: any) => sum + it.totalPrice,
            0
          );
          const totalStems = mappedItems.reduce((sum: number, it: any) => {
            if (it.unit === 'cành') return sum + it.count;
            const stems = it.matchedFlower?.stemsPerPack || 10;
            return sum + it.count * stems;
          }, 0);

          onOpenSuggestionModal({
            rawPrompt: text,
            items: mappedItems,
            totalEstimatedCost,
            totalStems,
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Server parse failed, using client rule parser:', e);
    } finally {
      setIsProcessing(false);
    }

    // 2. Client-side resilient parser fallback
    const localResult = parseChatRecipe(text, wholesaleCatalog);
    onOpenSuggestionModal(localResult);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParsePrompt();
    }
  };

  return (
    <div className="bg-[#faf6f2] border border-[#eedfd5] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#5d3a3a]">
          <MessageSquare className="w-4 h-4 text-[#8c6b6b]" />
          <h3
            className="text-sm sm:text-base font-bold tracking-tight font-title"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Nhập công thức dạng chat / văn bản
          </h3>
          <span className="text-[10px] px-2 py-0.5 bg-[#f0e4dc] text-[#5d3a3a] font-semibold rounded-md">
            Gợi ý Kho Trí Hải
          </span>
        </div>
        <span className="text-xs text-stone-500">
          Nhập tự do danh sách hoa bạn nhìn thấy hoặc dự định cắm
        </span>
      </div>

      {/* Textarea Input Container */}
      <div className="relative bg-white rounded-xl border border-[#eedfd5] focus-within:border-[#5d3a3a] focus-within:ring-1 focus-within:ring-[#5d3a3a] transition-all overflow-hidden shadow-2xs">
        <textarea
          rows={2}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ví dụ: trong ảnh dùng 1 bó hồng cam Balcony, 1 bó cỏ đồng tiền, 1 bó lá bạc..."
          className="w-full px-3.5 pt-3 pb-10 text-sm text-stone-800 placeholder-stone-400 bg-transparent resize-none focus:outline-none"
        />

        {/* Bottom Toolbar inside input */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] text-stone-400 hidden sm:inline">
            Nhấn <kbd className="px-1 py-0.5 bg-stone-100 rounded border border-stone-200">Enter</kbd> để tạo gợi ý
          </span>
          <button
            type="button"
            disabled={!promptText.trim() || isProcessing}
            onClick={() => handleParsePrompt()}
            className="pointer-events-auto ml-auto inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#5d3a3a] hover:bg-[#482c2c] rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tra giá...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Xem gợi ý hoa</span>
                <Send className="w-3 h-3 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-[11px] font-medium text-stone-500 shrink-0">
          Mẫu thử nhanh:
        </span>
        {samplePrompts.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPromptText(sample);
              handleParsePrompt(sample);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#f2e6de] border border-[#eedfd5] text-stone-700 hover:text-[#5d3a3a] transition-colors truncate max-w-[280px] sm:max-w-none cursor-pointer"
            title={sample}
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
};
