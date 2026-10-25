/**
 * Plain placeholder thumbnail: a colored circle with the flower's first
 * letter. No external images. The color follows the color word in the name.
 */
const COLOR_WORDS: [string, string][] = [
  ['đỏ', '#d9534f'],
  ['cam', '#f0a15a'],
  ['vàng', '#f2cf5b'],
  ['trắng', '#e9e6df'],
  ['tím', '#a98ccf'],
  ['xanh dương', '#6fa8dc'],
  ['xanh', '#8fbf8f'],
  ['nâu', '#b08968'],
  ['kem', '#f1e3cf'],
  ['hồng', '#e8a0b4'],
];

export function getFlowerThumbnail(name: string, _category?: string): string {
  const lower = name.toLowerCase();
  // A leading "Hồng" means rose, not pink, so skip it when reading colors
  const colorSource = lower.replace(/^hồng\s+/, '');
  const match = COLOR_WORDS.find(([word]) => colorSource.includes(word));
  const isGreenery = /^(lá|cỏ)\s/.test(lower);
  const fill = match ? match[1] : isGreenery ? '#8fbf8f' : '#c9b8b0';
  const letter = (name.trim().charAt(0) || '?').toUpperCase();

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">` +
    `<circle cx="60" cy="60" r="60" fill="${fill}"/>` +
    `<text x="60" y="60" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="Arial, sans-serif" font-size="52" font-weight="600" fill="#ffffff">${letter}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}