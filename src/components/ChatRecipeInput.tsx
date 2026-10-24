import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
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
    <div className="relative bg-white rounded-2xl border border-[#eedfd5] focus-within:border-[#5d3a3a] focus-within:ring-2 focus-within:ring-[#5d3a3a]/15 transition-all shadow-xs overflow-hidden">
      <textarea
        rows={2}
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Gõ hoặc dán danh sách hoa (ví dụ: trong ảnh dùng 1 bó hồng cam Balcony, 1 bó cỏ đồng tiền, 1 bó lá bạc)..."
        className="w-full px-4 pt-3.5 pb-12 text-sm text-stone-800 placeholder-stone-400 bg-transparent resize-none focus:outline-none"
      />

      <div className="absolute bottom-2.5 right-3 flex items-center justify-end">
        <button
          type="button"
          disabled={!promptText.trim() || isProcessing}
          onClick={() => handleParsePrompt()}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#5d3a3a] hover:bg-[#3d2727] rounded-xl transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <span>Gửi</span>
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
