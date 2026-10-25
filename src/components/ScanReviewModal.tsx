import React, { useState, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Check, 
  AlertCircle, 
  Flower2, 
  Plus, 
  Minus, 
  Search,
  ChevronDown
} from 'lucide-react';
import { 
  AIScanResult, 
  WholesaleFlowerItem, 
  ScanResultItem 
} from '../types';
import { formatVND } from '../utils/calculator';

interface ScanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: AIScanResult;
  wholesaleCatalog: WholesaleFlowerItem[];
  onConfirm: (finalItems: { flower: WholesaleFlowerItem; quantity: number }[]) => void;
}

export const ScanReviewModal: React.FC<ScanReviewModalProps> = ({
  isOpen,
  onClose,
  scanResult,
  wholesaleCatalog,
  onConfirm,
}) => {
  const [items, setItems] = useState<ScanResultItem[]>(() => 
    scanResult.items.map(it => ({
      ...it,
      selectedId: it.candidates[0]?.id || ''
    }))
  );

  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCatalog = useMemo(() => {
    if (!searchTerm.trim()) return wholesaleCatalog.slice(0, 20);
    const q = searchTerm.toLowerCase();
    return wholesaleCatalog.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.id.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [searchTerm, wholesaleCatalog]);

  if (!isOpen) return null;

  const handleUpdateQty = (index: number, delta: number) => {
    const updated = [...items];
    const current = updated[index].stems;
    updated[index].stems = Math.max(1, Math.min(100, current + delta));
    setItems(updated);
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSelectCandidate = (index: number, id: string) => {
    if (id === 'search') {
      setActiveSearchIndex(index);
      setSearchTerm('');
    } else {
      const updated = [...items];
      updated[index].selectedId = id;
      setItems(updated);
    }
  };

  const handleSelectFromSearch = (flower: WholesaleFlowerItem) => {
    if (activeSearchIndex !== null) {
      const updated = [...items];
      updated[activeSearchIndex].selectedId = flower.id;
      // Add as a temporary candidate if not present
      if (!updated[activeSearchIndex].candidates.find(c => c.id === flower.id)) {
        updated[activeSearchIndex].candidates.push({ id: flower.id, confidence: 1 });
      }
      setItems(updated);
      setActiveSearchIndex(null);
    }
  };

  const handleSubmit = () => {
    const finalItems = items
      .map(it => {
        const flower = wholesaleCatalog.find(f => f.id === it.selectedId);
        return flower ? { flower, quantity: it.stems } : null;
      })
      .filter((it): it is { flower: WholesaleFlowerItem; quantity: number } => it !== null);
    
    onConfirm(finalItems);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F3] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#EAE1DA]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE1DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B77E79]/10 text-[#B77E79] flex items-center justify-center">
              <Flower2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#392A28]">Kết quả quét ảnh AI</h2>
              <p className="text-xs text-[#92827C]">Xác nhận các loại hoa và số lượng từ ảnh</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors text-[#92827C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-[#EAE1DA] bg-[#EAE1DA]">
            <img 
              src={scanResult.imageUrl} 
              alt="Bouquet" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#392A28] text-sm flex items-center gap-2">
              Danh sách hoa nhận diện được
              <span className="text-xs font-normal text-[#92827C]">({items.length} loại)</span>
            </h3>

            <div className="space-y-3">
              {items.map((item, index) => {
                const selectedFlower = wholesaleCatalog.find(f => f.id === item.selectedId);
                const confidence = item.candidates.find(c => c.id === item.selectedId)?.confidence || 0;
                const isLowConfidence = confidence < 0.6;

                return (
                  <div 
                    key={index}
                    className="p-4 bg-white rounded-2xl border border-[#EAE1DA] shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#B77E79] bg-[#FAF7F3] px-2 py-0.5 rounded-lg border border-[#EAE1DA]">
                            {item.label}
                          </span>
                          {isLowConfidence && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              Cần kiểm tra
                            </div>
                          )}
                        </div>

                        {/* Match Dropdown */}
                        <div className="relative mt-2">
                          <select
                            value={item.selectedId}
                            onChange={(e) => handleSelectCandidate(index, e.target.value)}
                            className="w-full pl-3 pr-10 py-2 text-sm bg-[#FAF7F3] border border-[#EAE1DA] rounded-xl focus:ring-1 focus:ring-[#B77E79] outline-none appearance-none cursor-pointer"
                          >
                            {item.candidates.map(c => {
                              const f = wholesaleCatalog.find(x => x.id === c.id);
                              return (
                                <option key={c.id} value={c.id}>
                                  {f?.name || 'Hoa lạ'} ({Math.round(c.confidence * 100)}%)
                                </option>
                              );
                            })}
                            <option value="search">+ Tìm hoa khác...</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#92827C] pointer-events-none" />
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-[#FAF7F3] rounded-xl border border-[#EAE1DA] p-1">
                          <button
                            onClick={() => handleUpdateQty(index, -1)}
                            className="p-1.5 hover:bg-white hover:text-[#B77E79] rounded-lg transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.stems}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              const updated = [...items];
                              updated[index].stems = Math.max(1, Math.min(100, val));
                              setItems(updated);
                            }}
                            className="w-12 text-center text-sm font-bold bg-transparent outline-none tabular-nums"
                          />
                          <button
                            onClick={() => handleUpdateQty(index, 1)}
                            className="p-1.5 hover:bg-white hover:text-[#B77E79] rounded-lg transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-[#92827C] font-medium">Cành</span>
                        
                        <button
                          onClick={() => handleRemove(index)}
                          className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unmatched Section */}
          {scanResult.unmatched.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#92827C] uppercase tracking-wider">
                Chưa có trong bảng giá
              </h4>
              <div className="flex flex-wrap gap-2">
                {scanResult.unmatched.map((text, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 bg-[#EAE1DA]/30 text-[#392A28] text-xs rounded-full border border-[#EAE1DA] italic"
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EAE1DA] bg-white flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-[#92827C] hover:bg-[#FAF7F3] rounded-2xl transition-all"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-[#B77E79] hover:bg-[#9E6965] text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
          >
            <Check className="w-5 h-5" />
            <span>Thêm vào công thức</span>
          </button>
        </div>
      </div>

      {/* Internal Flower Search Overlay */}
      {activeSearchIndex !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-[#EAE1DA] flex items-center justify-between">
              <h3 className="font-bold text-[#392A28]">Tìm hoa thay thế</h3>
              <button onClick={() => setActiveSearchIndex(null)} className="p-1 hover:bg-[#FAF7F3] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#92827C]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Nhập tên hoa để tìm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF7F3] border border-[#EAE1DA] rounded-xl outline-none focus:ring-1 focus:ring-[#B77E79] text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {filteredCatalog.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFromSearch(f)}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#FAF7F3] rounded-xl transition-colors text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#392A28] group-hover:text-[#B77E79] transition-colors">{f.name}</span>
                    <span className="text-[10px] text-[#92827C]">{f.origin} • {f.packUnit}</span>
                  </div>
                  <span className="text-xs font-bold text-[#B77E79]">{formatVND(f.unitPrice)}</span>
                </button>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="py-8 text-center text-[#92827C] text-sm italic">
                  Không tìm thấy hoa phù hợp
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
