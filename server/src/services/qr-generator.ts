import QRCode from 'qrcode';
import { config } from '../config.js';

/**
 * Minimum contrast ratio for QR codes (WCAG AA = 4.5:1).
 * We enforce this so QR codes remain scannable.
 */
const MIN_CONTRAST_RATIO = 4.5;

export interface QROptions {
  certificateId: string;
  size: number;       // pixels (width = height)
  darkColor: string;  // hex color for dark modules
  lightColor: string; // hex color for light modules/background
}

/**
 * Generate a QR code as a PNG buffer encoding a verification URL.
 * Never encodes raw text — always a full URL: {baseUrl}/{certificateId}
 */
export async function generateQRCode(options: QROptions): Promise<Buffer> {
  const { certificateId, size, darkColor, lightColor } = options;
  
  // Validate contrast
  const contrast = getContrastRatio(darkColor, lightColor);
  if (contrast < MIN_CONTRAST_RATIO) {
    throw new Error(
      `QR code colors have insufficient contrast (${contrast.toFixed(1)}:1). ` +
      `Minimum required: ${MIN_CONTRAST_RATIO}:1. ` +
      `Please choose colors with higher contrast to ensure scannability.`
    );
  }
  
  const verificationUrl = `${config.verifyBaseUrl}/${certificateId}`;
  
  const buffer = await QRCode.toBuffer(verificationUrl, {
    type: 'png',
    width: size,
    margin: 1,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'M', // Medium error correction
  });
  
  return buffer;
}

/**
 * Validate QR colors before generation.
 * Returns the contrast ratio.
 */
export function validateQRContrast(darkColor: string, lightColor: string): {
  valid: boolean;
  ratio: number;
  minimum: number;
} {
  const ratio = getContrastRatio(darkColor, lightColor);
  return {
    valid: ratio >= MIN_CONTRAST_RATIO,
    ratio: Math.round(ratio * 10) / 10,
    minimum: MIN_CONTRAST_RATIO,
  };
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 >= L2
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a hex color per WCAG 2.0.
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB array.
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
}
