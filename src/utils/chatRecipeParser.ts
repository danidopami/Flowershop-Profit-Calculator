import {
  WholesaleFlowerItem,
  RecipeItem,
  SuggestedFlowerItem,
  ChatSuggestionResult,
} from '../types';

export type { SuggestedFlowerItem, ChatSuggestionResult };

// Normalize Vietnamese string for robust accent-insensitive matching
export function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * Intelligent Vietnamese flower parser for natural florist chat prompts.
 * Example inputs:
 * "trong ảnh dùng 1 bó hồng cam Balcony, 1 bó cỏ đồng tiền, 1 bó lá bạc"
 * "10 cành calla lily vàng, 2 bó cát tường trắng, 1 bó lá bạc"
 */
export function parseChatRecipe(
  prompt: string,
  catalog: WholesaleFlowerItem[]
): ChatSuggestionResult {
  if (!prompt || !prompt.trim()) {
    return {
      rawPrompt: prompt,
      items: [],
      totalEstimatedCost: 0,
      totalStems: 0,
    };
  }

  // 1. Remove introductory conversational phrases
  let cleaned = prompt
    .replace(
      /^(trong (ảnh|hình|bức ảnh)|bó hoa này|mẫu này|em|mình|tiệm|chúng tôi)\s+(dùng|gồm|có|cần|sử dụng|thấy|lấy)\s*:?\s*/i,
      ''
    )
    .replace(/^(dùng|gồm|có|cần|sử dụng)\s*:?\s*/i, '')
    .trim();

  // 2. Split into flower items by commas, semicolons, "+", newlines, or "và" / "kèm"
  const rawSegments = cleaned
    .split(/[,;\n\+]|\s+(?:và|kèm|cùng với)\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const items: SuggestedFlowerItem[] = [];

  rawSegments.forEach((segment, index) => {
    // Regex for matching quantity + unit + flower name
    // e.g. "1 bó hồng cam Balcony", "10 cành Calla Lily", "nửa bó baby", "0.5 bó lá bạc"
    const pattern =
      /^(\d+(?:[.,]\d+)?|nửa|mot|một|hai|ba|bốn|bon|năm|nam)?\s*(bó|bo|cành|canh|chùm|chum|kg|ký|ky|gói|goi)?\s*(.+)$/i;

    const match = segment.match(pattern);

    let count = 1;
    let unit: 'cành' | 'bó' = 'bó';
    let queryName = segment;

    if (match) {
      const rawCount = (match[1] || '').toLowerCase().trim();
      if (rawCount === 'nửa') count = 0.5;
      else if (rawCount === 'một' || rawCount === 'mot') count = 1;
      else if (rawCount === 'hai') count = 2;
      else if (rawCount === 'ba') count = 3;
      else if (rawCount === 'bốn' || rawCount === 'bon') count = 4;
      else if (rawCount === 'năm' || rawCount === 'nam') count = 5;
      else if (rawCount) {
        const parsed = parseFloat(rawCount.replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) count = parsed;
      }

      const rawUnit = (match[2] || '').toLowerCase().trim();
      if (rawUnit === 'cành' || rawUnit === 'canh') {
        unit = 'cành';
      } else {
        unit = 'bó';
      }

      queryName = (match[3] || '').trim();
    }

    // Clean up residual words from queryName like "khoảng", "tầm", "cỡ"
    queryName = queryName.replace(/^(khoảng|tầm|cỡ|chừng)\s+/i, '').trim();

    if (!queryName) return;

    // 3. Find match in wholesale catalog
    const matched = findBestCatalogMatch(queryName, catalog);

    let flowerName = queryName;
    let catalogFlowerId: string | undefined = undefined;
    let unitPrice = 100000;
    let matchType: 'exact' | 'fuzzy' | 'unmatched' = 'unmatched';
    let note = '';

    if (matched) {
      flowerName = matched.name;
      catalogFlowerId = matched.id;
      matchType =
        normalizeVietnamese(queryName) === normalizeVietnamese(matched.name)
          ? 'exact'
          : 'fuzzy';

      // Determine price based on selected unit (bó vs cành)
      if (unit === 'bó') {
        unitPrice = matched.packPrice;
      } else {
        unitPrice =
          matched.unitPrice ||
          Math.round(matched.packPrice / (matched.stemsPerPack || 1));
      }

      note = `Khớp Kho Trí Hải (${matched.packPrice.toLocaleString('vi-VN')} ₫ / ${matched.packUnit || 'Bó'})`;
    } else {
      // Unmatched custom flower
      flowerName = capitalizeWords(queryName);
      matchType = 'unmatched';
      note = 'Chưa có trong kho Trí Hải (tính theo giá mặc định)';
    }

    const totalPrice = Math.round(count * unitPrice);

    items.push({
      id: `chat-sug-${index}-${Date.now()}`,
      rawInputText: segment,
      catalogFlowerId,
      flowerName,
      count,
      unit,
      unitPrice,
      totalPrice,
      selected: true,
      matchType,
      matchedFlower: matched,
      note,
    });
  });

  const totalEstimatedCost = items.reduce(
    (sum, item) => sum + (item.selected ? item.totalPrice : 0),
    0
  );

  const totalStems = items.reduce((sum, item) => {
    if (!item.selected) return sum;
    if (item.unit === 'cành') return sum + item.count;
    const stems = item.matchedFlower?.stemsPerPack || 10;
    return sum + item.count * stems;
  }, 0);

  return {
    rawPrompt: prompt,
    items,
    totalEstimatedCost,
    totalStems,
  };
}

/**
 * Intelligent fuzzy matching for flower names against Kho Trí Hải database
 */
export function findBestCatalogMatch(
  query: string,
  catalog: WholesaleFlowerItem[]
): WholesaleFlowerItem | undefined {
  const normQuery = normalizeVietnamese(query);
  const queryLower = query.toLowerCase().trim();

  // 1. Exact match (case insensitive)
  const exact = catalog.find((f) => f.name.toLowerCase() === queryLower);
  if (exact) return exact;

  // 2. Normalized exact match (ignoring diacritics)
  const normExact = catalog.find(
    (f) => normalizeVietnamese(f.name) === normQuery
  );
  if (normExact) return normExact;

  // 3. Substring inclusion
  const subMatch = catalog.find(
    (f) =>
      f.name.toLowerCase().includes(queryLower) ||
      queryLower.includes(f.name.toLowerCase())
  );
  if (subMatch) return subMatch;

  // 4. Normalized substring inclusion
  const normSubMatch = catalog.find((f) => {
    const fNorm = normalizeVietnamese(f.name);
    return fNorm.includes(normQuery) || normQuery.includes(fNorm);
  });
  if (normSubMatch) return normSubMatch;

  // 5. Word token overlap scoring (e.g. "cỏ đồng tiền" -> "Cỏ Đồng Tiền")
  const queryWords = normQuery.split(/\s+/).filter((w) => w.length > 1);
  if (queryWords.length > 0) {
    let bestFlower: WholesaleFlowerItem | undefined;
    let highestScore = 0;

    for (const flower of catalog) {
      const flowerWords = normalizeVietnamese(flower.name)
        .split(/\s+/)
        .filter((w) => w.length > 1);

      let matchingWords = 0;
      queryWords.forEach((qw) => {
        if (flowerWords.some((fw) => fw.includes(qw) || qw.includes(fw))) {
          matchingWords++;
        }
      });

      const score = matchingWords / Math.max(queryWords.length, 1);
      if (score > highestScore && score >= 0.5) {
        highestScore = score;
        bestFlower = flower;
      }
    }

    if (bestFlower) return bestFlower;
  }

  return undefined;
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
