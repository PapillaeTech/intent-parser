// Legacy function wrapper for backward compatibility
import { intentParserService } from './services/intent-parser.service.js';
import type { PaymentIntent, ParsedIntent } from './types/index.js';

/**
 * Legacy function - parses input and returns PaymentIntent (backward compatible)
 */
export function parseIntent(input: string): PaymentIntent {
  return intentParserService.parseIntent(input);
}

/**
 * New function - parses input and returns ParsedIntent (supports all intent types)
 * Uses async LLM enhancement when available
 */
export async function parse(input: string): Promise<ParsedIntent> {
  return intentParserService.parse(input);
}

/**
 * Synchronous version - parses without LLM enhancement
 */
export function parseSync(input: string): ParsedIntent {
  return intentParserService.parseSync(input);
}

// Re-export for convenience
export { intentParserService, IntentParserService } from './services/intent-parser.service.js';
