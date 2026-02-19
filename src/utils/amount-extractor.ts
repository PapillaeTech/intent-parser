import { CURRENCY_PATTERNS } from './currency-patterns.js';
import { getConfig } from '../config/app.config.js';

export interface AmountCurrencyResult {
  amount: number | null;
  currency: string | null;
}

/**
 * Extracts amount and currency from input text
 */
export function extractAmountAndCurrency(input: string): AmountCurrencyResult {
  let amount: number | null = null;
  let currency: string | null = null;

  // Try to find currency first
  for (const [curr, pattern] of Object.entries(CURRENCY_PATTERNS)) {
    if (pattern.test(input)) {
      currency = curr;
      break;
    }
  }

  // Extract amount - look for numbers
  // Pattern: $500, 500, 500.50, 1000, etc.
  const amountPatterns = [
    /\$?\s*(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:usd|dollar|dollars)?/i,
    /(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:eur|euro|euros|€)/i,
    /(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:usdc|usd coin)/i,
    /(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:gbp|pound|pounds|£)/i,
    /(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:php|peso|pesos)/i,
    /(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:mad|dirham|dirhams)/i,
    /(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(?:ngn|naira)/i,
  ];

  let bestMatch: { amount: number; currency: string | null; context: string } | null = null;

  for (const pattern of amountPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const amountStr = match[1].replace(/[,\s]/g, '');
      const parsed = parseFloat(amountStr);
      if (!isNaN(parsed) && parsed > 0) {
        const context = match[0].toLowerCase();
        let inferredCurrency: string | null = null;

        if (context.includes('$') || context.includes('dollar')) {
          inferredCurrency = 'USD';
        } else if (context.includes('€') || context.includes('euro')) {
          inferredCurrency = 'EUR';
        } else if (context.includes('£') || context.includes('pound')) {
          inferredCurrency = 'GBP';
        } else if (context.includes('usdc')) {
          inferredCurrency = 'USDC';
        }

        // Keep the largest amount found
        if (!bestMatch || parsed > bestMatch.amount) {
          bestMatch = { amount: parsed, currency: inferredCurrency, context };
        }
      }
    }
  }

  // If no currency-specific match found, try generic number pattern
  if (!bestMatch) {
    const genericPattern = /\b(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\b/;
    const allMatches = input.matchAll(new RegExp(genericPattern, 'g'));
    let maxAmount = 0;
    for (const match of allMatches) {
      if (!match[1]) continue;
      const amountStr = match[1].replace(/[,\s]/g, '');
      const parsed = parseFloat(amountStr);
      if (!isNaN(parsed) && parsed > maxAmount) {
        maxAmount = parsed;
      }
    }
    if (maxAmount > 0) {
      bestMatch = { amount: maxAmount, currency: null, context: '' };
    }
  }

  if (bestMatch) {
    amount = bestMatch.amount;
    if (!currency && bestMatch.currency) {
      currency = bestMatch.currency;
    }
  }

  // Default currency inference: if amount found but no currency, use default from config
  if (amount && !currency) {
    // Check if there's a $ symbol anywhere
    if (input.includes('$')) {
      currency = 'USD';
    } else {
      // Use default from config (with fallback)
      try {
        currency = getConfig().DEFAULT_CURRENCY;
      } catch {
        currency = 'USD'; // Fallback if config not loaded
      }
    }
  }

  return { amount, currency };
}
