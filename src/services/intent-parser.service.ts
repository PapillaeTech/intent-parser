import type { PaymentIntent } from '../types/index.js';
import type { ParsedIntent, PaymentIntent as NewPaymentIntent, QueryTransactionIntent, QueryStatusIntent, QueryBalanceIntent, QueryHistoryIntent, QuerySearchIntent, QueryListIntent } from '../types/intent-types.js';
import { extractAmountAndCurrency } from '../utils/amount-extractor.js';
import { extractRecipient } from '../utils/recipient-extractor.js';
import { extractDestinationCountry } from '../utils/country-extractor.js';
import { extractUrgency } from '../utils/urgency-extractor.js';
import { extractReference } from '../utils/reference-extractor.js';
import { calculateConfidence } from '../utils/confidence-calculator.js';
import { getCorridor } from '../countries.js';
import { getConfig } from '../config/app.config.js';
import { classifyIntent, getClassificationConfidence } from '../utils/intent-classifier.js';
import { 
  extractTransactionQuery, 
  extractStatusQuery, 
  extractBalanceQuery, 
  extractHistoryQuery, 
  extractSearchQuery, 
  extractListQuery 
} from '../utils/query-extractors.js';

/**
 * Main service for parsing intents from natural language
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
   * Parses natural language input into a structured intent (supports multiple intent types)
   */
  public parse(input: string): ParsedIntent {
    // Validate input
    const normalizedInput = input.trim();
    if (!normalizedInput) {
      throw new Error('Input cannot be empty');
    }

    this.validateInput(normalizedInput);

    // Classify intent type
    const intentType = classifyIntent(normalizedInput);
    const baseConfidence = getClassificationConfidence(normalizedInput, intentType);

    // Parse based on intent type
    switch (intentType) {
      case 'payment':
        return this.parsePaymentIntent(normalizedInput, baseConfidence);
      case 'query_transaction':
        return this.parseTransactionQuery(normalizedInput, baseConfidence);
      case 'query_status':
        return this.parseStatusQuery(normalizedInput, baseConfidence);
      case 'query_balance':
        return this.parseBalanceQuery(normalizedInput, baseConfidence);
      case 'query_history':
        return this.parseHistoryQuery(normalizedInput, baseConfidence);
      case 'query_search':
        return this.parseSearchQuery(normalizedInput, baseConfidence);
      case 'query_list':
        return this.parseListQuery(normalizedInput, baseConfidence);
      default:
        // Fallback to payment intent for backward compatibility
        return this.parsePaymentIntent(normalizedInput, 0.5);
    }
  }

  /**
   * Parses payment intent (backward compatibility method)
   */
  public parseIntent(input: string): PaymentIntent {
    const parsed = this.parse(input);
    if (parsed.type !== 'payment') {
      // Convert to old PaymentIntent format for backward compatibility
      return {
        amount: null,
        currency: null,
        recipient: null,
        destination_country: null,
        corridor: null,
        urgency: 'standard',
        confidence: parsed.confidence,
      };
    }
    
    // Convert new format to old format
    const newPayment = parsed as NewPaymentIntent;
    const result: PaymentIntent = {
      amount: newPayment.amount,
      currency: newPayment.currency,
      recipient: newPayment.recipient,
      destination_country: newPayment.destination_country,
      corridor: newPayment.corridor,
      urgency: newPayment.urgency,
      confidence: newPayment.confidence,
    };
    
    // Only include optional properties if they're defined (not undefined)
    if (newPayment.reference !== undefined) {
      result.reference = newPayment.reference;
    }
    if (newPayment.missing_fields !== undefined) {
      result.missing_fields = newPayment.missing_fields;
    }
    if (newPayment.clarification_needed !== undefined) {
      result.clarification_needed = newPayment.clarification_needed;
    }
    
    return result;
  }

  /**
   * Parses payment intent
   */
  private parsePaymentIntent(input: string, baseConfidence: number): NewPaymentIntent {
    // Extract all fields
    const { amount, currency } = extractAmountAndCurrency(input);
    const recipient = extractRecipient(input);
    const destination_country = extractDestinationCountry(input);
    const corridor = getCorridor(currency, destination_country);
    const urgency = extractUrgency(input);
    const reference = extractReference(input);

    // Calculate confidence
    const { confidence, missing_fields, clarification_needed } = calculateConfidence({
      amount,
      currency,
      recipient,
      destination_country,
      corridor,
    });

    // Build intent
    const intent: NewPaymentIntent = {
      type: 'payment',
      amount,
      currency,
      recipient,
      destination_country,
      corridor,
      urgency,
      confidence: Math.max(baseConfidence, confidence),
      raw_input: input,
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

  /**
   * Parses transaction query intent
   */
  private parseTransactionQuery(input: string, baseConfidence: number): QueryTransactionIntent {
    const extracted = extractTransactionQuery(input);
    
    const result: QueryTransactionIntent = {
      type: 'query_transaction',
      confidence: baseConfidence,
      raw_input: input,
    };
    
    if (extracted.transaction_type !== undefined) {
      result.transaction_type = extracted.transaction_type;
    }
    if (extracted.count !== undefined) {
      result.count = extracted.count;
    }
    if (extracted.date_range !== undefined) {
      result.date_range = extracted.date_range;
    }
    if (extracted.filters !== undefined) {
      result.filters = extracted.filters;
    }
    
    return result;
  }

  /**
   * Parses status query intent
   */
  private parseStatusQuery(input: string, baseConfidence: number): QueryStatusIntent {
    const extracted = extractStatusQuery(input);
    
    // Increase confidence if we found recipient, reference, or transaction_id
    let confidence = baseConfidence;
    if (extracted.recipient || extracted.reference || extracted.transaction_id || extracted.payment_id) {
      confidence = Math.min(0.95, baseConfidence + 0.2);
    }
    
    const result: QueryStatusIntent = {
      type: 'query_status',
      confidence,
      raw_input: input,
    };
    
    if (extracted.recipient !== undefined) {
      result.recipient = extracted.recipient;
    }
    if (extracted.reference !== undefined) {
      result.reference = extracted.reference;
    }
    if (extracted.transaction_id !== undefined) {
      result.transaction_id = extracted.transaction_id;
    }
    if (extracted.payment_id !== undefined) {
      result.payment_id = extracted.payment_id;
    }
    if (extracted.date !== undefined) {
      result.date = extracted.date;
    }
    
    return result;
  }

  /**
   * Parses balance query intent
   */
  private parseBalanceQuery(input: string, baseConfidence: number): QueryBalanceIntent {
    const extracted = extractBalanceQuery(input);
    
    const result: QueryBalanceIntent = {
      type: 'query_balance',
      confidence: baseConfidence,
      raw_input: input,
    };
    
    if (extracted.currency !== undefined) {
      result.currency = extracted.currency;
    }
    if (extracted.account_type !== undefined) {
      result.account_type = extracted.account_type;
    }
    
    return result;
  }

  /**
   * Parses history query intent
   */
  private parseHistoryQuery(input: string, baseConfidence: number): QueryHistoryIntent {
    const extracted = extractHistoryQuery(input);
    
    const result: QueryHistoryIntent = {
      type: 'query_history',
      confidence: baseConfidence,
      raw_input: input,
    };
    
    if (extracted.date_range !== undefined) {
      result.date_range = extracted.date_range;
    }
    if (extracted.filters !== undefined) {
      result.filters = extracted.filters;
    }
    if (extracted.limit !== undefined) {
      result.limit = extracted.limit;
    }
    
    return result;
  }

  /**
   * Parses search query intent
   */
  private parseSearchQuery(input: string, baseConfidence: number): QuerySearchIntent {
    const extracted = extractSearchQuery(input);
    
    // Increase confidence if we found a search term
    let confidence = baseConfidence;
    if (extracted.search_term && extracted.search_term !== 'all') {
      confidence = Math.min(0.95, baseConfidence + 0.15);
    }
    
    const result: QuerySearchIntent = {
      type: 'query_search',
      confidence,
      raw_input: input,
      search_term: extracted.search_term,
    };
    
    if (extracted.filters !== undefined) {
      result.filters = extracted.filters;
    }
    
    return result;
  }

  /**
   * Parses list query intent
   */
  private parseListQuery(input: string, baseConfidence: number): QueryListIntent {
    const extracted = extractListQuery(input);
    
    const result: QueryListIntent = {
      type: 'query_list',
      confidence: baseConfidence,
      raw_input: input,
      entity_type: extracted.entity_type,
    };
    
    if (extracted.filters !== undefined) {
      result.filters = extracted.filters;
    }
    if (extracted.limit !== undefined) {
      result.limit = extracted.limit;
    }
    
    return result;
  }
}

// Export singleton instance
export const intentParserService = new IntentParserService();
