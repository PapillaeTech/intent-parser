import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Health check endpoint handler
 */
export async function healthHandler(_request: FastifyRequest, _reply: FastifyReply) {
  return {
    status: 'ok',
    service: 'intent-parser',
    timestamp: new Date().toISOString(),
  };
}
