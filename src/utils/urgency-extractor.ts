import type { Urgency } from '../types/index.js';
import { URGENCY_KEYWORDS } from './urgency-patterns.js';
import { getConfig } from '../config/app.config.js';

/**
 * Extracts urgency level from input text
 */
export function extractUrgency(input: string): Urgency {
  if (URGENCY_KEYWORDS.high.test(input)) {
    return 'high';
  }
  try {
    return getConfig().DEFAULT_URGENCY;
  } catch {
    return 'standard'; // Fallback if config not loaded
  }
}
