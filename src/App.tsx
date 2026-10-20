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
import { Header } from './components/Header';
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

  // Undo delete tracker
  const [undoState, setUndoState] = useState<{
    item: RecipeItem;
    index: number;
  } | null>(null);

  // Active Recipe State
  const defaultPreset = PRESET_RECIPES[0];
  const [recipeName, setRecipeName] = useState<string>(defaultPreset.name);
  const [category, setCategory] = useState<string>(defaultPreset.category);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(defaultPreset.photoUrl);
  const [items, setItems] = useState<RecipeItem[]>(defaultPreset.items);
  const [variables, setVariables] = useState<CostVariables>(defaultPreset.variables);
  const [roundOption, setRoundOption] = useState<number>(10000); // Default round up to 10.000₫

  // Set web tab document title
  useEffect(() => {
    document.title = 'Solelia Calculator';
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
    setItems(recipe.items);
    setVariables(recipe.variables);
    setActiveTab('calculator');
    showToast(`Đã nạp mẫu "${recipe.name}"`);
  };

  // Handler: Save Current Recipe
  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      showToast('Vui lòng nhập tên mẫu hoa trước khi lưu!');
      return;
    }

    const newRecipe: SavedRecipe = {
      id: `recipe-${Date.now()}`,
      name: recipeName.trim(),
      category: category,
      photoUrl: photoUrl,
      items: items,
      variables: variables,
      savedAt: new Date().toISOString(),
      totalCost: breakdown.totalCost,
      suggestedPrice: breakdown.roundedPrice,
    };

    setSavedRecipes((prev) => [newRecipe, ...prev.filter((r) => r.name !== newRecipe.name)]);
    showToast(`Đã lưu "${recipeName}" vào Thư viện mẫu hoa!`);
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

  // Handler: New Blank Recipe
  const handleNewRecipe = () => {
    setRecipeName('Bó Hoa Mới');
    setCategory('Bó hoa tươi');
    setPhotoUrl(undefined);
    setItems([]);
    setVariables({
      wastagePercent: 10,
      packagingCost: 35000,
      laborCostType: 'fixed',
      laborCostValue: 50000,
      overheadPercent: 5,
      pricingMode: 'markup',
      targetMarginPercent: 40,
      markupFactor: 2.5,
    });
    setRoundOption(10000);
    showToast('Đã tạo bảng tính công thức mới');
  };

  // Reset Catalog to Trí Hải Factory List
  const handleResetCatalog = () => {
    setWholesaleCatalog(INITIAL_WHOLESALE_FLOWERS);
    showToast('Đã khôi phục toàn bộ bảng giá sỉ gốc');
  };

  const isHealthyMargin = variables.targetMarginPercent >= 40;

  return (
    <div className="min-h-screen bg-[#f9f4f0] text-stone-900 flex flex-col selection:bg-[#ebdcd3] selection:text-[#5d3a3a] pb-24 lg:pb-0">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#5d3a3a] text-white rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#eedfd5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Undo Banner Toast */}
      {undoState && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#3b2828] text-white rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 border border-[#734848]">
          <span>Đã xóa "{undoState.item.flowerName}"</span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#f9f4f0] text-[#5d3a3a] rounded-lg font-bold hover:bg-white transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>
        </div>
      )}

      {/* Top Bar with Quiet Underline Nav */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedRecipes.length}
        catalogCount={wholesaleCatalog.length}
        onNewRecipe={handleNewRecipe}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recipe Builder & 5 Sliders (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Công thức bó hoa with ghost inputs, search first, and inline conversions */}
            <RecipeBuilder
              recipeName={recipeName}
              setRecipeName={setRecipeName}
              category={category}
              setCategory={setCategory}
              photoUrl={photoUrl}
              setPhotoUrl={setPhotoUrl}
              items={items}
              setItems={setItems}
              wholesaleCatalog={wholesaleCatalog}
              rawFlowerCost={rawFlowerCost}
              onLoadPreset={handleLoadPreset}
              onItemDeletedWithUndo={handleItemDeletedWithUndo}
            />

            {/* Bộ 5 thanh trượt biến phí with autosave indicator */}
            <CostSliders
              variables={variables}
              setVariables={setVariables}
              rawFlowerCost={rawFlowerCost}
            />
          </div>

          {/* Right Column: Financial Dashboard (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <FinancialDashboard
              recipeName={recipeName}
              category={category}
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
      <div className="block lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#eedfd5] p-3 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[11px] text-[#7c6363] font-medium">
              Giá bán đề nghị:
            </div>
            <div className="flex items-center gap-2">
              <span className="font-title text-xl font-bold text-[#5d3a3a] tabular-nums"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {formatVND(breakdown.roundedPrice)}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isHealthyMargin
                    ? 'bg-[#eef3ef] text-[#30523f] border-[#cde0d5]'
                    : 'bg-[#fcf1e8] text-[#934524] border-[#fad4c0]'
                }`}
              >
                Lãi mong muốn: {variables.targetMarginPercent}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsQuoteOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#5d3a3a] text-white shadow-xs hover:bg-[#4a2e2e] transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất báo giá</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#eedfd5] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-title font-bold text-[#5d3a3a] text-sm">Soleliá</span>
            <span>·</span>
            <span>Tiệm Hoa Ấm Áp</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-stone-400">
              Nguồn giá: Kho Trí Hải
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuoteExportModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        recipeName={recipeName}
        category={category}
        photoUrl={photoUrl}
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
