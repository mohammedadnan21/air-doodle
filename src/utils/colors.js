export const NEON_PALETTE = [
  { name: 'Cyan', hex: '#00f0ff', rgb: [0, 240, 255] },
  { name: 'Magenta', hex: '#ff00e5', rgb: [255, 0, 229] },
  { name: 'Lime', hex: '#39ff14', rgb: [57, 255, 20] },
  { name: 'Gold', hex: '#ffd700', rgb: [255, 215, 0] },
  { name: 'Coral', hex: '#ff6b6b', rgb: [255, 107, 107] },
  { name: 'Violet', hex: '#bf5fff', rgb: [191, 95, 255] },
  { name: 'Ice', hex: '#88cfff', rgb: [136, 207, 255] },
  { name: 'White', hex: '#ffffff', rgb: [255, 255, 255] },
];

export function nextColor(currentHex) {
  const idx = NEON_PALETTE.findIndex((c) => c.hex === currentHex);
  return NEON_PALETTE[(idx + 1) % NEON_PALETTE.length];
}

export function hexToGlsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}
