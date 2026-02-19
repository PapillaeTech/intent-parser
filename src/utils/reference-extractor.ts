import { REFERENCE_PATTERNS } from './recipient-patterns.js';

/**
 * Extracts reference (invoice ID, vendor ID, etc.) from input text
 */
export function extractReference(input: string): string | undefined {
  for (const pattern of REFERENCE_PATTERNS) {
    const match = input.match(pattern);
    if (match && match[2]) {
      return match[2];
    }
  }
  return undefined;
}
