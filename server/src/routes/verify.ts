import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { certificates } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function verifyRoutes(fastify: FastifyInstance) {
  
  /**
   * GET /api/verify/:certificateId
   * Look up a certificate verification record.
   * Returns certificate details if found, 404 if not.
   */
  fastify.get('/api/verify/:certificateId', async (request, reply) => {
    const { certificateId } = request.params as { certificateId: string };
    
    if (!certificateId || certificateId.length < 8) {
      return reply.status(400).send({ error: 'Invalid certificate ID' });
    }
    
    try {
      const result = await db
        .select({
          certificateId: certificates.certificateId,
          boundColumnName: certificates.boundColumnName,
          boundColumnValue: certificates.boundColumnValue,
          extraDisplayFields: certificates.extraDisplayFields,
          templateName: certificates.templateName,
          generatedAt: certificates.generatedAt,
        })
        .from(certificates)
        .where(eq(certificates.certificateId, certificateId))
        .limit(1);
      
      if (result.length === 0) {
        return reply.status(404).send({
          verified: false,
          message: 'Certificate not found. This certificate ID does not exist in our records.',
        });
      }
      
      const cert = result[0];
      
      return reply.send({
        verified: true,
        certificate: {
          id: cert.certificateId,
          [cert.boundColumnName]: cert.boundColumnValue,
          ...(cert.extraDisplayFields as Record<string, string> || {}),
          templateName: cert.templateName,
          generatedAt: cert.generatedAt,
        },
      });
      
    } catch (error) {
      console.error(`Verification lookup failed for ${certificateId}:`, error);
      return reply.status(500).send({ error: 'Verification service temporarily unavailable' });
    }
  });
  
  /**
   * DELETE /api/verify/:certificateId
   * Delete a verification record (GDPR delete path).
   */
  fastify.delete('/api/verify/:certificateId', async (request, reply) => {
    const { certificateId } = request.params as { certificateId: string };
    
    try {
      const result = await db
        .delete(certificates)
        .where(eq(certificates.certificateId, certificateId))
        .returning({ id: certificates.id });
      
      if (result.length === 0) {
        return reply.status(404).send({ error: 'Certificate not found' });
      }
      
      return reply.send({ message: 'Verification record deleted successfully' });
      
    } catch (error) {
      console.error(`Delete failed for ${certificateId}:`, error);
      return reply.status(500).send({ error: 'Delete operation failed' });
    }
  });
}
