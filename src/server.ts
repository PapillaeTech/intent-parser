import Fastify from 'fastify';
import { loadConfig, getConfig } from './config/app.config.js';
import { parseHandler } from './routes/parse.route.js';
import { healthHandler } from './routes/health.route.js';

// Ensure config is loaded before creating Fastify instance
loadConfig();

const fastify = Fastify({
  logger: {
    level: getConfig().LOG_LEVEL,
  },
});

// Register routes
fastify.get('/health', healthHandler);
fastify.post('/parse', {
  schema: {
    body: {
      type: 'object',
      required: ['input'],
      properties: {
        input: { type: 'string', minLength: 1 },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          intent: {
            type: 'object',
            properties: {
              amount: { type: ['number', 'null'] },
              currency: { type: ['string', 'null'] },
              recipient: { type: ['string', 'null'] },
              destination_country: { type: ['string', 'null'] },
              corridor: { type: ['string', 'null'] },
              urgency: { type: 'string', enum: ['standard', 'high'] },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              reference: { type: 'string' },
              missing_fields: { type: 'array', items: { type: 'string' } },
              clarification_needed: { type: 'string' },
            },
          },
          raw_input: { type: 'string' },
          parsed_at: { type: 'string' },
        },
      },
    },
  },
}, parseHandler);

export async function startServer(): Promise<void> {
  try {
    const config = getConfig();
    await fastify.listen({ port: config.PORT, host: config.HOST });
    fastify.log.info(`Intent parser server listening on ${config.HOST}:${config.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

export { fastify };
