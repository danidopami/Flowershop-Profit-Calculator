import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Edit2,
  Check,
  RotateCcw,
  Download,
} from 'lucide-react';
import { WholesaleFlowerItem, FlowerCategory, FlowerOrigin } from '../types';
import { formatVND } from '../utils/calculator';
import { SoleliaLogo } from './SoleliaLogo';

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

  const handleExportCSV = () => {
    const headers = ['Mã', 'Tên hoa', 'Tên tiếng Trung', 'Danh mục', 'Xuất xứ', 'Quy cách', 'Giá kho (VND)', 'Số cành/bó', 'Giá cành (VND)'];
    const rows = catalog.map((f) => [
      f.id,
      `"${f.name}"`,
      `"${f.originalChineseName || ''}"`,
      `"${f.category}"`,
      `"${f.origin}"`,
      `"${f.packUnit}"`,
      f.packPrice,
      f.stemsPerPack,
      f.unitPrice,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Gia_Kho_Tri_Hai_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-[#EAE1DA] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file CSV</span>
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
                      <div className="font-semibold text-[#392A28]">
                        {item.name}
                        {item.isCustom && (
                          <span className="ml-1.5 text-[10px] text-[#B77E79] bg-[#F4E8E4] border border-[#EAE1DA] px-1.5 py-0.5 rounded font-normal">
                            Tự thêm
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#92827C] mt-0.5">
                        <span className="text-[#392A28] font-medium">{item.origin}</span>
                        {item.originalChineseName && (
                          <>
                            <span>·</span>
                            <span>{item.originalChineseName}</span>
                          </>
                        )}
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
  );
};
