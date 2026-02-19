// Legacy function wrapper for backward compatibility
import { intentParserService } from './services/intent-parser.service.js';
import type { PaymentIntent } from './types/index.js';

export function parseIntent(input: string): PaymentIntent {
  return intentParserService.parseIntent(input);
}

// Re-export for convenience
export { intentParserService, IntentParserService } from './services/intent-parser.service.js';
