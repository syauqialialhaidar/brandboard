// src/utils/colors.ts

/**
 * Generates an array of bright, distinct colors.
 * @param numColors The number of colors to generate.
 * @returns An array of hex color strings.
 */
export function generateBrightColors(numColors: number): string[] {
  const colors: string[] = [];
  const goldenRatioConjugate = 0.61803398875;

  // --- MODIFIED ---
  // Use a fixed starting point instead of Math.random() for deterministic colors
  let h = 0.42; // Any constant value between 0 and 1 will work
  // --- END MODIFICATION ---

  for (let i = 0; i < numColors; i++) {
    h += goldenRatioConjugate;
    h %= 1;
    // Using HSL for bright colors: high saturation, medium lightness
    const s = 0.7; // 70% saturation
    const l = 0.6; // 60% lightness

    const color = hslToHex(h, s, l);
    colors.push(color);
  }
  return colors;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an HSL color value to a Hex string.
 * Assumes h, s, and l are contained in the set [0, 1].
 */
function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Calculates the perceived brightness of an RGB color.
 * @param r Red component (0-255).
 * @param g Green component (0-255).
 * @param b Blue component (0-255).
 * @returns Brightness value (0-255).
 */
function getBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Determines a contrasting text color (black or white) for a given background hex color.
 * @param hexcolor The background color in hex format (e.g., "#RRGGBB").
 * @returns "#000000" (black) or "#FFFFFF" (white).
 */
export function getContrastColor(hexcolor: string): string {
  if (!hexcolor || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexcolor)) {
    return '#000000'; // Default to black for invalid colors
  }

  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);

  const brightness = getBrightness(r, g, b);

  // Use a threshold (e.g., 128) to decide between black and white text
  return brightness > 180 ? '#000000' : '#FFFFFF'; // Adjusted threshold for bright background colors
}
