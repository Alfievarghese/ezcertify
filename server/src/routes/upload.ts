import { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { parseExcelFile, validateForGeneration } from '../services/excel-parser.js';
import { processTemplate } from '../services/template-processor.js';
import { config } from '../config.js';

// In-memory session store for uploaded data (auto-expires, never persisted)
// Key = sessionId, Value = parsed data + template info
export const uploadSessions = new Map<string, {
  excel: Awaited<ReturnType<typeof parseExcelFile>> | null;
  excelPath: string | null;
  template: Awaited<ReturnType<typeof processTemplate>> | null;
  createdAt: number;
}>();

// Cleanup sessions older than retention window
setInterval(() => {
  const cutoff = Date.now() - (config.uploadRetentionHours * 60 * 60 * 1000);
  for (const [key, session] of uploadSessions) {
    if (session.createdAt < cutoff) {
      // Clean up temp files
      if (session.excelPath) {
        fs.unlink(session.excelPath).catch(() => {});
      }
      if (session.template?.filePath) {
        fs.unlink(session.template.filePath).catch(() => {});
      }
      uploadSessions.delete(key);
    }
  }
}, 60 * 60 * 1000); // Check every hour

export async function uploadRoutes(fastify: FastifyInstance) {
  
  /**
   * POST /api/upload/excel
   * Upload an Excel/CSV file, parse it, return headers + preview rows.
   */
  fastify.post('/api/upload/excel', async (request, reply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }
    
    const originalName = data.filename;
    const ext = path.extname(originalName).toLowerCase();
    
    if (!['.xlsx', '.csv'].includes(ext)) {
      return reply.status(400).send({
        error: 'Invalid file type. Supported: .xlsx, .csv',
      });
    }
    
    // Save to temp location
    await fs.mkdir(config.uploadDir, { recursive: true });
    const tempPath = path.join(config.uploadDir, `excel_${Date.now()}${ext}`);
    const buffer = await data.toBuffer();
    await fs.writeFile(tempPath, buffer);
    
    try {
      // Parse the file
      const parsed = await parseExcelFile(tempPath);
      
      // Create or update session
      const sessionId = request.headers['x-session-id'] as string || `session_${Date.now()}`;
      
      const existing = uploadSessions.get(sessionId);
      uploadSessions.set(sessionId, {
        excel: parsed,
        excelPath: tempPath,
        template: existing?.template || null,
        createdAt: Date.now(),
      });
      
      return reply.send({
        sessionId,
        headers: parsed.headers,
        rows: parsed.rows,                   // All rows for client-side generation
        previewRows: parsed.rows.slice(0, 5), // First 5 rows for preview
        totalRows: parsed.totalRows,
        warnings: parsed.warnings.slice(0, 50),
        totalWarnings: parsed.warnings.length,
      });
      
    } catch (error) {
      // Clean up temp file on error
      await fs.unlink(tempPath).catch(() => {});
      const message = error instanceof Error ? error.message : 'Failed to parse file';
      return reply.status(400).send({ error: message });
    }
  });
  
  /**
   * POST /api/upload/template
   * Upload a certificate template image.
   */
  fastify.post('/api/upload/template', async (request, reply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }
    
    const originalName = data.filename;
    const ext = path.extname(originalName).toLowerCase();
    
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      return reply.status(400).send({
        error: 'Invalid file type. Supported: .png, .jpg, .jpeg, .webp',
      });
    }
    
    // Save to temp location
    await fs.mkdir(config.uploadDir, { recursive: true });
    const tempPath = path.join(config.uploadDir, `template_raw_${Date.now()}${ext}`);
    const buffer = await data.toBuffer();
    await fs.writeFile(tempPath, buffer);
    
    try {
      // Process the template (resize, convert to PNG)
      const processed = await processTemplate(tempPath, originalName);
      
      // Clean up raw upload
      await fs.unlink(tempPath).catch(() => {});
      
      // Update session
      const sessionId = request.headers['x-session-id'] as string || `session_${Date.now()}`;
      
      const existing = uploadSessions.get(sessionId);
      uploadSessions.set(sessionId, {
        excel: existing?.excel || null,
        excelPath: existing?.excelPath || null,
        template: processed,
        createdAt: Date.now(),
      });
      
      return reply.send({
        sessionId,
        template: {
          originalName: processed.originalName,
          width: processed.width,
          height: processed.height,
          url: `/api/uploads/${path.basename(processed.filePath)}`,
        },
      });
      
    } catch (error) {
      await fs.unlink(tempPath).catch(() => {});
      const message = error instanceof Error ? error.message : 'Failed to process template';
      return reply.status(400).send({ error: message });
    }
  });
  
  /**
   * GET /api/session/:sessionId
   * Get current session state (what's uploaded, validation status).
   */
  fastify.get('/api/session/:sessionId', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const session = uploadSessions.get(sessionId);
    
    if (!session) {
      return reply.status(404).send({ error: 'Session not found or expired' });
    }
    
    return reply.send({
      hasExcel: !!session.excel,
      hasTemplate: !!session.template,
      headers: session.excel?.headers || [],
      totalRows: session.excel?.totalRows || 0,
      templateDimensions: session.template
        ? { width: session.template.width, height: session.template.height }
        : null,
    });
  });
}
