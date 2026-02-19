import type { ExtractedFields } from '../types/index.js';

export interface ConfidenceResult {
  confidence: number;
  missing_fields: string[];
  clarification_needed?: string;
}

/**
 * Calculates confidence score based on extracted fields
 */
export function calculateConfidence(fields: ExtractedFields): ConfidenceResult {
  const missing_fields: string[] = [];

  let score = 0;
  const fieldWeights = {
    amount: 0.25,
    currency: 0.25,
    recipient: 0.25,
    destination_country: 0.25,
  };

  if (fields.amount !== null) {
    score += fieldWeights.amount;
  } else {
    missing_fields.push('amount');
  }

  if (fields.currency !== null) {
    score += fieldWeights.currency;
  } else {
    missing_fields.push('currency');
  }

  if (fields.recipient !== null) {
    score += fieldWeights.recipient;
  } else {
    missing_fields.push('recipient');
  }

  if (fields.destination_country !== null) {
    score += fieldWeights.destination_country;
  } else {
    missing_fields.push('destination_country');
  }

  // Bonus for corridor
  if (fields.corridor !== null) {
    score += 0.05; // Small bonus, but cap at 1.0
  }

  // Cap at 1.0
  score = Math.min(score, 1.0);

  // Round to 2 decimal places
  score = Math.round(score * 100) / 100;

  let clarification_needed: string | undefined;
  if (score < 0.6) {
    if (missing_fields.includes('amount') && missing_fields.includes('currency')) {
      clarification_needed = 'How much would you like to send and in what currency?';
    } else if (missing_fields.includes('amount')) {
      clarification_needed = 'How much would you like to send?';
    } else if (missing_fields.includes('currency')) {
      clarification_needed = 'What currency would you like to use?';
    } else if (missing_fields.includes('destination_country')) {
      clarification_needed = `Where is ${fields.recipient || 'the recipient'} located?`;
    } else if (missing_fields.includes('recipient')) {
      clarification_needed = 'Who would you like to send money to?';
    } else {
      clarification_needed = `How much would you like to send and where is ${fields.recipient || 'the recipient'} located?`;
    }
  }

  const result: ConfidenceResult = {
    confidence: score,
    missing_fields: missing_fields.length > 0 ? missing_fields : [],
  };
  
  if (clarification_needed) {
    result.clarification_needed = clarification_needed;
  }
  
  return result;
}
