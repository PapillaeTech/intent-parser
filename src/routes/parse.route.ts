import type { FastifyRequest, FastifyReply } from 'fastify';
import { intentParserService } from '../services/intent-parser.service.js';
import { ParseRequestSchema, ParseResponseSchema } from '../schemas.js';
import type { ParseRequest, ParseResponse } from '../types/index.js';

/**
 * Parse endpoint handler
 */
export async function parseHandler(
  request: FastifyRequest<{ Body: ParseRequest }>,
  reply: FastifyReply
): Promise<ParseResponse> {
  // Validate request body
  const validationResult = ParseRequestSchema.safeParse(request.body);
  if (!validationResult.success) {
    return reply.status(400).send({
      success: false,
      error: 'Invalid request',
      details: validationResult.error.issues,
    } as any);
  }

  const { input } = validationResult.data;

  try {
    // Parse the intent
    const intent = intentParserService.parseIntent(input);

    // Build response
    const response: ParseResponse = {
      success: true,
      intent,
      raw_input: input,
      parsed_at: new Date().toISOString(),
    };

    // Validate response (for development/debugging)
    const responseValidation = ParseResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      request.log.warn({ error: responseValidation.error }, 'Response validation failed');
    }

    return reply.status(200).send(response);
  } catch (error) {
    request.log.error({ error }, 'Error parsing intent');
    
    if (error instanceof Error && error.message.includes('exceeds maximum length')) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid request',
        message: error.message,
      } as any);
    }

    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as any);
  }
}
