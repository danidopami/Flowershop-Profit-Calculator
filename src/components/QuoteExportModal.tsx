import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  User,
  Heart,
  ImageIcon,
} from 'lucide-react';
import { CostVariables, FinancialBreakdown, RecipeItem } from '../types';
import { formatVND } from '../utils/calculator';
import { SoleliaLogo } from './SoleliaLogo';

interface QuoteExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  category: string;
  photoUrl?: string;
  items: RecipeItem[];
  variables: CostVariables;
  breakdown: FinancialBreakdown;
}

export const QuoteExportModal: React.FC<QuoteExportModalProps> = ({
  isOpen,
  onClose,
  recipeName,
  category,
  photoUrl,
  items,
  variables,
  breakdown,
}) => {
  const [shopName, setShopName] = useState('Tiệm Hoa Soleliá');
  const [shopPhone, setShopPhone] = useState('0963 282 807');
  const [clientName, setClientName] = useState('Khách hàng thân thiết');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [cardMessage, setCardMessage] = useState(
    'Chúc bạn một ngày luôn rạng rỡ và ngập tràn hạnh phúc!'
  );
  const [showCostBreakdownToClient, setShowCostBreakdownToClient] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#f9f4f0] rounded-2xl max-w-3xl w-full border border-[#eedfd5] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Action Bar (Hidden on print) */}
        <div className="no-print bg-[#5d3a3a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SoleliaLogo size="sm" showText={false} />
            <h3 className="font-bold text-sm sm:text-base">
              Phiếu Báo Giá &amp; Đơn Hàng Mẫu Hoa
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="hidden sm:flex items-center gap-2 text-xs text-[#eedfd5] cursor-pointer">
              <input
                type="checkbox"
                checked={showCostBreakdownToClient}
                onChange={(e) => setShowCostBreakdownToClient(e.target.checked)}
                className="rounded border-[#734848] text-[#5d3a3a] focus:ring-[#5d3a3a]"
              />
              <span>In đơn giá vốn nội bộ</span>
            </label>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f9f4f0] hover:bg-white text-[#5d3a3a] transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In / Lưu PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#eedfd5] hover:text-white rounded-lg hover:bg-[#4a2e2e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet View */}
        <div className="p-6 sm:p-10 text-stone-800 space-y-6 bg-white" id="printable-quote">
          {/* Shop Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#5d3a3a] pb-5 gap-4">
            <div className="flex items-center gap-3">
              <SoleliaLogo size="md" showText={false} />
              <div>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="font-title font-bold text-2xl sm:text-3xl text-[#5d3a3a] bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#5d3a3a] focus:outline-none w-full"
                  style={{ fontFamily: "'Noto Serif Display', Georgia, serif" }}
                />
                <p className="text-xs text-[#7c6363] mt-0.5">
                  Thiết kế hoa tươi nghệ thuật · Báo giá và cam kết chất lượng hoa nhập khẩu
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-600 space-y-0.5 tabular-nums">
              <div>
                Hotline / Zalo:{' '}
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-stone-300 focus:outline-none text-[#5d3a3a] font-semibold"
                />
              </div>
              <div>
                Ngày lập:{' '}
                <span className="font-semibold">{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="text-stone-400">Số phiếu: #SL-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* Client & Event Info with Bouquet Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f9f4f0] rounded-xl p-4 border border-[#eedfd5] text-xs">
            {photoUrl && (
              <div className="sm:col-span-1 rounded-lg overflow-hidden border border-[#eedfd5] aspect-square max-h-40 bg-white">
                <img
                  src={photoUrl}
                  alt={recipeName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className={`space-y-1.5 ${photoUrl ? 'sm:col-span-1' : 'sm:col-span-1'}`}>
              <div className="font-semibold text-[#5d3a3a] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#7c6363]" />
                <span>Thông tin khách hàng:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500 w-16">Họ tên:</span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-white border border-[#eedfd5] rounded px-2 py-1 text-stone-900 font-medium flex-1 focus:outline-none focus:ring-1 focus:ring-[#5d3a3a]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500 w-16">Điện thoại:</span>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="bg-white border border-[#eedfd5] rounded px-2 py-1 text-stone-900 flex-1 focus:outline-none focus:ring-1 focus:ring-[#5d3a3a]"
                />
              </div>
            </div>

            <div className={`space-y-1.5 ${photoUrl ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
              <div className="font-semibold text-[#5d3a3a] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7c6363]" />
                <span>Chi tiết đơn đặt:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500 w-16">Mẫu hoa:</span>
                <span className="font-bold text-stone-900">{recipeName}</span>
                <span className="text-stone-400">({category})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500 w-16">Ngày giao:</span>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="bg-white border border-[#eedfd5] rounded px-2 py-0.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#5d3a3a] tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Flowers Breakdown Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-[#5d3a3a]">
              Định lượng hoa &amp; Nguyên liệu sử dụng
            </h4>
            <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-[#f9f4f0] text-[#5d3a3a] uppercase font-semibold">
                <tr>
                  <th className="py-2 px-3">STT</th>
                  <th className="py-2 px-3">Chủng loại hoa &amp; Nguyên liệu</th>
                  <th className="py-2 px-3">Quy cách</th>
                  <th className="py-2 px-3 text-center">Số lượng</th>
                  {showCostBreakdownToClient && (
                    <th className="py-2 px-3 text-right">Đơn giá gốc</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 text-stone-500 tabular-nums">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">
                      {item.flowerName}
                    </td>
                    <td className="py-2 px-3 text-stone-600">{item.packSpecification}</td>
                    <td className="py-2 px-3 text-center font-bold text-[#5d3a3a] tabular-nums">
                      {item.quantity} {item.unitType}
                    </td>
                    {showCostBreakdownToClient && (
                      <td className="py-2 px-3 text-right text-stone-600 tabular-nums">
                        {formatVND(item.unitPrice)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card Message Note */}
          <div className="bg-[#f9f4f0] rounded-xl p-3 border border-[#eedfd5] text-xs space-y-1">
            <div className="font-semibold text-[#5d3a3a] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#5d3a3a]" />
              <span>Nội dung thiệp chúc mừng đi kèm:</span>
            </div>
            <textarea
              rows={2}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              className="w-full bg-white border border-[#eedfd5] rounded-lg p-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5d3a3a]"
            />
          </div>

          {/* Price Summary & Payment */}
          <div className="border-t-2 border-[#5d3a3a] pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="text-xs text-stone-500 space-y-1">
              <p>• Hoa được bảo dưỡng trong dung dịch chuyên dụng cao cấp.</p>
              <p>• Tặng kèm thiệp chúc mừng, túi xách cao cấp Soleliá.</p>
              <p>• Vui lòng đặt cọc 50% khi chốt mẫu thiết kế.</p>
            </div>

            <div className="bg-[#f9f4f0] rounded-xl p-4 border border-[#eedfd5] min-w-64 text-right space-y-1">
              <div className="text-xs font-semibold text-[#7c6363] uppercase">
                Tổng tiền thanh toán:
              </div>
              <div className="font-title text-3xl font-extrabold text-[#5d3a3a] tabular-nums"
                   style={{ fontFamily: "'Noto Serif Display', Georgia, serif" }}>
                {formatVND(breakdown.roundedPrice)}
              </div>
              <div className="text-[11px] text-stone-500">
                (Đã bao gồm hoa tươi, vật tư phụ và công cắm hoa)
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-xs pt-8 border-t border-stone-200">
            <div>
              <p className="font-bold text-stone-800">Người đặt hoa</p>
              <p className="text-stone-400 mt-12">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold text-[#5d3a3a]">Tiệm Hoa Soleliá</p>
              <p className="text-stone-400 mt-12">Đại diện tiệm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
