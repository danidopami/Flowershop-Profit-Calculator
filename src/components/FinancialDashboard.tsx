import React, { useState } from 'react';
import {
  Copy,
  Check,
  BookmarkPlus,
  FileSpreadsheet,
  Receipt,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { CostVariables, FinancialBreakdown } from '../types';
import { formatVND, marginToMarkup } from '../utils/calculator';

interface FinancialDashboardProps {
  recipeName: string;
  category: string;
  orderQuantity?: number;
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
  orderQuantity = 1,
  variables,
  setVariables,
  breakdown,
  roundOption,
  setRoundOption,
  onSaveRecipe,
  onOpenQuote,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMarginDropdownOpen, setIsMarginDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'order' | 'single'>(orderQuantity > 1 ? 'order' : 'single');

  // Multiplier for display
  const isMulti = orderQuantity > 1;
  const multiplier = isMulti && viewMode === 'order' ? orderQuantity : 1;

  // Clean plain-text copy
  const generateCleanTextOutput = () => {
    return `Chi tiết chi phí & Báo giá: ${recipeName || 'Mẫu hoa'}
Cửa hàng: Solelia - Tiệm Hoa Ấm Áp
Số lượng đơn:              ${orderQuantity} bó
---------------------------------------------
Đơn giá 1 bó:              ${formatVND(breakdown.roundedPrice).padStart(12)}
TỔNG GIÁ ĐƠN HÀNG:         ${formatVND(breakdown.roundedPrice * orderQuantity).padStart(12)}
---------------------------------------------
Tiền hoa thô (${orderQuantity} bó):      ${formatVND(breakdown.rawFlowerCost * orderQuantity).padStart(12)}
Hao hụt (${variables.wastagePercent}%):               ${formatVND(breakdown.wastageCost * orderQuantity).padStart(12)}
Vật tư phụ:                ${formatVND(breakdown.packagingCost * orderQuantity).padStart(12)}
Công cắm hoa:              ${formatVND(breakdown.laborCost * orderQuantity).padStart(12)}
---------------------------------------------
Tổng chi phí:              ${formatVND(breakdown.totalCost * orderQuantity).padStart(12)}
Lợi nhuận dự kiến cả đơn:  ${formatVND(breakdown.netProfit * orderQuantity).padStart(12)} (${variables.targetMarginPercent}%)
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

  const setTargetMargin = (margin: number) => {
    setVariables((prev) => ({
      ...prev,
      targetMarginPercent: margin,
      markupFactor: marginToMarkup(margin),
    }));
    setIsMarginDropdownOpen(false);
  };

  const commonMargins = [30, 35, 40, 45, 50, 55, 58, 60, 65, 70];

  return (
    <div className="space-y-5">
      {/* Top Deep Olive Luxury Card matching reference screenshot */}
      <div className="bg-[#48423a] text-[#FAF7F3] rounded-2xl p-6 shadow-md border border-[#3a352f] space-y-5">
        {/* Header: Title + Target Margin Selector */}
        <div className="flex items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#FAF7F3]/75">
              {isMulti && viewMode === 'order' ? `Tổng giá (${orderQuantity} bó)` : 'Giá bán đề nghị'}
            </span>
            {isMulti && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#B77E79] text-white rounded">
                x{orderQuantity}
              </span>
            )}
          </div>

          {/* Margin Dropdown Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMarginDropdownOpen(!isMarginDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-[#FAF7F3] transition-colors cursor-pointer"
            >
              <span>Lãi: {variables.targetMarginPercent}%</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isMarginDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#36322b] border border-white/10 rounded-xl shadow-2xl p-1 z-30 divide-y divide-white/5">
                <div className="px-2 py-1 text-[10px] text-[#FAF7F3]/60 uppercase font-semibold">
                  Chọn tỷ lệ lãi
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {commonMargins.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTargetMargin(m)}
                      className={`w-full px-2.5 py-1.5 text-xs text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        variables.targetMarginPercent === m
                          ? 'bg-[#B77E79] text-white font-bold'
                          : 'text-[#FAF7F3]/90 hover:bg-white/10'
                      }`}
                    >
                      <span>{m}%</span>
                      {m === 58 && (
                        <span className="text-[10px] text-[#FAF7F3]/60 font-normal">
                          Chuẩn
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View mode toggle for multi-bouquet orders */}
        {isMulti && (
          <div className="flex items-center p-1 bg-black/20 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('order')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                viewMode === 'order'
                  ? 'bg-white text-[#392A28] shadow-2xs'
                  : 'text-[#FAF7F3]/70 hover:text-white'
              }`}
            >
              Cả đơn ({orderQuantity} bó)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                viewMode === 'single'
                  ? 'bg-white text-[#392A28] shadow-2xs'
                  : 'text-[#FAF7F3]/70 hover:text-white'
              }`}
            >
              Giá 1 bó
            </button>
          </div>
        )}

        {/* Big Bold Suggested Price */}
        <div className="space-y-1">
          <div
            className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#FAF7F3] leading-none tabular-nums"
          >
            {formatVND(breakdown.roundedPrice * multiplier)}
          </div>
          {isMulti && viewMode === 'order' && (
            <div className="text-xs text-[#FAF7F3]/75 pt-1">
              Đơn giá: {formatVND(breakdown.roundedPrice)} / bó
            </div>
          )}
        </div>

        {/* Sub-line & Rounding Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-[#FAF7F3]/75 text-[11px]">
            Lãi ròng: <span className="font-semibold text-white">{formatVND(breakdown.netProfit)}</span>
          </span>

          {/* Rounding Pills matching reference */}
          <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/10">
            {[
              { val: 0, label: 'Gốc' },
              { val: 5000, label: '+5k' },
              { val: 10000, label: '+10k' },
              { val: 50000, label: '+50k' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setRoundOption(opt.val)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer tabular-nums ${
                  roundOption === opt.val
                    ? 'bg-white text-[#392A28] shadow-2xs font-bold'
                    : 'text-[#FAF7F3]/70 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button: Xuất phiếu báo giá khách hàng */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={onOpenQuote}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl bg-[#F4E8E4] hover:bg-white text-[#392A28] shadow-xs transition-all cursor-pointer group"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#B77E79] group-hover:scale-105 transition-transform" />
            <span>Xuất phiếu báo giá khách hàng</span>
          </button>

          {/* Secondary Actions: Sao chép chi tiết & Lưu mẫu thiết kế */}
          <div className="flex items-center justify-between text-xs text-[#FAF7F3]/75 pt-1">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300 font-semibold">Đã sao chép</span>
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
              className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Lưu mẫu thiết kế</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Cost Breakdown Card matching reference screenshot */}
      <div className="bg-white rounded-2xl border border-[#EAE1DA] p-6 shadow-2xs space-y-4">
        {/* Card Title */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EAE1DA]/70">
          <div className="w-7 h-7 rounded-lg bg-[#FAF7F3] text-[#B77E79] flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between w-full">
            <h3
              className="text-base sm:text-lg font-bold text-[#392A28]"
            >
              Chi tiết chi phí
            </h3>
            {isMulti && (
              <span className="text-[11px] font-semibold text-[#B77E79] bg-[#F4E8E4] px-2 py-0.5 rounded-md border border-[#EAE1DA]">
                {viewMode === 'order' ? `Cả đơn (${orderQuantity} bó)` : 'Cho 1 bó'}
              </span>
            )}
          </div>
        </div>

        {/* Detailed Breakdown Rows */}
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Tiền hoa thô */}
          <div className="flex items-center justify-between text-[#92827C]">
            <span>Tiền hoa thô</span>
            <span className="tabular-nums font-semibold text-[#392A28]">
              {formatVND(breakdown.rawFlowerCost * multiplier)}
            </span>
          </div>

          {/* Hao hụt */}
          <div className="flex items-center justify-between text-[#92827C]">
            <span>
              Hao hụt ({variables.wastagePercent}%)
            </span>
            <span className="tabular-nums font-semibold text-[#392A28]">
              {formatVND(breakdown.wastageCost * multiplier)}
            </span>
          </div>

          {/* Vật tư phụ */}
          <div className="flex items-center justify-between text-[#92827C]">
            <span>Vật tư phụ</span>
            <span className="tabular-nums font-semibold text-[#392A28]">
              {formatVND(breakdown.packagingCost * multiplier)}
            </span>
          </div>

          {/* Công cắm hoa */}
          <div className="flex items-center justify-between text-[#92827C]">
            <span>Công cắm hoa</span>
            <span className="tabular-nums font-semibold text-[#392A28]">
              {formatVND(breakdown.laborCost * multiplier)}
            </span>
          </div>

          {/* Subtle separator */}
          <div className="pt-2 border-t border-[#EAE1DA]/70 flex items-center justify-between text-[#392A28]">
            <span className="font-semibold">Chi phí vốn</span>
            <span className="tabular-nums font-bold">
              {formatVND(breakdown.cogs * multiplier)}
            </span>
          </div>

          {/* Vận hành, ship */}
          <div className="flex items-center justify-between text-[#92827C]">
            <span>
              Vận hành, ship ({variables.overheadPercent}%)
            </span>
            <span className="tabular-nums font-semibold text-[#392A28]">
              {formatVND(breakdown.overheadCost * multiplier)}
            </span>
          </div>

          {/* Final Totals Divider */}
          <div className="pt-3 border-t border-[#EAE1DA] space-y-2">
            <div className="flex items-center justify-between text-[#392A28]">
              <span className="font-bold text-sm sm:text-base">
                {isMulti && viewMode === 'order' ? `Tổng chi phí (${orderQuantity} bó)` : 'Tổng chi phí'}
              </span>
              <span className="tabular-nums font-bold text-sm sm:text-base">
                {formatVND(breakdown.totalCost * multiplier)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#7B8061] text-xs pt-1">
              <span className="font-semibold">
                {isMulti && viewMode === 'order' ? 'Lợi nhuận dự kiến cả đơn' : 'Lợi nhuận dự kiến'}
              </span>
              <span className="tabular-nums font-bold">
                +{formatVND(breakdown.netProfit * multiplier)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
