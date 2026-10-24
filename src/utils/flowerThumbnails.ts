/**
 * High-quality curated botanical thumbnails for flowers and foliage
 */
export function getFlowerThumbnail(name: string, category?: string): string {
  const lower = name.toLowerCase();

  // Specific flower matches
  if (lower.includes('ohara') || lower.includes('hồng vàng')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('hồng cam') || lower.includes('balcony')) {
    return 'https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('hồng đỏ') || lower.includes('explorer') || lower.includes('naomi')) {
    return 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('hồng')) {
    return 'https://images.unsplash.com/photo-1534885320675-b08ab1322599?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('cúc') || lower.includes('mẫu đơn') || lower.includes('chrysanthemum')) {
    return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('tulip')) {
    return 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('calla') || lower.includes('rum')) {
    return 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('cát tường') || lower.includes('lisianthus')) {
    return 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('bạc') || lower.includes('lá bạc') || lower.includes('khuynh diệp')) {
    return 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('cỏ') || lower.includes('đồng tiền')) {
    return 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('baby') || lower.includes('chùm')) {
    return 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (lower.includes('lan') || lower.includes('orchid')) {
    return 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=120&h=120&q=80';
  }

  // Category fallbacks
  if (category === 'Hoa hồng') {
    return 'https://images.unsplash.com/photo-1534885320675-b08ab1322599?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (category === 'Tulip') {
    return 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=120&h=120&q=80';
  }
  if (category === 'Cỏ & Lá phụ') {
    return 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=120&h=120&q=80';
  }

  // Default elegant botanical thumbnail
  return 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=120&h=120&q=80';
}
