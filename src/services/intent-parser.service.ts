import type { PaymentIntent } from '../types/index.js';
import { extractAmountAndCurrency } from '../utils/amount-extractor.js';
import { extractRecipient } from '../utils/recipient-extractor.js';
import { extractDestinationCountry } from '../utils/country-extractor.js';
import { extractUrgency } from '../utils/urgency-extractor.js';
import { extractReference } from '../utils/reference-extractor.js';
import { calculateConfidence } from '../utils/confidence-calculator.js';
import { getCorridor } from '../countries.js';
import { getConfig } from '../config/app.config.js';

/**
 * Main service for parsing payment intents from natural language
 */
export class IntentParserService {
  /**
   * Validates input length
   */
  private validateInput(input: string): void {
    let maxLength = 1000; // Default fallback
    try {
      maxLength = getConfig().MAX_INPUT_LENGTH;
    } catch {
      // Config not loaded, use default
    }
    if (input.length > maxLength) {
      throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
    }
  }

  /**
   * Parses natural language input into a structured payment intent
   */
  public parseIntent(input: string): PaymentIntent {
    // Validate input
    const normalizedInput = input.trim();
    if (!normalizedInput) {
      throw new Error('Input cannot be empty');
    }

    this.validateInput(normalizedInput);

    // Extract all fields
    const { amount, currency } = extractAmountAndCurrency(normalizedInput);
    const recipient = extractRecipient(normalizedInput);
    const destination_country = extractDestinationCountry(normalizedInput);
    const corridor = getCorridor(currency, destination_country);
    const urgency = extractUrgency(normalizedInput);
    const reference = extractReference(normalizedInput);

    // Calculate confidence
    const { confidence, missing_fields, clarification_needed } = calculateConfidence({
      amount,
      currency,
      recipient,
      destination_country,
      corridor,
    });

    // Build intent
    const intent: PaymentIntent = {
      amount,
      currency,
      recipient,
      destination_country,
      corridor,
      urgency,
      confidence,
    };

    if (reference) {
      intent.reference = reference;
    }

    if (missing_fields && missing_fields.length > 0) {
      intent.missing_fields = missing_fields;
    }

    if (clarification_needed) {
      intent.clarification_needed = clarification_needed;
    }

    return intent;
  }
}

// Export singleton instance
export const intentParserService = new IntentParserService();
