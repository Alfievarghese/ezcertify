import { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { uploadSessions } from './upload.js';
import { createGenerationQueue, jobProgress } from '../queue/worker.js';
import { validateForGeneration } from '../services/excel-parser.js';
import type { RenderLayout, PlaceholderLayout } from '../services/renderer.js';

const queue = createGenerationQueue();

export async function generateRoutes(fastify: FastifyInstance) {
  
  /**
   * POST /api/generate
   * Trigger bulk certificate generation.
   * Validates everything, enqueues a BullMQ job, returns jobId.
   */
  fastify.post('/api/generate', async (request, reply) => {
    const body = request.body as {
      sessionId: string;
      placeholders: PlaceholderLayout[];
      outputFormat?: 'png' | 'pdf';
      qrBoundColumn: string;
      extraDisplayColumns?: string[];
    };
    
    const { sessionId, placeholders, outputFormat = 'png', qrBoundColumn, extraDisplayColumns } = body;
    
    // Validate session exists
    const session = uploadSessions.get(sessionId);
    if (!session) {
      return reply.status(404).send({ error: 'Session not found or expired. Please re-upload your files.' });
    }
    
    if (!session.excel) {
      return reply.status(400).send({ error: 'No Excel file uploaded. Please upload an Excel file first.' });
    }
    
    if (!session.template) {
      return reply.status(400).send({ error: 'No template uploaded. Please upload a certificate template first.' });
    }
    
    if (!placeholders || placeholders.length === 0) {
      return reply.status(400).send({ error: 'No placeholders defined. Please add at least one text or QR placeholder.' });
    }
    
    if (!qrBoundColumn) {
      return reply.status(400).send({ error: 'No QR bound column specified. Please bind a column to the QR code.' });
    }
    
    // Validate required columns exist in Excel
    const requiredColumns = placeholders
      .map(p => p.boundColumn)
      .filter(Boolean);
    
    const validationWarnings = validateForGeneration(session.excel, requiredColumns);
    const missingColumns = validationWarnings.filter(w => w.type === 'missing_column');
    
    if (missingColumns.length > 0) {
      return reply.status(400).send({
        error: 'Column mapping mismatch',
        details: missingColumns.map(w => w.message),
      });
    }
    
    // Check for critical empty cells (only in bound columns)
    const emptyCells = validationWarnings.filter(
      w => w.type === 'empty_cell' && requiredColumns.includes(w.column!)
    );
    
    if (emptyCells.length > 0) {
      return reply.status(400).send({
        error: 'Empty cells found in bound columns',
        details: emptyCells.slice(0, 20).map(w => w.message),
        totalEmpty: emptyCells.length,
      });
    }
    
    // Build render layout
    const layout: RenderLayout = {
      templatePath: session.template.filePath,
      templateWidth: session.template.width,
      templateHeight: session.template.height,
      placeholders,
    };
    
    // Enqueue the generation job
    const job = await queue.add('generate-batch', {
      layout,
      rows: session.excel.rows,
      outputFormat,
      qrBoundColumn,
      extraDisplayColumns,
    });
    
    return reply.send({
      jobId: job.id,
      totalRows: session.excel.totalRows,
      message: 'Generation started',
    });
  });
  
  /**
   * GET /api/generate/:jobId/status
   * Server-Sent Events (SSE) endpoint for real-time progress updates.
   */
  fastify.get('/api/generate/:jobId/status', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    
    // Set SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    
    // Poll progress and send updates
    const interval = setInterval(() => {
      const progress = jobProgress.get(jobId);
      
      if (!progress) {
        reply.raw.write(`data: ${JSON.stringify({ status: 'pending', current: 0, total: 0 })}\n\n`);
        return;
      }
      
      const payload: any = {
        status: progress.status,
        current: progress.current,
        total: progress.total,
      };
      
      if (progress.status === 'completed' && progress.result) {
        payload.zipPath = progress.result.zipPath;
        payload.totalGenerated = progress.result.totalGenerated;
        payload.errors = progress.result.errors;
        
        reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
        clearInterval(interval);
        reply.raw.end();
        
        // Clean up progress entry after sending completion
        setTimeout(() => jobProgress.delete(jobId), 60000);
        return;
      }
      
      if (progress.status === 'failed') {
        payload.error = progress.error;
        reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
        clearInterval(interval);
        reply.raw.end();
        
        setTimeout(() => jobProgress.delete(jobId), 60000);
        return;
      }
      
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    }, 500); // Update every 500ms
    
    // Clean up on client disconnect
    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });
  
  /**
   * GET /api/generate/:jobId/download
   * Download the generated zip file.
   */
  fastify.get('/api/generate/:jobId/download', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    
    const progress = jobProgress.get(jobId);
    
    if (!progress || progress.status !== 'completed' || !progress.result) {
      return reply.status(404).send({ error: 'Download not available. Job not found or not completed.' });
    }
    
    const zipPath = progress.result.zipPath;
    
    try {
      await fs.access(zipPath);
    } catch {
      return reply.status(404).send({ error: 'Generated file no longer available. It may have expired.' });
    }
    
    const fileName = `certificates_${jobId}.zip`;
    
    reply.header('Content-Type', 'application/zip');
    reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const stream = createReadStream(zipPath);
    return reply.send(stream);
  });
}
