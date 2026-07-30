import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

/**
 * Clean up expired temp files.
 * 
 * Deletes:
 * - Upload files older than UPLOAD_RETENTION_HOURS
 * - Generated zip files older than GENERATED_RETENTION_HOURS
 * 
 * Runs as a periodic job. Only logs job IDs, never personal data.
 */
export async function runCleanup(): Promise<{ deletedUploads: number; deletedGenerated: number }> {
  let deletedUploads = 0;
  let deletedGenerated = 0;
  
  // Clean uploads
  try {
    const uploadCutoff = Date.now() - (config.uploadRetentionHours * 60 * 60 * 1000);
    deletedUploads = await cleanDirectory(config.uploadDir, uploadCutoff);
  } catch (error) {
    // Directory might not exist yet — that's fine
  }
  
  // Clean generated files
  try {
    const generatedCutoff = Date.now() - (config.generatedRetentionHours * 60 * 60 * 1000);
    deletedGenerated = await cleanDirectory(config.generatedDir, generatedCutoff);
  } catch (error) {
    // Directory might not exist yet — that's fine
  }
  
  if (deletedUploads > 0 || deletedGenerated > 0) {
    console.log(`Cleanup: removed ${deletedUploads} upload(s), ${deletedGenerated} generated file(s)`);
  }
  
  return { deletedUploads, deletedGenerated };
}

/**
 * Delete files in a directory that are older than the cutoff timestamp.
 */
async function cleanDirectory(dirPath: string, cutoffTimestamp: number): Promise<number> {
  let deleted = 0;
  
  try {
    const entries = await fs.readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const stat = await fs.stat(fullPath);
      
      if (stat.isFile() && stat.mtimeMs < cutoffTimestamp) {
        await fs.unlink(fullPath);
        deleted++;
      }
    }
  } catch (error) {
    // Silently handle errors (permission issues, missing dir, etc.)
  }
  
  return deleted;
}
