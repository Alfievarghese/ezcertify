import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config.js';

const MAX_TEMPLATE_WIDTH = 3000;
const MAX_TEMPLATE_HEIGHT = 3000;

export interface ProcessedTemplate {
  originalName: string;
  filePath: string;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Process an uploaded template image:
 * - Validate it's a valid image
 * - Resize if too large (preserve aspect ratio)
 * - Convert to PNG for consistent rendering
 * - Return metadata for the canvas editor
 */
export async function processTemplate(
  inputPath: string,
  originalName: string
): Promise<ProcessedTemplate> {
  // Ensure upload directory exists
  await fs.mkdir(config.uploadDir, { recursive: true });
  
  // Read and validate the image
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image file: could not read dimensions.');
  }
  
  // Determine if resize is needed
  let width = metadata.width;
  let height = metadata.height;
  let needsResize = false;
  
  if (width > MAX_TEMPLATE_WIDTH || height > MAX_TEMPLATE_HEIGHT) {
    needsResize = true;
    const scale = Math.min(MAX_TEMPLATE_WIDTH / width, MAX_TEMPLATE_HEIGHT / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  
  // Process: resize if needed, convert to PNG, strip metadata
  const outputFileName = `template_${Date.now()}.png`;
  const outputPath = path.join(config.uploadDir, outputFileName);
  
  let pipeline = image;
  if (needsResize) {
    pipeline = pipeline.resize(width, height, { fit: 'inside' });
  }
  
  await pipeline
    .png({ compressionLevel: 3, adaptiveFiltering: false })
    .toFile(outputPath);
  
  return {
    originalName,
    filePath: outputPath,
    width,
    height,
    mimeType: 'image/png',
  };
}

/**
 * Load a template image buffer for rendering.
 * Cached per batch job so we don't re-read from disk for every certificate.
 */
export async function loadTemplateBuffer(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}
