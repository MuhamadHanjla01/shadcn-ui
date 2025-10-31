/**
 * Converts a hex color to HSL format used by Tailwind CSS
 * @param hex - Hex color string (e.g., "#2563eb" or "2563eb")
 * @returns HSL string in format "H S% L%" (e.g., "221.72 83.19% 53.33%")
 */
export const hexToHsl = (hex: string): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360 * 10) / 10;
  s = Math.round(s * 100 * 100) / 100;
  const lightness = Math.round(l * 100 * 100) / 100;

  return `${h} ${s}% ${lightness}%`;
};

