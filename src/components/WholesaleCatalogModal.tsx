import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Edit2,
  Check,
  RotateCcw,
  Download,
  Upload,
  AlertCircle,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { WholesaleFlowerItem, FlowerCategory, FlowerOrigin } from '../types';
import { formatVND } from '../utils/calculator';
import { SoleliaLogo } from './SoleliaLogo';
import { FlowerIcon } from './FlowerIcon';
import { parseCSV, normalizeString } from '../utils/csvParser';

interface WholesaleCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: WholesaleFlowerItem[];
  setCatalog: React.Dispatch<React.SetStateAction<WholesaleFlowerItem[]>>;
  onResetCatalog: () => void;
}

export const WholesaleCatalogModal: React.FC<WholesaleCatalogModalProps> = ({
  isOpen,
  onClose,
  catalog,
  setCatalog,
  onResetCatalog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStems, setEditStems] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    newItems: WholesaleFlowerItem[];
    priceChangedItems: Array<{ item: WholesaleFlowerItem; oldPrice: number; newPrice: number }>;
    unchangedCount: number;
    missingCount: number;
    reviewItems: WholesaleFlowerItem[];
  } | null>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // New flower form state
  const [newName, setNewName] = useState('');
  const [newChinese, setNewChinese] = useState('');
  const [newOrigin, setNewOrigin] = useState<FlowerOrigin>('Trung Quốc');
  const [newCategory, setNewCategory] = useState<FlowerCategory>('Hoa hồng');
  const [newPackUnit, setNewPackUnit] = useState('Bó 20 cành');
  const [newPackPrice, setNewPackPrice] = useState<number>(150000);
  const [newStemsPerPack, setNewStemsPerPack] = useState<number>(20);
  const [newNote, setNewNote] = useState('');

  if (!isOpen) return null;

  const origins = ['Tất cả', 'Trung Quốc', 'Hà Lan', 'Malaysia', 'Ecuador', 'Đà Lạt', 'Nam Phi'];
  const categories = [
    'Tất cả',
    'Hoa hồng',
    'Cúc & Mẫu đơn',
    'Tulip',
    'Calla Lily',
    'Cát tường',
    'Lan & Địa Lan',
    'Cỏ & Lá phụ',
    'Hoa khô & Hoa phụ',
  ];

  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.originalChineseName && item.originalChineseName.includes(searchTerm)) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin =
      selectedOrigin === 'Tất cả' || item.origin === selectedOrigin;
    const matchesCat =
      selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchesSearch && matchesOrigin && matchesCat;
  });

  const handleStartEdit = (item: WholesaleFlowerItem) => {
    setEditingId(item.id);
    setEditPrice(item.packPrice);
    setEditStems(item.stemsPerPack);
  };

  const handleSaveEdit = (id: string) => {
    const stems = Math.max(1, editStems);
    const unitPrice = Math.round(editPrice / stems);
    setCatalog((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              packPrice: editPrice,
              stemsPerPack: stems,
              unitPrice: unitPrice,
            }
          : item
      )
    );
    setEditingId(null);
  };

  const handleAddNewFlower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const stems = Math.max(1, newStemsPerPack);
    const unitPrice = Math.round(newPackPrice / stems);

    const newItem: WholesaleFlowerItem = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      originalChineseName: newChinese.trim() || undefined,
      category: newCategory,
      origin: newOrigin,
      packUnit: newPackUnit.trim(),
      packPrice: newPackPrice,
      stemsPerPack: stems,
      unitPrice,
      note: newNote.trim() || undefined,
      isCustom: true,
    };

    setCatalog([newItem, ...catalog]);
    setShowAddForm(false);
    setNewName('');
    setNewChinese('');
    setNewNote('');
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rawRows = parseCSV(text);
      if (rawRows.length === 0) return;

      // Load manual stems per pack from localStorage
      let manualStems: Record<string, number> = {};
      try {
        const saved = localStorage.getItem('solelia_manual_stems_v1');
        if (saved) manualStems = JSON.parse(saved);
      } catch (e) {}

      const newCatalog: WholesaleFlowerItem[] = [];
      const priceChangedItems: Array<{ item: WholesaleFlowerItem; oldPrice: number; newPrice: number }> = [];
      let unchangedCount = 0;
      const reviewItems: WholesaleFlowerItem[] = [];
      const processedIds = new Set<string>();

      // Mapping logic
      rawRows.forEach((row) => {
        const id = row.id || `import-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const name = row.name || 'Hoa chưa đặt tên';
        const priceVnd = parseInt(row.price_vnd) || 0;
        const packMin = parseInt(row.pack_min) || 0;
        const priceUnit = row.price_unit?.toLowerCase();
        
        let stemsPerPack = packMin;
        if (priceUnit === 'bo' && !packMin) {
          stemsPerPack = manualStems[id] || 1;
        } else if (priceUnit === 'canh') {
          stemsPerPack = 1;
        }

        const unitPrice = stemsPerPack > 0 ? Math.round((priceUnit === 'canh' ? priceVnd : priceVnd / stemsPerPack)) : priceVnd;

        const newItem: WholesaleFlowerItem = {
          id,
          name,
          section: row.section,
          category: (row.section as FlowerCategory) || 'Khác',
          origin: (row.origin as FlowerOrigin) || 'Trung Quốc',
          packUnit: row.price_unit === 'bo' ? `Bó ${stemsPerPack} cành` : 'Cành lẻ',
          packPrice: priceVnd,
          stemsPerPack,
          unitPrice,
          note: row.note,
          review: row.review,
          supplier: row.supplier,
          priceDate: row.price_date,
          page: row.page,
        };

        if (newItem.review) {
          reviewItems.push(newItem);
        }

        // Matching
        const existing = catalog.find(f => f.id === id) || 
                         catalog.find(f => normalizeString(f.name) === normalizeString(name));

        if (existing) {
          if (existing.unitPrice !== unitPrice) {
            priceChangedItems.push({ item: newItem, oldPrice: existing.unitPrice, newPrice: unitPrice });
          } else {
            unchangedCount++;
          }
          processedIds.add(existing.id);
        } else {
          // It's a truly new item
        }
        
        newCatalog.push(newItem);
      });

      const missingInImport = catalog.filter(f => !processedIds.has(f.id));
      
      setImportPreview({
        newItems: newCatalog.filter(n => !catalog.some(e => e.id === n.id || normalizeString(e.name) === normalizeString(n.name))),
        priceChangedItems,
        unchangedCount,
        missingCount: missingInImport.length,
        reviewItems,
      });
      setImportFile(file);
      setShowImportPreview(true);
      
      // Store temporary result to apply later
      (window as any)._tempImportCatalog = [
        ...newCatalog,
        ...missingInImport.map(f => ({ ...f, isMissingInLatestImport: true }))
      ];
    };
    reader.readAsText(file);
  };

  const applyImport = () => {
    if ((window as any)._tempImportCatalog) {
      setCatalog((window as any)._tempImportCatalog);
      delete (window as any)._tempImportCatalog;
      setShowImportPreview(false);
      setImportPreview(null);
      setImportFile(null);
    }
  };

  const isStale = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      const priceDate = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now.getTime() - priceDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 14;
    } catch (e) {
      return false;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#392A28]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF7F3] rounded-2xl max-w-5xl w-full border border-[#EAE1DA] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#392A28] text-white px-6 py-4 flex items-center justify-between border-b border-[#392A28]">
          <div className="flex items-center gap-3">
            <SoleliaLogo size="sm" showText={false} />
            <div>
              <h3 className="font-serif-title font-bold text-lg tracking-tight">
                Bảng giá nhập sỉ Kho Trí Hải
              </h3>
              <p className="text-xs text-[#EAE1DA]/80">
                Cập nhật giá sỉ theo kiện, bó nhập khẩu ({catalog.length} mã hoa)
              </p>
            </div>
          </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportCSV}
              accept=".csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-[#EAE1DA] transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập bảng giá</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F3] hover:bg-white text-[#392A28] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#B77E79]" />
              <span>Thêm hoa mới</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#EAE1DA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Add Flower Inline Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddNewFlower}
            className="p-5 bg-white border-b border-[#EAE1DA] space-y-3 text-xs"
          >
            <div className="font-serif-title font-bold text-sm text-[#392A28] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#B77E79]" />
              <span>Thêm loại hoa mới vào danh mục kho</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Tên hoa</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="VD: Hồng Juliet Vàng..."
                  className="w-full bg-[#f9f4f0] border border-[#eedfd5] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Tên tiếng Trung (nếu có)</label>
                <input
                  type="text"
                  value={newChinese}
                  onChange={(e) => setNewChinese(e.target.value)}
                  placeholder="VD: 黄朱丽叶"
                  className="w-full bg-[#f9f4f0] border border-[#eedfd5] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Xuất xứ</label>
                <select
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value as any)}
                  className="w-full bg-[#f9f4f0] border border-[#eedfd5] rounded-lg p-2"
                >
                  <option value="Trung Quốc">Trung Quốc</option>
                  <option value="Hà Lan">Hà Lan</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Đà Lạt">Đà Lạt</option>
                  <option value="Nam Phi">Nam Phi</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Phân loại</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#f9f4f0] border border-[#eedfd5] rounded-lg p-2"
                >
                  <option value="Hoa hồng">Hoa hồng</option>
                  <option value="Cúc & Mẫu đơn">Cúc & Mẫu đơn</option>
                  <option value="Tulip">Tulip</option>
                  <option value="Calla Lily">Calla Lily</option>
                  <option value="Cát tường">Cát tường</option>
                  <option value="Lan & Địa Lan">Lan & Địa Lan</option>
                  <option value="Cỏ & Lá phụ">Cỏ & Lá phụ</option>
                  <option value="Hoa khô & Hoa phụ">Hoa khô & Hoa phụ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Quy cách bó</label>
                <input
                  type="text"
                  value={newPackUnit}
                  onChange={(e) => setNewPackUnit(e.target.value)}
                  placeholder="VD: Bó 20 cành, Cành lẻ..."
                  className="w-full bg-[#f9f4f0] border border-[#eedfd5] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Giá kho (đ/bó)</label>
                <input
                  type="number"
                  required
                  value={newPackPrice}
                  onChange={(e) => setNewPackPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#f9f4f0] border border-[#eedfd5] rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Số cành / bó</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newStemsPerPack}
                  onChange={(e) => setNewStemsPerPack(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#f9f4f0] border border-[#eedfd5] rounded-lg p-2 font-mono"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="w-full bg-[#B77E79] hover:bg-[#a66e69] text-white font-medium py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Lưu hoa
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 bg-[#FAF7F3] hover:bg-[#EAE1DA] text-[#92827C] py-2 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#EAE1DA] bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#92827C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm loại hoa theo tên, chữ Hán, danh mục..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#FAF7F3] border border-[#EAE1DA] rounded-xl text-[#392A28] placeholder-[#92827C] focus:outline-none focus:ring-2 focus:ring-[#B77E79]/30 focus:border-[#B77E79]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetCatalog}
                title="Khôi phục bảng giá mặc định ban đầu"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#392A28] bg-[#FAF7F3] border border-[#EAE1DA] hover:bg-[#F4E8E4] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#B77E79]" />
                <span>Đặt lại bảng giá gốc</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[#92827C] text-[11px] font-medium mr-1">Xuất xứ:</span>
            {origins.map((orig) => (
              <button
                key={orig}
                type="button"
                onClick={() => setSelectedOrigin(orig)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedOrigin === orig
                    ? 'bg-[#392A28] text-white shadow-xs'
                    : 'bg-[#FAF7F3] text-[#92827C] border border-[#EAE1DA] hover:bg-[#F4E8E4] hover:text-[#392A28]'
                }`}
              >
                {orig}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="p-4 sm:p-6 max-h-[55vh] overflow-y-auto">
          <div className="overflow-x-auto border border-[#EAE1DA] rounded-xl bg-white">
            <table className="w-full text-left text-xs divide-y divide-[#EAE1DA]">
              <thead className="bg-[#FAF7F3] text-[#392A28] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Tên hoa &amp; Xuất xứ</th>
                  <th className="py-2.5 px-3">Danh mục</th>
                  <th className="py-2.5 px-3">Quy cách kho</th>
                  <th className="py-2.5 px-3 text-right">Giá kho (đ)</th>
                  <th className="py-2.5 px-3 text-center">Số cành</th>
                  <th className="py-2.5 px-3 text-right">Giá vốn cành (đ)</th>
                  <th className="py-2.5 px-3 text-center w-16">Sửa giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE1DA] bg-white font-sans">
                {filteredCatalog.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF7F3] transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <FlowerIcon name={item.name} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-[#392A28] flex items-center gap-1.5">
                            <span className="truncate">{item.name}</span>
                            {item.isCustom && (
                              <span className="shrink-0 text-[10px] text-[#B77E79] bg-[#F4E8E4] border border-[#EAE1DA] px-1.5 py-0.5 rounded font-normal">
                                Tự thêm
                              </span>
                            )}
                            {item.isMissingInLatestImport && (
                              <span className="shrink-0 text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-normal">
                                không có trong bảng giá mới
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#92827C] mt-0.5">
                            <span className="text-[#392A28] font-medium">{item.origin}</span>
                            {item.priceDate && (
                              <div className={`flex items-center gap-1 ${isStale(item.priceDate) ? 'text-rose-500 font-bold' : ''}`}>
                                <Clock className="w-3 h-3" />
                                <span>{item.priceDate}</span>
                              </div>
                            )}
                            {item.supplier && <span>· {item.supplier}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-[#92827C] font-medium">
                      {item.category}
                    </td>

                    <td className="py-2.5 px-3 text-[#92827C]">
                      {item.packUnit}
                    </td>

                    {/* Pack Price */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#392A28] tabular-nums">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          step="1000"
                          value={editPrice}
                          onChange={(e) =>
                            setEditPrice(parseInt(e.target.value) || 0)
                          }
                          className="w-24 px-1 py-0.5 text-right font-mono font-bold bg-white border border-[#B77E79] rounded"
                        />
                      ) : (
                        formatVND(item.packPrice)
                      )}
                    </td>

                    {/* Stems */}
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-[#392A28]">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="1"
                          value={editStems}
                          onChange={(e) =>
                            setEditStems(parseInt(e.target.value) || 1)
                          }
                          className="w-12 px-1 py-0.5 text-center font-mono bg-white border border-[#B77E79] rounded"
                        />
                      ) : (
                        item.stemsPerPack
                      )}
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#B77E79] tabular-nums">
                      {editingId === item.id
                        ? formatVND(
                            Math.round(editPrice / Math.max(1, editStems))
                          )
                        : formatVND(item.unitPrice)}
                    </td>

                    {/* Edit Actions */}
                    <td className="py-2.5 px-3 text-center">
                      {editingId === item.id ? (
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-1 text-white bg-[#B77E79] hover:bg-[#a66e69] rounded cursor-pointer"
                          title="Lưu giá mới"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1 text-[#92827C] hover:text-[#392A28] rounded hover:bg-[#FAF7F3] cursor-pointer"
                          title="Sửa giá nhập"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {/* Import Preview Modal */}
      {showImportPreview && importPreview && (
        <div className="fixed inset-0 z-[60] bg-[#392A28]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#B77E79] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <h3 className="font-bold">Xem trước bảng giá mới</h3>
              </div>
              <button onClick={() => setShowImportPreview(false)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="text-xs text-blue-600 font-bold mb-1">MỚI</div>
                  <div className="text-2xl font-bold text-blue-700">{importPreview.newItems.length}</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="text-xs text-amber-600 font-bold mb-1">THAY ĐỔI GIÁ</div>
                  <div className="text-2xl font-bold text-amber-700">{importPreview.priceChangedItems.length}</div>
                </div>
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                  <div className="text-xs text-green-600 font-bold mb-1">GIỮ NGUYÊN</div>
                  <div className="text-2xl font-bold text-green-700">{importPreview.unchangedCount}</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="text-xs text-rose-600 font-bold mb-1">THIẾU TRONG FILE</div>
                  <div className="text-2xl font-bold text-rose-700">{importPreview.missingCount}</div>
                </div>
              </div>

              {/* Price Changes List */}
              {importPreview.priceChangedItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#392A28] flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-500" />
                    Thay đổi giá ({importPreview.priceChangedItems.length})
                  </h4>
                  <div className="border border-[#EAE1DA] rounded-xl overflow-hidden divide-y divide-[#EAE1DA]">
                    {importPreview.priceChangedItems.map(({ item, oldPrice, newPrice }) => {
                      const diff = newPrice - oldPrice;
                      const percent = Math.round((diff / oldPrice) * 100);
                      const isLargeChange = Math.abs(percent) > 10;
                      
                      return (
                        <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-stone-50">
                          <div>
                            <div className="font-bold text-[#392A28]">{item.name}</div>
                            <div className="text-[#92827C]">{item.packUnit}</div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-[#92827C] line-through">{formatVND(oldPrice)}</span>
                              <ChevronRight className="w-3 h-3 text-[#92827C]" />
                              <span className={`font-bold ${diff > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                                {formatVND(newPrice)}
                              </span>
                            </div>
                            <div className={`text-[10px] font-bold ${isLargeChange ? 'bg-rose-100 text-rose-600 px-1 rounded' : 'text-[#92827C]'}`}>
                              {diff > 0 ? '+' : ''}{percent}% {isLargeChange && '(Biến động mạnh)'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Review Items List */}
              {importPreview.reviewItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Lưu ý đặc biệt ({importPreview.reviewItems.length})
                  </h4>
                  <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 space-y-3">
                    {importPreview.reviewItems.map(item => (
                      <div key={item.id} className="text-xs">
                        <span className="font-bold text-[#392A28]">{item.name}: </span>
                        <span className="text-rose-700 italic">"{item.review}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#FAF7F3] border-t border-[#EAE1DA] flex gap-3">
              <button
                onClick={applyImport}
                className="flex-1 bg-[#B77E79] hover:bg-[#9E6965] text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Áp dụng bảng giá mới
              </button>
              <button
                onClick={() => {
                  setShowImportPreview(false);
                  setImportPreview(null);
                  setImportFile(null);
                }}
                className="px-6 border border-[#EAE1DA] text-[#92827C] font-bold py-3 rounded-xl hover:bg-[#EAE1DA]/30 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
