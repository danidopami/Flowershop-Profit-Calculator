import React, { useState, useRef } from 'react';
import {
  X,
  Calendar,
  User,
  Heart,
  Package,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
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
  const [shopPhone, setShopPhone] = useState('0373466639');
  const [clientName, setClientName] = useState('Khách hàng thân thiết');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [deliveryTime, setDeliveryTime] = useState('09:00');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [cardMessage, setCardMessage] = useState(
    'Chúc bạn một ngày luôn rạng rỡ và ngập tràn hạnh phúc!'
  );
  const [isCopying, setIsCopying] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!quoteRef.current) return;
    try {
      const dataUrl = await toPng(quoteRef.current, { backgroundColor: '#ffffff', quality: 1.0 });
      const link = document.createElement('a');
      link.download = `solelia-quote-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const handleCopyImage = async () => {
    if (!quoteRef.current) return;
    setIsCopying(true);
    try {
      const blob = await toBlob(quoteRef.current, { backgroundColor: '#ffffff', quality: 1.0 });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setTimeout(() => setIsCopying(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
      setIsCopying(false);
    }
  };

  const unitPrice = breakdown.roundedPrice;
  const bouquetTotal = unitPrice * orderQuantity;
  const totalPrice = bouquetTotal + (shippingFee || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#392A28]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Scaled-down compact boutique receipt modal (max-w-lg) */}
      <div className="bg-[#FAF7F3] rounded-2xl max-w-lg w-full border border-[#EAE1DA] shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Action Bar */}
        <div className="bg-[#392A28] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#392A28]">
          <div className="flex items-center gap-2">
            <SoleliaLogo size="sm" showText={false} />
            <h3 className="font-bold text-xs sm:text-sm">
              Phiếu Báo Giá
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleCopyImage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {isCopying ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{isCopying ? 'Đã copy' : 'Copy ảnh'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg bg-[#FAF7F3] hover:bg-white text-[#392A28] transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-[#B77E79]" />
              <span>Lưu ảnh</span>
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
        <div className="p-4 sm:p-6 text-[#392A28] space-y-3 bg-white" ref={quoteRef}>
          {/* Shop Header */}
          <div className="flex items-center justify-between border-b-2 border-[#392A28] pb-2.5">
            <div className="flex items-center gap-2">
              <SoleliaLogo size="sm" showText={false} />
              <div>
                <h2 className="font-serif-title font-bold text-lg text-[#392A28]">Solelia</h2>
                <p className="text-[10px] text-[#92827C]">Tiệm Hoa Ấm Áp</p>
              </div>
            </div>

            <div className="text-right text-[10px] text-[#92827C] space-y-0.5 tabular-nums">
              <div>
                Zalo:{' '}
                <span className="text-[#392A28] font-bold">{shopPhone}</span>
              </div>
              <div>
                Ngày lập:{' '}
                <span className="font-semibold text-[#392A28]">{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Client & Order Info Box - More Compact */}
          <div className="bg-[#FAF7F3] rounded-xl p-3 border border-[#EAE1DA] text-[11px] space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-16 shrink-0">Khách hàng:</span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-transparent border-b border-[#EAE1DA]/50 text-[#392A28] font-semibold flex-1 focus:outline-none focus:border-[#B77E79]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-16 shrink-0">Điện thoại:</span>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-transparent border-b border-[#EAE1DA]/50 text-[#392A28] flex-1 focus:outline-none focus:border-[#B77E79]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-16 shrink-0">Ngày giao:</span>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="bg-transparent border-b border-[#EAE1DA]/50 text-[#392A28] focus:outline-none focus:border-[#B77E79]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-16 shrink-0">Giờ giao:</span>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="bg-transparent border-b border-[#EAE1DA]/50 text-[#392A28] focus:outline-none focus:border-[#B77E79]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#92827C] w-16 shrink-0 font-bold text-[#B77E79]">Tiền ship:</span>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(parseInt(e.target.value) || 0)}
                  className="bg-transparent border-b border-[#EAE1DA]/50 text-[#392A28] font-bold flex-1 focus:outline-none focus:border-[#B77E79] tabular-nums"
                />
              </div>
            </div>
            <div className="flex items-start gap-2 border-t border-[#EAE1DA]/30 pt-1.5">
              <span className="text-[#92827C] w-16 shrink-0 pt-0.5">Địa chỉ:</span>
              <textarea
                rows={1}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Địa chỉ nhận hoa..."
                className="bg-transparent border-b border-[#EAE1DA]/50 text-[#392A28] flex-1 focus:outline-none focus:border-[#B77E79] resize-none"
              />
            </div>
          </div>

          {/* Card Message Note */}
          <div className="bg-white rounded-xl p-2.5 border border-[#EAE1DA] text-[11px] space-y-1">
            <div className="font-semibold text-[#392A28] flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-[#B77E79]" />
              <span>Nội dung thiệp:</span>
            </div>
            <textarea
              rows={1}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              className="w-full bg-[#FAF7F3] border border-[#EAE1DA] rounded-lg p-2 text-[#392A28] focus:outline-none focus:ring-1 focus:ring-[#B77E79] resize-none"
            />
          </div>

          {/* Simple Product List */}
          <div className="border border-[#EAE1DA] rounded-xl overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#FAF7F3] text-[#392A28] uppercase font-bold text-[9px] border-b border-[#EAE1DA]">
                <tr>
                  <th className="py-2 px-3">Sản phẩm</th>
                  <th className="py-2 px-2 text-center">SL</th>
                  <th className="py-2 px-2 text-right">Đơn giá</th>
                  <th className="py-2 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE1DA]">
                <tr className="bg-white">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#392A28]">{recipeName || 'Bó hoa tươi thiết kế'}</div>
                    <div className="text-[9px] text-[#92827C]">{category}</div>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold">{orderQuantity}</td>
                  <td className="py-2.5 px-2 text-right tabular-nums">{formatVND(unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">{formatVND(bouquetTotal)}</td>
                </tr>
                {shippingFee > 0 && (
                  <tr className="bg-white">
                    <td colSpan={3} className="py-2 px-3 text-right text-[#92827C] font-medium">Phí vận chuyển (Tiền ship):</td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">{formatVND(shippingFee)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary & Notes */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
            <div className="flex-1 space-y-1.5">
              <div className="text-[9px] text-[#92827C] leading-relaxed">
                <p className="font-bold text-[#392A28] mb-0.5">Ghi chú:</p>
                <p>• Hoa được bọc gốc trong nước dưỡng hoa chuyên dụng, vui lòng không để bó hoa nằm ngang.</p>
                <p>• Tặng kèm thiệp viết tay theo yêu cầu, vải chắn gió và túi đựng hoa cao cấp Solelia.</p>
                <p>• Vui lòng đặt cọc 50% khi chốt mẫu thiết kế.</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              {/* QR Placeholder */}
              <div className="w-20 h-20 bg-[#FAF7F3] border border-[#EAE1DA] rounded-lg flex items-center justify-center text-[8px] text-[#92827C] text-center p-1">
                QR Chuyển khoản
              </div>
              
              <div className="bg-[#FAF7F3] rounded-xl p-3 border border-[#EAE1DA] min-w-[160px] text-right space-y-0.5">
                <div className="text-[9px] font-bold text-[#92827C] uppercase tracking-wider">Tổng thanh toán:</div>
                <div className="text-xl font-bold text-[#392A28] tabular-nums">
                  {formatVND(totalPrice)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-[#92827C] pt-4 border-t border-[#EAE1DA]/50">
            Cảm ơn quý khách đã tin tưởng Solelia - Tiệm Hoa Ấm Áp!
          </div>
        </div>
      </div>
    </div>
  );
};

