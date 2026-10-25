/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Undo2,
  FileSpreadsheet,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RecipeBuilder } from './components/RecipeBuilder';
import { CostSliders } from './components/CostSliders';
import { FinancialDashboard } from './components/FinancialDashboard';
import { QuoteExportModal } from './components/QuoteExportModal';
import { RecipeLibraryModal } from './components/RecipeLibraryModal';
import { WholesaleCatalogModal } from './components/WholesaleCatalogModal';
import { INITIAL_WHOLESALE_FLOWERS } from './data/triHaiFlowers';
import { PRESET_RECIPES } from './data/presetRecipes';
import {
  CostVariables,
  RecipeItem,
  SavedRecipe,
  WholesaleFlowerItem,
} from './types';
import {
  calculateFinancialBreakdown,
  calculateRawFlowerCost,
  formatVND,
} from './utils/calculator';

const LOCAL_STORAGE_RECIPES_KEY = 'solelia_saved_recipes_v2';
const LOCAL_STORAGE_CATALOG_KEY = 'solelia_wholesale_catalog_v2';

export default function App() {
  // Wholesale Flowers Catalog State (loaded from localStorage or default)
  const [wholesaleCatalog, setWholesaleCatalog] = useState<WholesaleFlowerItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WHOLESALE_FLOWERS;
  });

  // Saved Recipes Library State
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECIPES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return PRESET_RECIPES;
  });

  // Active View / Modals
  const [activeTab, setActiveTab] = useState<'calculator' | 'library' | 'catalog'>('calculator');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Undo delete tracker
  const [undoState, setUndoState] = useState<{
    item: RecipeItem;
    index: number;
  } | null>(null);

  // Active Recipe State
  const defaultPreset = PRESET_RECIPES[0];
  const [recipeName, setRecipeName] = useState<string>(defaultPreset?.name || 'Bó hoa mới');
  const [category, setCategory] = useState<string>(defaultPreset?.category || 'Bó hoa tươi');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(defaultPreset?.photoUrl);
  const [description, setDescription] = useState<string>(defaultPreset?.description || '');
  const [orderQuantity, setOrderQuantity] = useState<number>(1); // Number of bouquets in this order
  const [items, setItems] = useState<RecipeItem[]>(defaultPreset?.items || []);
  const [variables, setVariables] = useState<CostVariables>(defaultPreset?.variables || {
    wastagePercent: 5,
    packagingCost: 30000,
    laborCostType: 'fixed',
    laborCostValue: 0,
    overheadPercent: 0,
    pricingMode: 'markup',
    targetMarginPercent: 50,
    markupFactor: 2.0,
    shippingCost: 0,
  });
  const [roundOption, setRoundOption] = useState<number>(10000); // Default round up to 10.000₫

  // Set web tab document title
  useEffect(() => {
    document.title = 'Solelia - Tiệm hoa nhỏ của 2 người iu nhau | Quản lý & Tính giá';
  }, []);

  // Sync images from source data (INITIAL_WHOLESALE_FLOWERS) into the live catalog
  // This ensures existing users get updated images without losing their custom prices.
  useEffect(() => {
    setWholesaleCatalog(prev => {
      let changed = false;
      const updated = prev.map(item => {
        const source = INITIAL_WHOLESALE_FLOWERS.find(s => s.id === item.id);
        if (source && source.imageUrl && source.imageUrl !== item.imageUrl) {
          changed = true;
          return { ...item, imageUrl: source.imageUrl };
        }
        return item;
      });
      return changed ? updated : prev;
    });
  }, []);

  // Persist Catalog to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(wholesaleCatalog));
    } catch (e) {
      console.error(e);
    }
  }, [wholesaleCatalog]);

  // Persist Recipes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(savedRecipes));
    } catch (e) {
      console.error(e);
    }
  }, [savedRecipes]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Item deleted handler with Undo support
  const handleItemDeletedWithUndo = (deletedItem: RecipeItem, index: number) => {
    setUndoState({ item: deletedItem, index });
    setTimeout(() => {
      setUndoState((current) => (current?.item.id === deletedItem.id ? null : current));
    }, 6000);
  };

  // Undo delete action
  const handleUndoDelete = () => {
    if (!undoState) return;
    const restored = [...items];
    restored.splice(undoState.index, 0, undoState.item);
    setItems(restored);
    showToast(`Đã khôi phục "${undoState.item.flowerName}"`);
    setUndoState(null);
  };

  // Raw flower cost
  const rawFlowerCost = useMemo(() => calculateRawFlowerCost(items), [items]);

  // Financial breakdown
  const breakdown = useMemo(
    () => calculateFinancialBreakdown(items, variables, roundOption),
    [items, variables, roundOption]
  );

  // Handler: Load Preset by ID
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_RECIPES.find((p) => p.id === presetId);
    if (!preset) return;
    setRecipeName(preset.name);
    setCategory(preset.category);
    setPhotoUrl(preset.photoUrl);
    setItems(preset.items);
    setVariables(preset.variables);
    showToast(`Đã nạp công thức mẫu "${preset.name}"`);
  };

  // Handler: Load Saved Recipe from Library
  const handleLoadRecipe = (recipe: SavedRecipe) => {
    setRecipeName(recipe.name);
    setCategory(recipe.category);
    setPhotoUrl(recipe.photoUrl);
    setDescription(recipe.description || '');
    setItems(recipe.items);
    setVariables(recipe.variables);
    setActiveTab('calculator');
    showToast(`Đã nạp công thức "${recipe.name}"`);
  };

  // Handler: Save Current Recipe
  const handleSaveRecipe = () => {
    let nameToSave = recipeName.trim();
    if (!nameToSave) {
      if (items.length > 0) {
        nameToSave = `Bó hoa ${items[0]?.flowerName || 'tươi'} (${new Date().toLocaleDateString('vi-VN')})`;
      } else {
        nameToSave = `Mẫu hoa ${new Date().toLocaleDateString('vi-VN')}`;
      }
      setRecipeName(nameToSave);
    }

    const newRecipe: SavedRecipe = {
      id: `recipe-${Date.now()}`,
      name: nameToSave,
      category: category || 'Bó hoa tươi',
      description: description.trim() || undefined,
      photoUrl: photoUrl,
      items: items,
      variables: variables,
      savedAt: new Date().toISOString(),
      totalCost: breakdown.totalCost,
      suggestedPrice: breakdown.roundedPrice,
    };

    setSavedRecipes((prev) => [
      newRecipe,
      ...prev.filter((r) => r.name !== newRecipe.name),
    ]);
    showToast(`Đã lưu "${nameToSave}" vào thư viện mẫu!`);
  };

  // Handler: Duplicate Recipe
  const handleDuplicateRecipe = (recipe: SavedRecipe) => {
    const duplicated: SavedRecipe = {
      ...recipe,
      id: `recipe-copy-${Date.now()}`,
      name: `${recipe.name} (Bản sao)`,
      savedAt: new Date().toISOString(),
    };
    setSavedRecipes((prev) => [duplicated, ...prev]);
    showToast(`Đã tạo bản sao cho "${recipe.name}"`);
  };

  // Handler: Delete Recipe
  const handleDeleteRecipe = (id: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
    showToast('Đã xóa mẫu hoa khỏi thư viện');
  };

  // Handler: Update photo of a recipe in library
  const handleUpdateRecipePhoto = (recipeId: string, newPhotoUrl: string) => {
    setSavedRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, photoUrl: newPhotoUrl } : r))
    );
    showToast('Đã cập nhật ảnh mẫu hoa');
  };

  // Handler: Restore default presets
  const handleRestorePresets = () => {
    setSavedRecipes(PRESET_RECIPES);
    showToast('Đã khôi phục các công thức mẫu tiêu chuẩn');
  };

  // Handler: New Blank Recipe
  const handleNewRecipe = () => {
    setRecipeName('Bó Hoa Mới');
    setCategory('Bó hoa tươi');
    setPhotoUrl(undefined);
    setDescription('');
    setOrderQuantity(1);
    setItems([]);
    setVariables({
      wastagePercent: 5,
      packagingCost: 30000,
      laborCostType: 'fixed',
      laborCostValue: 0,
      overheadPercent: 0,
      pricingMode: 'markup',
      targetMarginPercent: 50,
      markupFactor: 2.0,
      shippingCost: 0,
    });
    setRoundOption(10000);
    showToast('Đã tạo bảng tính công thức mới');
  };

  // Reset Catalog to Trí Hải Factory List
  const handleResetCatalog = () => {
    setWholesaleCatalog(INITIAL_WHOLESALE_FLOWERS);
    showToast('Đã khôi phục toàn bộ bảng giá sỉ gốc');
  };

  const handleScrollToCostSliders = () => {
    const el = document.getElementById('cost-sliders-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#392A28] flex selection:bg-[#F4E8E4] selection:text-[#B77E79]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#392A28] text-white rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#B77E79]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Undo Banner Toast */}
      {undoState && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#392A28] text-white rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 border border-[#48423a]">
          <span>Đã xóa "{undoState.item.flowerName}"</span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F3] text-[#392A28] rounded-lg font-bold hover:bg-white transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>
        </div>
      )}

      {/* Slim Boutique Left Sidebar matching reference */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedRecipes.length}
        catalogCount={wholesaleCatalog.length}
        onNewRecipe={handleNewRecipe}
        onOpenCostSliders={handleScrollToCostSliders}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Header Bar matching reference */}
        <TopBar
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onNewRecipe={handleNewRecipe}
          onOpenLibrary={() => setActiveTab('library')}
          savedCount={savedRecipes.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* 2-Column Responsive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Working Column: Recipe Ingredients & Sliders (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recipe Builder */}
              <RecipeBuilder
                recipeName={recipeName}
                setRecipeName={setRecipeName}
                category={category}
                setCategory={setCategory}
                photoUrl={photoUrl}
                setPhotoUrl={setPhotoUrl}
                orderQuantity={orderQuantity}
                setOrderQuantity={setOrderQuantity}
                items={items}
                setItems={setItems}
                wholesaleCatalog={wholesaleCatalog}
                rawFlowerCost={rawFlowerCost}
                onLoadPreset={handleLoadPreset}
                onItemDeletedWithUndo={handleItemDeletedWithUndo}
                onSaveRecipe={handleSaveRecipe}
              />

              {/* Cost Sliders (5 financial variables) */}
              <div id="cost-sliders-section">
                <CostSliders
                  variables={variables}
                  setVariables={setVariables}
                  rawFlowerCost={rawFlowerCost}
                />
              </div>
            </div>

            {/* Right Sticky Column: Pricing & Cost Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              <FinancialDashboard
                recipeName={recipeName}
                category={category}
                orderQuantity={orderQuantity}
                variables={variables}
                setVariables={setVariables}
                breakdown={breakdown}
                roundOption={roundOption}
                setRoundOption={setRoundOption}
                onSaveRecipe={handleSaveRecipe}
                onOpenQuote={() => setIsQuoteOpen(true)}
              />
            </div>
          </div>
        </main>

        {/* Mobile Sticky Bottom Bar (Useful for Florists at Wholesale Market) */}
        <div className="block lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#EAE1DA] p-3 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[11px] text-[#92827C] font-medium">
                {orderQuantity > 1 ? `Tổng đơn (${orderQuantity} bó):` : 'Giá bán đề nghị:'}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-xl font-bold text-[#392A28] tabular-nums">
                  {formatVND(breakdown.roundedPrice * orderQuantity)}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#7B8061]/15 text-[#7B8061] border border-[#7B8061]/30">
                  Lãi: {variables.targetMarginPercent}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsQuoteOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#392A28] text-white shadow-xs hover:bg-[#251717] transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất báo giá</span>
            </button>
          </div>
        </div>

        {/* Subtle Luxury Footer */}
        <footer className="mt-auto border-t border-[#EAE1DA]/70 bg-white/40 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#92827C]">
            <div className="flex items-center gap-2">
              <span className="font-serif-title font-bold text-[#392A28]">Solelia</span>
              <span>·</span>
              <span>Tiệm Hoa Ấm Áp</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Dữ liệu giá sỉ: Kho Trí Hải</span>
              <span>·</span>
              <span>Bản quyền © Solelia - Tiệm Hoa Ấm Áp</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <QuoteExportModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        recipeName={recipeName}
        setRecipeName={setRecipeName}
        category={category}
        setCategory={setCategory}
        photoUrl={photoUrl}
        orderQuantity={orderQuantity}
        items={items}
        variables={variables}
        breakdown={breakdown}
      />

      <RecipeLibraryModal
        isOpen={activeTab === 'library'}
        onClose={() => setActiveTab('calculator')}
        recipes={savedRecipes}
        onLoadRecipe={handleLoadRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onDuplicateRecipe={handleDuplicateRecipe}
        onUpdatePhoto={handleUpdateRecipePhoto}
        onRestorePresets={handleRestorePresets}
      />

      <WholesaleCatalogModal
        isOpen={activeTab === 'catalog'}
        onClose={() => setActiveTab('calculator')}
        catalog={wholesaleCatalog}
        setCatalog={setWholesaleCatalog}
        onResetCatalog={handleResetCatalog}
      />
    </div>
  );
}
