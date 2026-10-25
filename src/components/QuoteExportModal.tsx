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
  const [shopName] = useState('Solelia');
  const [shopPhone] = useState('0373466639');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTime, setDeliveryTime] = useState('09:00');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [cardMessage, setCardMessage] = useState('');
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
      <div className="bg-[#FAF7F3] rounded-2xl max-w-md w-full border border-[#EAE1DA] shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Action Bar */}
        <div className="bg-[#392A28] text-white px-4 py-2 flex items-center justify-between border-b border-[#392A28]">
          <div className="flex items-center gap-2">
            <SoleliaLogo size="xs" showText={false} />
            <h3 className="font-bold text-xs">Phiếu báo giá</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyImage}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {isCopying ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{isCopying ? 'Đã copy' : 'Copy ảnh'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-[#FAF7F3] hover:bg-white text-[#392A28] transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-[#B77E79]" />
              <span>Lưu ảnh</span>
            </button>

            <button type="button" onClick={onClose} className="p-1 text-[#EAE1DA] hover:text-white rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Sheet View */}
        <div className="p-3 sm:p-4 text-[#392A28] space-y-2 bg-white" ref={quoteRef}>
          {/* Shop Header */}
          <div className="flex items-center justify-between border-b border-[#392A28] pb-1.5">
            <div className="flex items-center gap-1.5">
              <SoleliaLogo size="xs" showText={false} />
              <div>
                <h2 className="font-serif-title font-bold text-sm text-[#392A28] leading-tight">Solelia</h2>
                <p className="text-[8px] text-[#92827C]">Tiệm hoa nhỏ của 2 người iu nhau</p>
              </div>
            </div>

            <div className="text-right text-[8px] text-[#92827C] space-y-0.5 tabular-nums">
              <div>Zalo: <span className="text-[#392A28] font-bold">{shopPhone}</span></div>
              <div>Ngày: <span className="font-semibold text-[#392A28]">{new Date().toLocaleDateString('vi-VN')}</span></div>
            </div>
          </div>

          {/* Client Info Grid */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] bg-[#FAF7F3] p-2 rounded-xl border border-[#EAE1DA]">
            <div className="flex flex-col gap-0.5">
              <span className="text-[#92827C] font-bold uppercase text-[7px]">Người nhận</span>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="..." className="bg-transparent border-b border-[#EAE1DA] font-bold focus:outline-none py-0.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#92827C] font-bold uppercase text-[7px]">Số điện thoại</span>
              <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="..." className="bg-transparent border-b border-[#EAE1DA] focus:outline-none py-0.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#92827C] font-bold uppercase text-[7px]">Ngày giao</span>
              <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="bg-transparent border-b border-[#EAE1DA] focus:outline-none py-0.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#92827C] font-bold uppercase text-[7px]">Giờ giao</span>
              <input type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="bg-transparent border-b border-[#EAE1DA] focus:outline-none py-0.5" />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5">
              <span className="text-[#92827C] font-bold uppercase text-[7px]">Địa chỉ giao</span>
              <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Nhập địa chỉ..." className="bg-transparent border-b border-[#EAE1DA] focus:outline-none py-0.5" />
            </div>
          </div>

          {/* Card Message */}
          <div className="bg-white rounded-xl p-1.5 border border-[#EAE1DA] text-[9px] space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Heart className="w-2 h-2 text-[#B77E79]" />
              <span>Nội dung thiệp:</span>
            </div>
            <textarea rows={1} value={cardMessage} onChange={e => setCardMessage(e.target.value)} className="w-full bg-[#FAF7F3] border border-[#EAE1DA] rounded-lg p-1 focus:outline-none text-[#392A28] resize-none leading-normal" />
          </div>

          {/* Order Table */}
          <div className="border border-[#EAE1DA] rounded-xl overflow-hidden">
            <table className="w-full text-left text-[9px]">
              <thead className="bg-[#FAF7F3] text-[#392A28] font-bold text-[7px] uppercase tracking-wider">
                <tr className="border-b border-[#EAE1DA]">
                  <th className="py-1 px-2">Sản phẩm</th>
                  <th className="py-1 px-1 text-center">SL</th>
                  <th className="py-1 px-1 text-right">Đơn giá</th>
                  <th className="py-1 px-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE1DA]">
                <tr>
                  <td className="py-1.5 px-2">
                    <div className="font-bold leading-tight">{recipeName || 'Bó hoa tươi'}</div>
                    <div className="text-[7px] text-[#92827C]">{category}</div>
                  </td>
                  <td className="py-1.5 px-1 text-center font-bold tabular-nums">{orderQuantity}</td>
                  <td className="py-1.5 px-1 text-right tabular-nums">{formatVND(unitPrice)}</td>
                  <td className="py-1.5 px-2 text-right font-bold tabular-nums">{formatVND(bouquetTotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-1 px-2 text-right font-medium text-[#92827C]">Tiền ship:</td>
                  <td className="py-1 px-2 text-right font-bold tabular-nums">
                    <input 
                      type="number" 
                      value={shippingFee || ''} 
                      onChange={e => setShippingFee(Number(e.target.value))} 
                      placeholder="0"
                      className="w-16 text-right bg-[#FAF7F3] rounded px-1 focus:outline-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="flex gap-2 pt-1 items-start">
            <div className="flex-1 text-[7px] text-[#92827C] leading-tight space-y-0.5">
              <p className="font-bold text-[#392A28]">Ghi chú:</p>
              <p>• Hoa được bọc gốc trong nước dưỡng hoa chuyên dụng, vui lòng không để bó hoa nằm ngang.</p>
              <p>• Tặng kèm thiệp viết tay theo yêu cầu, vải chắn gió và túi đựng hoa cao cấp Solelia.</p>
              <p>• Vui lòng đặt cọc 50% khi chốt mẫu thiết kế.</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
               <div className="w-12 h-12 bg-[#FAF7F3] border border-[#EAE1DA] rounded-lg flex items-center justify-center text-[6px] text-[#92827C] text-center p-1 font-bold">
                 QR BANK
               </div>
               <div className="text-right">
                  <div className="text-[7px] font-bold text-[#B77E79] uppercase tracking-wider">Tổng thanh toán</div>
                  <div className="text-base font-bold text-[#392A28] tabular-nums leading-none mt-0.5">{formatVND(totalPrice)}</div>
               </div>
            </div>
          </div>

          <div className="text-center text-[7px] text-[#92827C] pt-2 border-t border-[#EAE1DA]">
            Cảm ơn quý khách đã tin tưởng Solelia - Tiệm hoa nhỏ của 2 người iu nhau!
          </div>
        </div>

      </div>
    </div>
  );
};

