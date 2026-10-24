import React, { useState } from 'react';
import { HelpCircle, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { CostVariables } from '../types';
import { formatVND, marginToMarkup, markupToMargin } from '../utils/calculator';

interface CostSlidersProps {
  variables: CostVariables;
  setVariables: React.Dispatch<React.SetStateAction<CostVariables>>;
  rawFlowerCost: number;
}

export const CostSliders: React.FC<CostSlidersProps> = ({
  variables,
  setVariables,
  rawFlowerCost,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateVar = <K extends keyof CostVariables>(
    key: K,
    val: CostVariables[K]
  ) => {
    setVariables((prev) => ({ ...prev, [key]: val }));
  };

  const handleMarginChange = (margin: number) => {
    const clamped = Math.min(Math.max(margin, 0), 85);
    setVariables((prev) => ({
      ...prev,
      targetMarginPercent: clamped,
      markupFactor: marginToMarkup(clamped),
    }));
  };

  const handleMarkupChange = (markup: number) => {
    const clamped = Math.min(Math.max(markup, 1.0), 5.0);
    setVariables((prev) => ({
      ...prev,
      markupFactor: Number(clamped.toFixed(2)),
      targetMarginPercent: markupToMargin(clamped),
    }));
  };

  const wastageCostPreview = Math.round(
    rawFlowerCost * (variables.wastagePercent / 100)
  );

  return (
    <div className="bg-white rounded-2xl border border-[#EAE1DA] shadow-2xs overflow-hidden transition-all">
      {/* Title Bar with Collapse Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none hover:bg-[#FAF7F3]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF7F3] text-[#B77E79] flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#392A28]">
              Tùy chỉnh
            </h2>
            <p className="text-xs text-[#92827C] mt-0.5">
              Hao hụt ({variables.wastagePercent}%) · Bao bì ({formatVND(variables.packagingCost)}) · Công cắm · Vận hành ({variables.overheadPercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-1.5 text-[#92827C] hover:text-[#392A28] rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Sliders Content */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#EAE1DA]/70 space-y-6 animate-in fade-in duration-150">
          {/* Slider 1: Hao hụt nguyên liệu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-[#392A28]">
                    1. Tỉ lệ hao hụt nguyên liệu
                  </label>
                  <span
                    title="Tính hoa gãy dập, thối gốc khi ngâm nước, cắt tỉa lá gốc"
                    className="text-[#92827C] hover:text-[#392A28] cursor-help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-[#92827C]">
                  Tiền bù hao hụt: +{formatVND(wastageCostPreview)}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#392A28] bg-[#FAF7F3] px-3 py-1 rounded-xl border border-[#EAE1DA] tabular-nums">
                <span>{variables.wastagePercent}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={variables.wastagePercent}
                onChange={(e) =>
                  updateVar('wastagePercent', parseInt(e.target.value) || 0)
                }
                style={{
                  background: `linear-gradient(to right, #B77E79 0%, #B77E79 ${(variables.wastagePercent / 30) * 100}%, #FAF7F3 ${(variables.wastagePercent / 30) * 100}%, #FAF7F3 100%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#B77E79] border-none"
              />
              <div className="flex items-center justify-between text-[11px] text-[#92827C]">
                <span className="w-20 text-left tabular-nums">0%</span>
                <span className="flex-1 text-center font-medium text-[#392A28]">
                  5% (Chuẩn Solelia)
                </span>
                <span className="w-20 text-right tabular-nums">30%</span>
              </div>
            </div>
          </div>

          {/* Slider 2: Vật tư phụ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-[#392A28]">
                    2. Vật tư phụ &amp; Bao bì
                  </label>
                  <span
                    title="Giấy gói hoa cao cấp, ruy-băng lụa, thiệp, xốp cắm oasis, túi xách hoa"
                    className="text-[#92827C] hover:text-[#392A28] cursor-help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-[#92827C]">
                  Giấy gói, nơ lụa, thiệp chúc mừng, xốp cắm
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#392A28] bg-[#FAF7F3] px-3 py-1 rounded-xl border border-[#EAE1DA] tabular-nums">
                <span>{formatVND(variables.packagingCost)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="200000"
                step="5000"
                value={variables.packagingCost}
                onChange={(e) =>
                  updateVar('packagingCost', parseInt(e.target.value) || 0)
                }
                style={{
                  background: `linear-gradient(to right, #B77E79 0%, #B77E79 ${(variables.packagingCost / 200000) * 100}%, #FAF7F3 ${(variables.packagingCost / 200000) * 100}%, #FAF7F3 100%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#B77E79] border-none"
              />
              <div className="flex items-center justify-between text-[11px] text-[#92827C]">
                <span className="w-20 text-left tabular-nums">0₫</span>
                <span className="flex-1 text-center font-medium text-[#392A28]">
                  {variables.packagingCost === 0 ? '0₫ (Không phụ phí)' : '30.000₫ (Chuẩn Solelia)'}
                </span>
                <span className="w-20 text-right tabular-nums">200.000₫</span>
              </div>
            </div>
          </div>

          {/* Slider 3: Công cắm hoa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-[#392A28]">
                    3. Tiền công thợ cắm hoa
                  </label>
                  <span
                    title="Chi phí trả công cho florist cắm hoặc định mức giờ làm việc"
                    className="text-[#92827C] hover:text-[#392A28] cursor-help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-[#92827C]">
                  {variables.laborCostType === 'fixed'
                    ? 'Mức cố định cho từng mẫu'
                    : 'Tính theo % trên tổng nguyên liệu'}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-[#FAF7F3] p-0.5 rounded-lg border border-[#EAE1DA] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    updateVar('laborCostType', 'fixed');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    variables.laborCostType === 'fixed'
                      ? 'bg-[#392A28] text-white shadow-xs font-semibold'
                      : 'text-[#92827C] hover:text-[#392A28]'
                  }`}
                >
                  Cố định (đ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateVar('laborCostType', 'percent');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    variables.laborCostType === 'percent'
                      ? 'bg-[#392A28] text-white shadow-xs font-semibold'
                      : 'text-[#92827C] hover:text-[#392A28]'
                  }`}
                >
                  Theo % hoa
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {variables.laborCostType === 'fixed' ? (
                <>
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="5000"
                    value={variables.laborCostValue}
                    onChange={(e) =>
                      updateVar('laborCostValue', parseInt(e.target.value) || 0)
                    }
                    style={{
                      background: `linear-gradient(to right, #B77E79 0%, #B77E79 ${(variables.laborCostValue / 300000) * 100}%, #FAF7F3 ${(variables.laborCostValue / 300000) * 100}%, #FAF7F3 100%)`,
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#B77E79] border-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#92827C]">
                    <span className="w-20 text-left tabular-nums">0₫</span>
                    <span className="flex-1 text-center font-bold text-[#392A28] tabular-nums">
                      {formatVND(variables.laborCostValue)}
                    </span>
                    <span className="w-20 text-right tabular-nums">300.000₫</span>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={variables.laborCostValue}
                    onChange={(e) =>
                      updateVar('laborCostValue', parseInt(e.target.value) || 0)
                    }
                    style={{
                      background: `linear-gradient(to right, #B77E79 0%, #B77E79 ${(variables.laborCostValue / 40) * 100}%, #FAF7F3 ${(variables.laborCostValue / 40) * 100}%, #FAF7F3 100%)`,
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#B77E79] border-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#92827C]">
                    <span className="w-20 text-left tabular-nums">0%</span>
                    <span className="flex-1 text-center font-bold text-[#392A28] tabular-nums">
                      {variables.laborCostValue}% (~{formatVND(Math.round(rawFlowerCost * (variables.laborCostValue / 100)))})
                    </span>
                    <span className="w-20 text-right tabular-nums">40%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Slider 4: Chi phí vận hành & Giao hàng */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-[#392A28]">
                    4. Chi phí vận hành, bảo quản &amp; Ship
                  </label>
                  <span
                    title="Điện lạnh kho hoa, dung dịch dưỡng hoa Chrysal, khấu hao bình xô, trợ cấp giao hàng"
                    className="text-[#92827C] hover:text-[#392A28] cursor-help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-[#92827C]">
                  Điện lạnh, dưỡng hoa Chrysal, ship hoa
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#392A28] bg-[#FAF7F3] px-3 py-1 rounded-xl border border-[#EAE1DA] tabular-nums">
                <span>{variables.overheadPercent}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={variables.overheadPercent}
                onChange={(e) =>
                  updateVar('overheadPercent', parseInt(e.target.value) || 0)
                }
                style={{
                  background: `linear-gradient(to right, #B77E79 0%, #B77E79 ${(variables.overheadPercent / 20) * 100}%, #FAF7F3 ${(variables.overheadPercent / 20) * 100}%, #FAF7F3 100%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#B77E79] border-none"
              />
              <div className="flex items-center justify-between text-[11px] text-[#92827C]">
                <span className="w-20 text-left tabular-nums">0%</span>
                <span className="flex-1 text-center font-medium text-[#392A28]">
                  0% (Chuẩn Solelia)
                </span>
                <span className="w-20 text-right tabular-nums">20%</span>
              </div>
            </div>
          </div>

          {/* Slider 5: Chiến lược định giá & Biên lợi nhuận */}
          <div className="space-y-2 pt-2 border-t border-[#EAE1DA]/70">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-[#392A28]">
                    5. Mục tiêu Lợi nhuận mong muốn
                  </label>
                </div>
                <p className="text-xs text-[#92827C]">
                  {variables.pricingMode === 'markup'
                    ? `Hệ số nhân x${variables.markupFactor} tương ứng lãi ${variables.targetMarginPercent}%`
                    : `Biên lãi ${variables.targetMarginPercent}% trên giá bán`}
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center bg-[#FAF7F3] p-0.5 rounded-lg border border-[#EAE1DA] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => updateVar('pricingMode', 'margin')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    variables.pricingMode === 'margin'
                      ? 'bg-[#392A28] text-white shadow-xs font-semibold'
                      : 'text-[#92827C] hover:text-[#392A28]'
                  }`}
                >
                  % Biên lãi
                </button>
                <button
                  type="button"
                  onClick={() => updateVar('pricingMode', 'markup')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    variables.pricingMode === 'markup'
                      ? 'bg-[#392A28] text-white shadow-xs font-semibold'
                      : 'text-[#92827C] hover:text-[#392A28]'
                  }`}
                >
                  Hệ số nhân (x)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {variables.pricingMode === 'margin' ? (
                <>
                  <input
                    type="range"
                    min="0"
                    max="75"
                    step="1"
                    value={variables.targetMarginPercent}
                    onChange={(e) =>
                      handleMarginChange(parseInt(e.target.value) || 0)
                    }
                    className="w-full h-2 bg-[#FAF7F3] rounded-lg appearance-none cursor-pointer accent-[#B77E79]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#92827C]">
                    <span className="w-20 text-left tabular-nums">0%</span>
                    <span className="flex-1 text-center font-bold text-[#392A28] tabular-nums">
                      {variables.targetMarginPercent}% (Tương ứng nhân x{variables.markupFactor})
                    </span>
                    <span className="w-20 text-right tabular-nums">75%</span>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.05"
                    value={variables.markupFactor}
                    onChange={(e) =>
                      handleMarkupChange(parseFloat(e.target.value) || 1.0)
                    }
                    style={{
                      background: `linear-gradient(to right, #B77E79 0%, #B77E79 ${((variables.markupFactor - 1) / 3) * 100}%, #FAF7F3 ${((variables.markupFactor - 1) / 3) * 100}%, #FAF7F3 100%)`,
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#B77E79] border-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#92827C]">
                    <span className="w-20 text-left tabular-nums">x1.0</span>
                    <span className="flex-1 text-center font-bold text-[#392A28] tabular-nums">
                      x{variables.markupFactor} (Biên lãi {variables.targetMarginPercent}%)
                    </span>
                    <span className="w-20 text-right tabular-nums">x4.0</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
