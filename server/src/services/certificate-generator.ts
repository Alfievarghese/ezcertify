import archiver from 'archiver';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { renderCertificate, preloadTemplateImage, type RenderLayout } from './renderer.js';
import { db } from '../db/index.js';
import { certificates } from '../db/schema.js';
import { config } from '../config.js';

export interface GenerationOptions {
  layout: RenderLayout;
  rows: Record<string, string>[];
  outputFormat: 'png' | 'pdf';
  qrBoundColumn: string;          // Primary column bound to QR verification
  extraDisplayColumns?: string[];  // Additional columns to show on verify page
  onProgress?: (current: number, total: number) => void;
}

export interface GenerationResult {
  zipPath: string;
  totalGenerated: number;
  errors: { row: number; error: string }[];
}

/**
 * Generate certificates for all rows in the Excel data.
 * 
 * - Creates one certificate per row
 * - Generates unique certificateId per row (nanoid)
 * - Renders using node-canvas
 * - Stores minimal verification records in PostgreSQL
 * - Streams all outputs into a zip file
 * - Uses pre-loaded template for batch performance
 */
export async function generateCertificates(
  options: GenerationOptions
): Promise<GenerationResult> {
  const { layout, rows, outputFormat, qrBoundColumn, extraDisplayColumns, onProgress } = options;
  
  // Ensure output directory exists
  await fs.mkdir(config.generatedDir, { recursive: true });
  
  // Pre-load template image once for the entire batch
  const templateImage = await preloadTemplateImage(layout.templatePath);
  
  // Set up zip streaming
  const zipFileName = `certificates_${Date.now()}.zip`;
  const zipPath = path.join(config.generatedDir, zipFileName);
  const zipStream = createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 6 } });
  
  archive.pipe(zipStream);
  
  const errors: { row: number; error: string }[] = [];
  let totalGenerated = 0;
  
  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    try {
      // Generate unique certificate ID (12 chars, URL-safe)
      const certificateId = nanoid(12);
      
      // Render the certificate
      const buffer = await renderCertificate(layout, row, certificateId, templateImage);
      
      // Generate unique filename: {primaryValue}_{certificateId}.png
      const primaryValue = row[qrBoundColumn] || 'Certificate';
      const safeName = primaryValue.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
      const fileName = `${safeName}_${certificateId}.${outputFormat === 'pdf' ? 'pdf' : 'png'}`;
      
      // Add to zip
      archive.append(buffer, { name: fileName });
      
      // Build extra display fields for verification page
      const extraFields: Record<string, string> = {};
      if (extraDisplayColumns) {
        for (const col of extraDisplayColumns) {
          if (row[col]) {
            extraFields[col] = row[col];
          }
        }
      }
      
      // Store minimal verification record
      await db.insert(certificates).values({
        certificateId,
        boundColumnName: qrBoundColumn,
        boundColumnValue: row[qrBoundColumn] || '',
        extraDisplayFields: extraFields,
        templateName: path.basename(layout.templatePath),
      });
      
      totalGenerated++;
      
      // Report progress
      if (onProgress) {
        onProgress(i + 1, rows.length);
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ row: i + 2, error: message }); // +2 for 1-indexed header offset
    }
  }
  
  // Finalize zip
  await archive.finalize();
  
  // Wait for zip stream to finish writing
  await new Promise<void>((resolve, reject) => {
    zipStream.on('close', resolve);
    zipStream.on('error', reject);
  });
  
  return { zipPath, totalGenerated, errors };
}
