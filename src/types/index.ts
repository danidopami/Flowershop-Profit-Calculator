export type FlowerOrigin =
  | 'Trung Quốc'
  | 'Hà Lan'
  | 'Ecuador'
  | 'Malaysia'
  | 'Đà Lạt'
  | 'Nam Phi'
  | 'Khác';

export type FlowerCategory =
  | 'Hoa hồng'
  | 'Cúc & Mẫu đơn'
  | 'Tulip'
  | 'Calla Lily'
  | 'Cát tường'
  | 'Lan & Địa Lan'
  | 'Cỏ & Lá phụ'
  | 'Hoa khô & Hoa phụ'
  | 'Khác';

export interface WholesaleFlowerItem {
  id: string;
  name: string;
  originalChineseName?: string;
  category: FlowerCategory;
  origin: FlowerOrigin;
  packUnit: string;
  packPrice: number;
  stemsPerPack: number;
  unitPrice: number;
  note?: string;
  isCustom?: boolean;
}

export interface RecipeItem {
  id: string;
  flowerId: string;
  flowerName: string;
  origin: FlowerOrigin | string;
  packSpecification: string;
  unitPrice: number;
  quantity: number;
  unitType: 'cành' | 'bó' | 'kg' | 'nhánh';
  totalCost: number;
}

export type LaborCostType = 'fixed' | 'percent';
export type PricingMode = 'margin' | 'markup';

export interface CostVariables {
  wastagePercent: number; // 0% - 30%
  packagingCost: number; // 10.000₫ - 200.000₫
  laborCostType: LaborCostType; // 'fixed' | 'percent'
  laborCostValue: number; // 0 - 300.000₫ OR 0% - 50%
  overheadPercent: number; // 0% - 20%
  pricingMode: PricingMode; // 'margin' | 'markup'
  targetMarginPercent: number; // 20% - 70%
  markupFactor: number; // 1.5x - 4.0x
}

export interface FinancialBreakdown {
  rawFlowerCost: number;
  wastageCost: number;
  flowerCostWithWastage: number;
  packagingCost: number;
  laborCost: number;
  cogs: number; // Total Cost of Goods Sold
  overheadCost: number;
  totalCost: number;
  suggestedPrice: number;
  roundedPrice: number;
  grossProfit: number; // Suggested/Rounded Price - COGS
  netProfit: number; // Suggested/Rounded Price - Total Cost
  grossMarginPercent: number;
  netMarginPercent: number;
  effectiveMarkup: number;
}

export interface SavedRecipe {
  id: string;
  name: string;
  category: string;
  description?: string;
  items: RecipeItem[];
  variables: CostVariables;
  savedAt: string;
  suggestedPrice: number;
  totalCost: number;
  photoUrl?: string;
}

export interface SuggestedFlowerItem {
  id: string;
  rawInputText: string;
  catalogFlowerId?: string;
  flowerName: string;
  count: number;
  unit: 'cành' | 'bó';
  unitPrice: number;
  totalPrice: number;
  selected: boolean;
  matchType: 'exact' | 'fuzzy' | 'unmatched';
  matchedFlower?: WholesaleFlowerItem;
  note?: string;
}

export interface ChatSuggestionResult {
  rawPrompt: string;
  items: SuggestedFlowerItem[];
  totalEstimatedCost: number;
  totalStems: number;
}
