import { createCanvas, loadImage, registerFont } from 'canvas';
import { generateQRCode } from './qr-generator.js';
import path from 'path';
import fs from 'fs';

/**
 * Layout JSON structure — serialized from the Fabric.js editor.
 * This is the contract between frontend canvas and backend renderer.
 */
export interface PlaceholderLayout {
  id: string;
  type: 'text' | 'qr';
  // Center-anchor position (percentage of canvas dimensions)
  x: number;
  y: number;
  // Bound Excel column
  boundColumn: string;
  // Text properties (only for type === 'text')
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number; // Max width in pixels before auto-shrink
  // QR properties (only for type === 'qr')
  qrSize?: number;
  qrDarkColor?: string;
  qrLightColor?: string;
}

export interface RenderLayout {
  templatePath: string;
  templateWidth: number;
  templateHeight: number;
  placeholders: PlaceholderLayout[];
}

export interface RenderResult {
  buffer: Buffer;
  certificateId: string;
}

/**
 * Render a single certificate given:
 * - The template image path
 * - The layout (placeholder positions, styles)
 * - The row data (column values)
 * - The certificateId (for QR URL encoding)
 * 
 * Uses native node-canvas (not fabric/node) for maximum performance
 * in batch rendering. Fabric.js SSR has overhead we don't need for
 * the final render — we just need to draw text and images at coordinates.
 */
export async function renderCertificate(
  layout: RenderLayout,
  rowData: Record<string, string>,
  certificateId: string,
  templateImage?: any // Pre-loaded image for batch reuse
): Promise<Buffer> {
  const { templateWidth, templateHeight, placeholders } = layout;
  
  // Create canvas at template dimensions
  const canvas = createCanvas(templateWidth, templateHeight);
  const ctx = canvas.getContext('2d');
  
  // Draw template background
  if (!templateImage) {
    templateImage = await loadImage(layout.templatePath);
  }
  ctx.drawImage(templateImage, 0, 0, templateWidth, templateHeight);
  
  // Render each placeholder
  for (const placeholder of placeholders) {
    if (placeholder.type === 'text') {
      await renderTextPlaceholder(ctx, placeholder, rowData, templateWidth, templateHeight);
    } else if (placeholder.type === 'qr') {
      await renderQRPlaceholder(ctx, placeholder, certificateId, templateWidth, templateHeight);
    }
  }
  
  return canvas.toBuffer('image/png');
}

/**
 * Render a text placeholder with center-anchor positioning.
 * 
 * The (x, y) coordinate is the CENTER of the text, not top-left.
 * Text is rendered centered around that point in all directions.
 * Auto-shrinks font if text would overflow its box or the canvas edge.
 */
async function renderTextPlaceholder(
  ctx: any,
  placeholder: PlaceholderLayout,
  rowData: Record<string, string>,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  const text = rowData[placeholder.boundColumn] || '';
  if (!text) return;
  
  const {
    fontFamily = 'Arial',
    fontSize: baseFontSize = 24,
    fontColor = '#000000',
    fontWeight = 'normal',
    fontStyle = 'normal',
    textAlign = 'center',
    maxWidth: explicitMaxWidth,
  } = placeholder;
  
  // Convert percentage position to pixels
  const centerX = (placeholder.x / 100) * canvasWidth;
  const centerY = (placeholder.y / 100) * canvasHeight;
  
  // Calculate max width based on position (center-anchored)
  // Text expands both directions from center, so max width is
  // 2x the minimum distance to the nearest horizontal edge
  const distToLeft = centerX;
  const distToRight = canvasWidth - centerX;
  const maxWidthFromPosition = Math.min(distToLeft, distToRight) * 2;
  const maxWidth = explicitMaxWidth
    ? Math.min(explicitMaxWidth, maxWidthFromPosition)
    : maxWidthFromPosition;
  
  // Auto-shrink font size until text fits within maxWidth
  let fontSize = baseFontSize;
  const minFontSize = 8; // Never go below 8px
  
  ctx.font = buildFont(fontWeight, fontStyle, fontSize, fontFamily);
  let measured = ctx.measureText(text);
  
  while (measured.width > maxWidth && fontSize > minFontSize) {
    fontSize -= 1;
    ctx.font = buildFont(fontWeight, fontStyle, fontSize, fontFamily);
    measured = ctx.measureText(text);
  }
  
  // Also check vertical bounds
  const lineHeight = fontSize * 1.2;
  const distToTop = centerY;
  const distToBottom = canvasHeight - centerY;
  
  if (lineHeight / 2 > distToTop || lineHeight / 2 > distToBottom) {
    // Shrink further to fit vertically
    const maxHeight = Math.min(distToTop, distToBottom) * 2;
    fontSize = Math.max(minFontSize, Math.floor(maxHeight / 1.2));
    ctx.font = buildFont(fontWeight, fontStyle, fontSize, fontFamily);
  }
  
  // Set text properties
  ctx.fillStyle = fontColor;
  ctx.textBaseline = 'middle';
  
  // Calculate x position based on alignment
  let textX: number;
  if (textAlign === 'left') {
    ctx.textAlign = 'left';
    textX = centerX - (measured.width / 2);
    // Constrain to left edge
    textX = Math.max(4, textX);
  } else if (textAlign === 'right') {
    ctx.textAlign = 'right';
    textX = centerX + (measured.width / 2);
    // Constrain to right edge
    textX = Math.min(canvasWidth - 4, textX);
  } else {
    ctx.textAlign = 'center';
    textX = centerX;
  }
  
  ctx.fillText(text, textX, centerY);
}

/**
 * Render a QR code placeholder at the specified position.
 * Center-anchored like text placeholders.
 */
async function renderQRPlaceholder(
  ctx: any,
  placeholder: PlaceholderLayout,
  certificateId: string,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  const qrSize = placeholder.qrSize || 120;
  const darkColor = placeholder.qrDarkColor || '#000000';
  const lightColor = placeholder.qrLightColor || '#ffffff';
  
  // Generate QR code
  const qrBuffer = await generateQRCode({
    certificateId,
    size: qrSize,
    darkColor,
    lightColor,
  });
  
  // Load QR as image
  const qrImage = await loadImage(qrBuffer);
  
  // Center-anchor position
  const centerX = (placeholder.x / 100) * canvasWidth;
  const centerY = (placeholder.y / 100) * canvasHeight;
  const drawX = centerX - qrSize / 2;
  const drawY = centerY - qrSize / 2;
  
  // Constrain to canvas bounds
  const constrainedX = Math.max(0, Math.min(canvasWidth - qrSize, drawX));
  const constrainedY = Math.max(0, Math.min(canvasHeight - qrSize, drawY));
  
  ctx.drawImage(qrImage, constrainedX, constrainedY, qrSize, qrSize);
}

/**
 * Build a CSS font string for canvas.
 */
function buildFont(weight: string, style: string, size: number, family: string): string {
  return `${style} ${weight} ${size}px "${family}"`;
}

/**
 * Pre-load the template image once for batch reuse.
 * Call this before iterating over rows to avoid re-reading from disk per row.
 */
export async function preloadTemplateImage(templatePath: string) {
  return loadImage(templatePath);
}
