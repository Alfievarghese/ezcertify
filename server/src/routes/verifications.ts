import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { certificates } from '../db/schema.js';

interface BatchVerificationRequest {
  records: Array<{
    certificateId: string;
    boundColumnName: string;
    boundColumnValue: string;
    extraDisplayFields?: Record<string, string>;
    templateName?: string;
  }>;
}

export async function verificationBatchRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/verifications/batch
   * Saves a batch of verification records to the database.
   * This is called by the client-side renderer after generating a batch of certificates.
   */
  fastify.post('/api/verifications/batch', async (request, reply) => {
    const { records } = request.body as BatchVerificationRequest;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return reply.status(400).send({ error: 'Valid records array is required' });
    }

    try {
      // Chunk the records to avoid huge inserts if there are 10,000+ certificates
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        await db.insert(certificates).values(
          chunk.map(record => ({
            certificateId: record.certificateId,
            boundColumnName: record.boundColumnName,
            boundColumnValue: record.boundColumnValue,
            extraDisplayFields: record.extraDisplayFields || {},
            templateName: record.templateName,
          }))
        );
      }
      
      return reply.send({ success: true, inserted: records.length });
    } catch (error) {
      console.error(`Batch verification insert failed:`, error);
      return reply.status(500).send({ error: 'Failed to save verification records' });
    }
  });
}
