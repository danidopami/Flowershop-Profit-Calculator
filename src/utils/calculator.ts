import { CostVariables, FinancialBreakdown, RecipeItem } from '../types';

/**
 * Calculates raw flower cost from items
 */
export function calculateRawFlowerCost(items: RecipeItem[]): number {
  return items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
}

/**
 * Calculates complete financial breakdown based on FRD formulas:
 * COGS = (Raw Flower Cost * (1 + Wastage %)) + Packaging Cost + Labor Cost
 * Total Cost = COGS * (1 + Overhead %)
 * Suggested Retail Price (Margin Based) = Total Cost / (1 - Margin % / 100)
 * Suggested Retail Price (Markup Based) = Total Cost * Markup Factor
 * Gross Profit = Price - COGS
 * Net Profit = Price - Total Cost
 */
export function calculateFinancialBreakdown(
  items: RecipeItem[],
  variables: CostVariables,
  roundToNearest: number = 0 // 0 for exact, 1000, 5000, 10000, 50000
): FinancialBreakdown {
  const rawFlowerCost = calculateRawFlowerCost(items);
  const wastageCost = Math.round(rawFlowerCost * (variables.wastagePercent / 100));
  const flowerCostWithWastage = rawFlowerCost + wastageCost;

  const packagingCost = Math.round(variables.packagingCost);

  let laborCost = 0;
  if (variables.laborCostType === 'fixed') {
    laborCost = Math.round(variables.laborCostValue);
  } else {
    // Percent based on flowerCostWithWastage + packagingCost
    laborCost = Math.round((flowerCostWithWastage + packagingCost) * (variables.laborCostValue / 100));
  }

  // COGS = Flower Cost with Wastage + Packaging + Labor
  const cogs = flowerCostWithWastage + packagingCost + laborCost;

  // Overhead Cost = COGS * overheadPercent
  const overheadCost = Math.round(cogs * (variables.overheadPercent / 100));

  // Total Cost = COGS + Overhead
  const totalCost = cogs + overheadCost;

  // Calculate suggested price based on chosen mode
  let rawSuggestedPrice = 0;
  if (variables.pricingMode === 'margin') {
    const marginRate = Math.min(Math.max(variables.targetMarginPercent, 1), 95) / 100;
    rawSuggestedPrice = totalCost / (1 - marginRate);
  } else {
    rawSuggestedPrice = totalCost * variables.markupFactor;
  }

  // Apply rounding if requested
  let roundedPrice = Math.round(rawSuggestedPrice);
  if (roundToNearest > 0) {
    roundedPrice = Math.ceil(rawSuggestedPrice / roundToNearest) * roundToNearest;
  }

  const suggestedPrice = Math.round(rawSuggestedPrice);
  const effectivePrice = roundedPrice > 0 ? roundedPrice : suggestedPrice;

  const grossProfit = effectivePrice - cogs;
  const netProfit = effectivePrice - totalCost;

  const grossMarginPercent = effectivePrice > 0 ? (grossProfit / effectivePrice) * 100 : 0;
  const netMarginPercent = effectivePrice > 0 ? (netProfit / effectivePrice) * 100 : 0;
  const effectiveMarkup = totalCost > 0 ? effectivePrice / totalCost : 0;

  return {
    rawFlowerCost,
    wastageCost,
    flowerCostWithWastage,
    packagingCost,
    laborCost,
    cogs,
    overheadCost,
    totalCost,
    suggestedPrice,
    roundedPrice: effectivePrice,
    grossProfit,
    netProfit,
    grossMarginPercent,
    netMarginPercent,
    effectiveMarkup,
  };
}

/**
 * Format currency to Vietnamese standard (e.g. 2.000.000₫)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0₫';
  return (
    new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(Math.round(amount)) + '₫'
  );
}

/**
 * Helper to sync Margin % to Markup Factor
 * Markup = 1 / (1 - Margin)
 */
export function marginToMarkup(marginPercent: number): number {
  if (marginPercent <= 0) return 1.0;
  const margin = Math.min(Math.max(marginPercent, 0), 95) / 100;
  const markup = 1 / (1 - margin);
  return Number(markup.toFixed(2));
}

/**
 * Helper to sync Markup Factor to Margin %
 * Margin = (Markup - 1) / Markup
 */
export function markupToMargin(markupFactor: number): number {
  if (markupFactor <= 1) return 0;
  const margin = ((markupFactor - 1) / markupFactor) * 100;
  return Number(margin.toFixed(1));
}
