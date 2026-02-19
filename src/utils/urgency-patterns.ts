import type { Urgency } from '../types/index.js';

// Urgency keywords
export const URGENCY_KEYWORDS: Record<Urgency, RegExp> = {
  high: /\b(urgent|asap|as soon as possible|immediately|right now|now|emergency|critical)\b/i,
  standard: /\b(standard|normal|regular|whenever|eventually)\b/i,
};
