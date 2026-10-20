import React, { useState } from 'react';
import {
  Copy,
  Check,
  BookmarkPlus,
  FileSpreadsheet,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { CostVariables, FinancialBreakdown } from '../types';
import { formatVND, marginToMarkup } from '../utils/calculator';

interface FinancialDashboardProps {
  recipeName: string;
  category: string;
  variables: CostVariables;
  setVariables: React.Dispatch<React.SetStateAction<CostVariables>>;
  breakdown: FinancialBreakdown;
  roundOption: number;
  setRoundOption: (val: number) => void;
  onSaveRecipe: () => void;
  onOpenQuote: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  recipeName,
  category,
  variables,
  setVariables,
  breakdown,
  roundOption,
  setRoundOption,
  onSaveRecipe,
  onOpenQuote,
}) => {
  const [copied, setCopied] = useState(false);

  // Clean plain-text copy without [+] or =>
  const generateCleanTextOutput = () => {
    return `Chi tiết chi phí: ${recipeName || 'Mẫu hoa'}
---------------------------------------------
Tiền hoa thô:              ${formatVND(breakdown.rawFlowerCost).padStart(12)}
Hao hụt (${variables.wastagePercent}%):               ${formatVND(breakdown.wastageCost).padStart(12)}
Vật tư phụ:                ${formatVND(breakdown.packagingCost).padStart(12)}
Công cắm hoa:              ${formatVND(breakdown.laborCost).padStart(12)}
---------------------------------------------
Chi phí vốn:               ${formatVND(breakdown.cogs).padStart(12)}
---------------------------------------------
Vận hành, ship (${variables.overheadPercent}%):        ${formatVND(breakdown.overheadCost).padStart(12)}
---------------------------------------------
Tổng chi phí:              ${formatVND(breakdown.totalCost).padStart(12)}
---------------------------------------------
Giá bán đề nghị:           ${formatVND(breakdown.roundedPrice).padStart(12)}
=============================================
Lợi nhuận gộp:             ${formatVND(breakdown.grossProfit).padStart(12)}
Lợi nhuận ròng:            ${formatVND(breakdown.netProfit).padStart(12)}
=============================================`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateCleanTextOutput());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Inline adjustment for target margin
  const handleMarginAdjust = (delta: number) => {
    const newMargin = Math.min(Math.max(variables.targetMarginPercent + delta, 15), 75);
    setVariables((prev) => ({
      ...prev,
      targetMarginPercent: newMargin,
      markupFactor: marginToMarkup(newMargin),
    }));
  };

  const isHealthyMargin = variables.targetMarginPercent >= 40;

  return (
    <div className="space-y-6">
      {/* Primary Price Card: Focused on ONE Job */}
      <div className="bg-[#5d3a3a] text-[#f9f4f0] rounded-2xl p-6 sm:p-7 shadow-md border border-[#4a2e2e] space-y-6">
        {/* Card Header & Inline Editable Margin with Semantic Accent */}
        <div className="flex items-center justify-between pb-3 border-b border-[#734848]">
          <span className="text-xs uppercase tracking-wider text-[#e8d5c8] font-semibold">
            Giá bán đề nghị
          </span>

          {/* Single Margin Element: Target Margin with Semantic Pill Accent */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                isHealthyMargin
                  ? 'bg-[#eef3ef] text-[#30523f] border-[#cde0d5]'
                  : 'bg-[#fcf1e8] text-[#934524] border-[#fad4c0]'
              }`}
              title={
                isHealthyMargin
                  ? 'Biên lợi nhuận khỏe (≥40%)'
                  : 'Biên lợi nhuận thấp hơn mức chuẩn (<40%)'
              }
            >
              <span>Lãi mong muốn:</span>
              <span className="tabular-nums font-bold">
                {variables.targetMarginPercent}%
              </span>
              <div className="flex flex-col ml-0.5">
                <button
                  type="button"
                  onClick={() => handleMarginAdjust(5)}
                  className="hover:opacity-75 leading-none text-[10px]"
                  title="Tăng 5%"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarginAdjust(-5)}
                  className="hover:opacity-75 leading-none text-[10px]"
                  title="Giảm 5%"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Large Suggested Price Display with Subtle Rounding Options */}
        <div className="space-y-2">
          <div className="font-title text-4xl sm:text-5xl font-extrabold text-[#f9f4f0] tracking-tight tabular-nums"
               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {formatVND(breakdown.roundedPrice)}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-[#d6beaf]">Làm tròn giá bán:</span>
            <div className="flex items-center gap-1 bg-[#4a2e2e] p-1 rounded-lg border border-[#734848]">
              <button
                type="button"
                onClick={() => setRoundOption(0)}
                className={`px-2.5 py-1 rounded transition-colors tabular-nums ${
                  roundOption === 0
                    ? 'bg-[#f9f4f0] text-[#5d3a3a] font-bold'
                    : 'text-[#d6beaf] hover:text-white'
                }`}
              >
                Gốc
              </button>
              <button
                type="button"
                onClick={() => setRoundOption(5000)}
                className={`px-2.5 py-1 rounded transition-colors tabular-nums ${
                  roundOption === 5000
                    ? 'bg-[#f9f4f0] text-[#5d3a3a] font-bold'
                    : 'text-[#d6beaf] hover:text-white'
                }`}
              >
                +5k
              </button>
              <button
                type="button"
                onClick={() => setRoundOption(10000)}
                className={`px-2.5 py-1 rounded transition-colors tabular-nums ${
                  roundOption === 10000
                    ? 'bg-[#f9f4f0] text-[#5d3a3a] font-bold'
                    : 'text-[#d6beaf] hover:text-white'
                }`}
              >
                +10k
              </button>
              <button
                type="button"
                onClick={() => setRoundOption(50000)}
                className={`px-2.5 py-1 rounded transition-colors tabular-nums ${
                  roundOption === 50000
                    ? 'bg-[#f9f4f0] text-[#5d3a3a] font-bold'
                    : 'text-[#d6beaf] hover:text-white'
                }`}
              >
                +50k
              </button>
            </div>
          </div>
        </div>

        {/* Single Primary CTA with Quiet Supporting Secondary Actions */}
        <div className="space-y-3 pt-2 border-t border-[#734848]">
          <button
            type="button"
            onClick={onOpenQuote}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-xl bg-[#f9f4f0] hover:bg-white text-[#5d3a3a] shadow-xs transition-all hover:shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#5d3a3a]" />
            <span>Xuất phiếu báo giá khách hàng</span>
          </button>

          <div className="flex items-center justify-between text-xs text-[#d6beaf] pt-1">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#4a2e2e]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300 font-medium">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép chi tiết</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSaveRecipe}
              className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#4a2e2e]"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Lưu mẫu thiết kế</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean, Editorial Cost Breakdown Card (Solelia Reference Layout) */}
      <div className="bg-white rounded-2xl border border-[#eedfd5] p-6 sm:p-7 shadow-xs">
        <h3
          className="text-2xl font-bold text-[#5d3a3a] mb-5 tracking-tight font-title"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Chi tiết chi phí
        </h3>

        <div className="space-y-3 text-sm">
          {/* Row 1: Tiền hoa thô */}
          <div className="flex items-center justify-between text-stone-700">
            <span>Tiền hoa thô</span>
            <span className="tabular-nums text-stone-900 font-medium">
              {formatVND(breakdown.rawFlowerCost)}
            </span>
          </div>

          {/* Row 2: Hao hụt */}
          <div className="flex items-center justify-between text-stone-700">
            <span>
              Hao hụt <span className="text-stone-400 text-xs">({variables.wastagePercent}%)</span>
            </span>
            <span className="tabular-nums text-stone-900 font-medium">
              {formatVND(breakdown.wastageCost)}
            </span>
          </div>

          {/* Row 3: Vật tư phụ */}
          <div className="flex items-center justify-between text-stone-700">
            <span>Vật tư phụ</span>
            <span className="tabular-nums text-stone-900 font-medium">
              {formatVND(breakdown.packagingCost)}
            </span>
          </div>

          {/* Row 4: Công cắm hoa */}
          <div className="flex items-center justify-between text-stone-700">
            <span>Công cắm hoa</span>
            <span className="tabular-nums text-stone-900 font-medium">
              {formatVND(breakdown.laborCost)}
            </span>
          </div>

          {/* Divider & Chi phí vốn */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between font-bold text-stone-900">
            <span>Chi phí vốn</span>
            <span className="tabular-nums text-base">
              {formatVND(breakdown.cogs)}
            </span>
          </div>

          {/* Row: Vận hành, ship */}
          <div className="flex items-center justify-between text-stone-700">
            <span>
              Vận hành, ship <span className="text-stone-400 text-xs">({variables.overheadPercent}%)</span>
            </span>
            <span className="tabular-nums text-stone-900 font-medium">
              {formatVND(breakdown.overheadCost)}
            </span>
          </div>

          {/* Divider & Tổng chi phí */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between font-bold text-stone-900">
            <span>Tổng chi phí</span>
            <span className="tabular-nums text-base">
              {formatVND(breakdown.totalCost)}
            </span>
          </div>

          {/* Divider & Giá bán đề nghị */}
          <div className="pt-3.5 pb-3.5 border-t-2 border-stone-900 border-b-2 flex items-center justify-between font-bold text-stone-900 text-base">
            <span className="text-[#5d3a3a]">Giá bán đề nghị</span>
            <span className="tabular-nums text-lg text-[#5d3a3a] font-extrabold">
              {formatVND(breakdown.roundedPrice)}
            </span>
          </div>

          {/* Lợi nhuận gộp & Lợi nhuận ròng - Sole Location */}
          <div className="pt-1 space-y-2 text-sm">
            <div className="flex items-center justify-between text-stone-600">
              <span>Lợi nhuận gộp</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {formatVND(breakdown.grossProfit)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#5d3a3a] font-bold">
              <span>Lợi nhuận ròng</span>
              <span className="font-extrabold tabular-nums text-base">
                {formatVND(breakdown.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
