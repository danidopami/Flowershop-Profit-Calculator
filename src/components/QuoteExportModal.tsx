import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  User,
  Heart,
  Package,
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
  orderQuantity?: number;
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
  orderQuantity = 1,
  breakdown,
}) => {
  const [shopName, setShopName] = useState('Solelia - Tiệm Hoa Ấm Áp');
  const [shopPhone, setShopPhone] = useState('0963 282 807');
  const [clientName, setClientName] = useState('Khách hàng thân thiết');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [cardMessage, setCardMessage] = useState(
    'Chúc bạn một ngày luôn rạng rỡ và ngập tràn hạnh phúc!'
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const unitPrice = breakdown.roundedPrice;
  const totalPrice = unitPrice * orderQuantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#392A28]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Scaled-down compact boutique receipt modal (max-w-xl) */}
      <div className="bg-[#FAF7F3] rounded-2xl max-w-xl w-full border border-[#EAE1DA] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Action Bar (Hidden on print) */}
        <div className="no-print bg-[#392A28] text-white px-5 py-3 flex items-center justify-between border-b border-[#392A28]">
          <div className="flex items-center gap-2.5">
            <SoleliaLogo size="sm" showText={false} />
            <h3 className="font-serif-title font-bold text-sm sm:text-base">
              Phiếu Báo Giá &amp; Đơn Hàng
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F3] hover:bg-white text-[#392A28] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#B77E79]" />
              <span>In / Lưu PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#EAE1DA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet View - Scaled & Compact */}
        <div className="p-5 sm:p-7 text-[#392A28] space-y-4 bg-white" id="printable-quote">
          {/* Shop Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#392A28] pb-3.5 gap-3">
            <div className="flex items-center gap-2.5">
              <SoleliaLogo size="sm" showText={false} />
              <div>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="font-serif-title font-bold text-xl sm:text-2xl text-[#392A28] bg-transparent border-b border-transparent hover:border-[#EAE1DA] focus:border-[#B77E79] focus:outline-none w-full"
                />
                <p className="text-[11px] text-[#92827C] mt-0.5">
                  Thiết kế hoa tươi nghệ thuật · Báo giá và cam kết chất lượng hoa tươi
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-[#92827C] space-y-0.5 tabular-nums">
              <div>
                Hotline / Zalo:{' '}
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-stone-300 focus:outline-none text-[#392A28] font-semibold w-24 text-right"
                />
              </div>
              <div>
                Ngày lập:{' '}
                <span className="font-semibold text-[#392A28]">{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="text-[10px] text-[#92827C]/70">Số phiếu: #SL-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* Client & Order Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF7F3] rounded-xl p-3.5 border border-[#EAE1DA] text-xs">
            <div className="space-y-1.5">
              <div className="font-semibold text-[#392A28] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B77E79]" />
                <span>Thông tin khách hàng:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-14 shrink-0">Họ tên:</span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-white border border-[#EAE1DA] rounded px-2 py-0.5 text-[#392A28] font-medium flex-1 focus:outline-none focus:ring-1 focus:ring-[#B77E79]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-14 shrink-0">Điện thoại:</span>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="bg-white border border-[#EAE1DA] rounded px-2 py-0.5 text-[#392A28] flex-1 focus:outline-none focus:ring-1 focus:ring-[#B77E79]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-semibold text-[#392A28] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B77E79]" />
                <span>Thông tin đơn giao:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-14 shrink-0">Phân loại:</span>
                <span className="font-medium text-[#392A28]">{category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-14 shrink-0">Ngày giao:</span>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="bg-white border border-[#EAE1DA] rounded px-2 py-0.5 text-[#392A28] focus:outline-none focus:ring-1 focus:ring-[#B77E79] tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Clean Order Product Table (No individual flower details) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#392A28]">
              <Package className="w-3.5 h-3.5 text-[#B77E79]" />
              <span>Sản phẩm &amp; Báo giá</span>
            </div>

            <div className="border border-[#EAE1DA] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F3] text-[#392A28] uppercase font-semibold text-[11px] border-b border-[#EAE1DA]">
                  <tr>
                    <th className="py-2.5 px-3">Mẫu hoa / Sản phẩm</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE1DA]">
                  <tr>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {photoUrl && (
                          <img
                            src={photoUrl}
                            alt={recipeName}
                            className="w-10 h-10 rounded-lg object-cover border border-[#EAE1DA] shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-serif-title font-bold text-sm text-[#392A28]">
                            {recipeName || 'Bó hoa tươi thiết kế'}
                          </div>
                          <div className="text-[11px] text-[#92827C]">
                            Hình thức: {category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#392A28] tabular-nums">
                      {orderQuantity} bó
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#392A28]">
                      {formatVND(unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#392A28] tabular-nums">
                      {formatVND(totalPrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Message Note */}
          <div className="bg-[#FAF7F3] rounded-xl p-3 border border-[#EAE1DA] text-xs space-y-1">
            <div className="font-semibold text-[#392A28] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#B77E79]" />
              <span>Nội dung thiệp chúc mừng đi kèm:</span>
            </div>
            <textarea
              rows={2}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              className="w-full bg-white border border-[#EAE1DA] rounded-lg p-2 text-[#392A28] text-xs focus:outline-none focus:ring-1 focus:ring-[#B77E79]"
            />
          </div>

          {/* Price Summary & Payment */}
          <div className="border-t-2 border-[#392A28] pt-3.5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="text-[11px] text-[#92827C] space-y-0.5">
              <p>• Hoa được bảo dưỡng trong dung dịch chuyên dụng cao cấp.</p>
              <p>• Tặng kèm thiệp chúc mừng, túi xách cao cấp Solelia.</p>
              <p>• Vui lòng đặt cọc 50% khi chốt mẫu thiết kế.</p>
            </div>

            <div className="bg-[#FAF7F3] rounded-xl p-3.5 border border-[#EAE1DA] min-w-56 text-right space-y-0.5 shrink-0">
              <div className="text-[11px] font-semibold text-[#92827C] uppercase tracking-wider">
                Tổng tiền thanh toán:
              </div>
              <div className="font-serif-title text-2xl sm:text-3xl font-bold text-[#392A28] tabular-nums">
                {formatVND(totalPrice)}
              </div>
              {orderQuantity > 1 && (
                <div className="text-[10px] text-[#92827C]">
                  ({orderQuantity} bó x {formatVND(unitPrice)})
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-xs pt-6 border-t border-[#EAE1DA]">
            <div>
              <p className="font-bold text-[#392A28]">Người đặt hoa</p>
              <p className="text-[#92827C] mt-10 text-[11px]">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold text-[#392A28]">Solelia - Tiệm Hoa Ấm Áp</p>
              <p className="text-[#92827C] mt-10 text-[11px]">Đại diện tiệm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
