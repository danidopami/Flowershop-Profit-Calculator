import React from 'react';
import { HelpCircle } from 'lucide-react';
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
  const updateVar = <K extends keyof CostVariables>(
    key: K,
    val: CostVariables[K]
  ) => {
    setVariables((prev) => ({ ...prev, [key]: val }));
  };

  const handleMarginChange = (margin: number) => {
    const clamped = Math.min(Math.max(margin, 10), 85);
    setVariables((prev) => ({
      ...prev,
      targetMarginPercent: clamped,
      markupFactor: marginToMarkup(clamped),
    }));
  };

  const handleMarkupChange = (markup: number) => {
    const clamped = Math.min(Math.max(markup, 1.1), 5.0);
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
    <div className="bg-white rounded-2xl border border-[#eedfd5] p-5 sm:p-6 shadow-xs space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#eedfd5]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5d3a3a]"></span>
          <h2
            className="text-lg sm:text-xl font-bold text-[#5d3a3a] tracking-tight font-title"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tùy chỉnh chi phí &amp; Lợi nhuận
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#557a66] font-medium bg-[#eef3ef] px-2.5 py-1 rounded-full border border-[#cde0d5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#557a66]"></span>
          <span>Đã lưu tự động</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Slider 1: Hao hụt nguyên liệu */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold text-[#5d3a3a]">
                  1. Tỉ lệ hao hụt nguyên liệu
                </label>
                <span
                  title="Tính hoa gãy dập, thối gốc khi ngâm nước, cắt tỉa lá gốc"
                  className="text-stone-400 hover:text-stone-600 cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Tiền bù hao hụt: +{formatVND(wastageCostPreview)}
              </p>
            </div>

            <div className="flex items-center gap-1 text-sm font-bold text-[#5d3a3a] bg-[#f9f4f0] px-3 py-1 rounded-xl border border-[#eedfd5] tabular-nums">
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
              className="w-full h-2 bg-[#f0e3db] rounded-lg appearance-none cursor-pointer accent-[#5d3a3a]"
            />
            {/* Perfectly aligned 3-part scale */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="w-20 text-left tabular-nums">0%</span>
              <span className="flex-1 text-center font-medium text-[#5d3a3a]">
                10% (Chuẩn tiệm hoa)
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
                <label className="text-sm font-semibold text-[#5d3a3a]">
                  2. Vật tư phụ &amp; Bao bì
                </label>
                <span
                  title="Giấy gói hoa cao cấp, ruy-băng lụa, thiệp, xốp cắm oasis, túi xách hoa"
                  className="text-stone-400 hover:text-stone-600 cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Giấy gói, nơ lụa, thiệp chúc mừng, xốp cắm
              </p>
            </div>

            <div className="flex items-center gap-1 text-sm font-bold text-[#5d3a3a] bg-[#f9f4f0] px-3 py-1 rounded-xl border border-[#eedfd5] tabular-nums">
              <span>{formatVND(variables.packagingCost)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={variables.packagingCost}
              onChange={(e) =>
                updateVar('packagingCost', parseInt(e.target.value) || 0)
              }
              className="w-full h-2 bg-[#f0e3db] rounded-lg appearance-none cursor-pointer accent-[#5d3a3a]"
            />
            {/* Perfectly aligned 3-part scale */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="w-20 text-left tabular-nums">10.000₫</span>
              <span className="flex-1 text-center font-medium text-[#5d3a3a]">
                35.000₫ (Bó tiêu chuẩn)
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
                <label className="text-sm font-semibold text-[#5d3a3a]">
                  3. Tiền công thợ cắm hoa
                </label>
                <span
                  title="Chi phí trả công cho florist cắm hoặc định mức giờ làm việc"
                  className="text-stone-400 hover:text-stone-600 cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {variables.laborCostType === 'fixed'
                  ? 'Mức cố định cho từng mẫu'
                  : 'Tính theo % trên tổng nguyên liệu'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-[#f9f4f0] p-0.5 rounded-lg border border-[#eedfd5] text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  updateVar('laborCostType', 'fixed');
                  if (variables.laborCostValue < 1000) {
                    updateVar('laborCostValue', 50000);
                  }
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  variables.laborCostType === 'fixed'
                    ? 'bg-[#5d3a3a] text-white shadow-xs font-semibold'
                    : 'text-[#6e5454] hover:text-[#5d3a3a]'
                }`}
              >
                Cố định (đ)
              </button>
              <button
                type="button"
                onClick={() => {
                  updateVar('laborCostType', 'percent');
                  if (variables.laborCostValue > 100) {
                    updateVar('laborCostValue', 15);
                  }
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  variables.laborCostType === 'percent'
                    ? 'bg-[#5d3a3a] text-white shadow-xs font-semibold'
                    : 'text-[#6e5454] hover:text-[#5d3a3a]'
                }`}
              >
                Tỉ lệ (%)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-right mb-1">
            <span className="text-xs text-stone-400">
              {variables.laborCostType === 'fixed' ? 'Số tiền' : 'Phần trăm'}
            </span>
            <div className="text-sm font-bold text-[#5d3a3a] bg-[#f9f4f0] px-3 py-0.5 rounded-xl border border-[#eedfd5] tabular-nums">
              {variables.laborCostType === 'fixed'
                ? formatVND(variables.laborCostValue)
                : `${variables.laborCostValue}%`}
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
                  className="w-full h-2 bg-[#f0e3db] rounded-lg appearance-none cursor-pointer accent-[#5d3a3a]"
                />
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="w-20 text-left tabular-nums">0₫</span>
                  <span className="flex-1 text-center font-medium text-[#5d3a3a]">
                    50.000₫ (Chuẩn tiệm)
                  </span>
                  <span className="w-20 text-right tabular-nums">300.000₫</span>
                </div>
              </>
            ) : (
              <>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={variables.laborCostValue}
                  onChange={(e) =>
                    updateVar('laborCostValue', parseInt(e.target.value) || 0)
                  }
                  className="w-full h-2 bg-[#f0e3db] rounded-lg appearance-none cursor-pointer accent-[#5d3a3a]"
                />
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="w-20 text-left tabular-nums">0%</span>
                  <span className="flex-1 text-center font-medium text-[#5d3a3a]">
                    15% (Chuẩn tiệm)
                  </span>
                  <span className="w-20 text-right tabular-nums">50%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Slider 4: Vận hành & giao hàng */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold text-[#5d3a3a]">
                  4. Phân bổ vận hành &amp; giao hàng
                </label>
                <span
                  title="Tiền điện tủ mát bảo quản, nước dưỡng, mặt bằng, ship nội đô"
                  className="text-stone-400 hover:text-stone-600 cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Điện tủ mát, nước dưỡng, mặt bằng, ship
              </p>
            </div>

            <div className="flex items-center gap-1 text-sm font-bold text-[#5d3a3a] bg-[#f9f4f0] px-3 py-1 rounded-xl border border-[#eedfd5] tabular-nums">
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
              className="w-full h-2 bg-[#f0e3db] rounded-lg appearance-none cursor-pointer accent-[#5d3a3a]"
            />
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="w-20 text-left tabular-nums">0%</span>
              <span className="flex-1 text-center font-medium text-[#5d3a3a]">
                5% (Khuyên dùng)
              </span>
              <span className="w-20 text-right tabular-nums">20%</span>
            </div>
          </div>
        </div>

        {/* Slider 5: Lãi mong muốn (Renamed, subtitle removed, clean alignment) */}
        <div className="space-y-3 pt-3 border-t border-[#eedfd5]">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-[#5d3a3a]">
                5. Lãi mong muốn
              </label>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-[#f9f4f0] p-0.5 rounded-lg border border-[#eedfd5] text-xs font-medium">
              <button
                type="button"
                onClick={() => updateVar('pricingMode', 'margin')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  variables.pricingMode === 'margin'
                    ? 'bg-[#5d3a3a] text-white shadow-xs font-semibold'
                    : 'text-[#6e5454] hover:text-[#5d3a3a]'
                }`}
              >
                % Lợi nhuận
              </button>
              <button
                type="button"
                onClick={() => updateVar('pricingMode', 'markup')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  variables.pricingMode === 'markup'
                    ? 'bg-[#5d3a3a] text-white shadow-xs font-semibold'
                    : 'text-[#6e5454] hover:text-[#5d3a3a]'
                }`}
              >
                Hệ số (x)
              </button>
            </div>
          </div>

          {variables.pricingMode === 'margin' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Tỉ lệ lợi nhuận trên giá bán
                </span>
                <span className="text-base font-bold text-[#5d3a3a] tabular-nums">
                  {variables.targetMarginPercent}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="75"
                step="1"
                value={variables.targetMarginPercent}
                onChange={(e) =>
                  handleMarginChange(parseFloat(e.target.value) || 20)
                }
                className="w-full h-2.5 bg-[#f0e3db] rounded-lg appearance-none cursor-pointer accent-[#5d3a3a]"
              />
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="w-20 text-left tabular-nums">20%</span>
                <span className="flex-1 text-center font-medium text-[#5d3a3a]">
                  40% - 60% (Cửa hàng)
                </span>
                <span className="w-20 text-right tabular-nums">75%</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Hệ số nhân trên tổng chi phí
                </span>
                <span className="text-base font-bold text-[#5d3a3a] tabular-nums">
                  {variables.markupFactor}x
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="4.0"
                step="0.05"
                value={variables.markupFactor}
                onChange={(e) =>
                  handleMarkupChange(parseFloat(e.target.value) || 1.5)
                }
                className="w-full h-2.5 bg-[#f0e3db] rounded-lg appearance-none cursor-pointer accent-[#5d3a3a]"
              />
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="w-20 text-left tabular-nums">1.5x</span>
                <span className="flex-1 text-center font-medium text-[#5d3a3a]">
                  2.0x - 2.5x (Bán lẻ)
                </span>
                <span className="w-20 text-right tabular-nums">4.0x</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
