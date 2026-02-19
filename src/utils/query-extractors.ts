/**
 * Extractors for query intents
 */

import { extractRecipient } from './recipient-extractor.js';
import { extractAmountAndCurrency } from './amount-extractor.js';
import { extractReference } from './reference-extractor.js';

/**
 * Extracts transaction query intent details
 */
export function extractTransactionQuery(input: string) {
  const normalizedInput = input.toLowerCase();
  
  // Extract transaction type (last, recent, latest, first, oldest)
  let transaction_type: 'last' | 'recent' | 'latest' | 'first' | 'oldest' | undefined;
  if (/\b(last|latest|recent)\b/.test(normalizedInput)) {
    transaction_type = /\blast\b/.test(normalizedInput) ? 'last' : 
                      /\blatest\b/.test(normalizedInput) ? 'latest' : 'recent';
  } else if (/\b(first|oldest)\b/.test(normalizedInput)) {
    transaction_type = /\bfirst\b/.test(normalizedInput) ? 'first' : 'oldest';
  }
  
  // Extract count (e.g., "last 5 transactions")
  const countMatch = input.match(/\b(last|latest|recent|first|oldest)\s+(\d+)/i);
  const count = countMatch && countMatch[2] ? parseInt(countMatch[2], 10) : undefined;
  
  // Extract date range
  const dateRange = extractDateRange(input);
  
  // Extract filters
  const recipient = extractRecipient(input);
  const { amount } = extractAmountAndCurrency(input);
  const { currency } = extractAmountAndCurrency(input);
  
  const filters: any = {};
  if (recipient) filters.recipient = recipient;
  if (amount) filters.amount = amount;
  if (currency) filters.currency = currency;
  
  return {
    transaction_type,
    count,
    date_range: dateRange,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };
}

/**
 * Extracts status query intent details
 */
export function extractStatusQuery(input: string) {
  const recipient = extractRecipient(input);
  const reference = extractReference(input);
  
  // Extract transaction/payment ID (more specific patterns to avoid false matches)
  const transactionIdMatch = input.match(/\b(transaction|transfer|wire)[\s\-_]?(id|number|#|no\.?)[\s\-:]?\s*([A-Z0-9\-]{3,})/i);
  const transaction_id = transactionIdMatch ? transactionIdMatch[3] : undefined;
  
  const paymentIdMatch = input.match(/\b(payment|pay)[\s\-_]?(id|number|#|no\.?)[\s\-:]?\s*([A-Z0-9\-]{3,})/i);
  const payment_id = paymentIdMatch ? paymentIdMatch[3] : undefined;
  
  // Also try patterns like "transaction 12345" or "payment #ABC123"
  if (!transaction_id && !payment_id) {
    const simpleIdMatch = input.match(/\b(transaction|payment|transfer|wire)\s+([A-Z0-9\-]{3,})/i);
    if (simpleIdMatch && simpleIdMatch[1] && simpleIdMatch[2] && simpleIdMatch[2].toLowerCase() !== 'to' && simpleIdMatch[2].toLowerCase() !== 'for') {
      if (simpleIdMatch[1].toLowerCase().includes('payment')) {
        return {
          recipient: recipient || undefined,
          reference: reference || undefined,
          payment_id: simpleIdMatch[2],
          date: extractDate(input) || undefined,
        };
      } else {
        return {
          recipient: recipient || undefined,
          reference: reference || undefined,
          transaction_id: simpleIdMatch[2],
          date: extractDate(input) || undefined,
        };
      }
    }
  }
  
  // Extract date
  const date = extractDate(input);
  
  return {
    recipient: recipient || undefined,
    reference: reference || undefined,
    transaction_id: transaction_id || undefined,
    payment_id: payment_id || undefined,
    date: date || undefined,
  };
}

/**
 * Extracts balance query intent details
 */
export function extractBalanceQuery(input: string) {
  const { currency } = extractAmountAndCurrency(input);
  
  // Extract account type
  const accountTypeMatch = input.match(/\b(savings|checking|current|business|personal)\s+account/i);
  const account_type = accountTypeMatch ? accountTypeMatch[1] : undefined;
  
  return {
    currency: currency || undefined,
    account_type: account_type || undefined,
  };
}

/**
 * Extracts history query intent details
 */
export function extractHistoryQuery(input: string) {
  const dateRange = extractDateRange(input);
  
  // Extract limit
  const limitMatch = input.match(/\b(last|latest|recent)\s+(\d+)/i);
  const limit = limitMatch && limitMatch[2] ? parseInt(limitMatch[2], 10) : undefined;
  
  // Extract filters
  const recipient = extractRecipient(input);
  const { amount } = extractAmountAndCurrency(input);
  const { currency } = extractAmountAndCurrency(input);
  
  // Extract status
  let status: string | undefined;
  if (/\b(pending|processing|in\s+progress)\b/i.test(input)) {
    status = 'pending';
  } else if (/\b(completed|done|finished|successful|success)\b/i.test(input)) {
    status = 'completed';
  } else if (/\b(failed|error|unsuccessful)\b/i.test(input)) {
    status = 'failed';
  }
  
  const filters: any = {};
  if (recipient) filters.recipient = recipient;
  if (amount) filters.amount = amount;
  if (currency) filters.currency = currency;
  if (status) filters.status = status;
  
  return {
    date_range: dateRange,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    limit: limit || undefined,
  };
}

/**
 * Extracts search query intent details
 */
export function extractSearchQuery(input: string) {
  // Extract search term (usually recipient or reference)
  const recipient = extractRecipient(input);
  const reference = extractReference(input);
  
  // Use recipient or reference as search term
  let search_term = recipient || reference || '';
  
  // If no recipient/reference, try to extract any meaningful term
  if (!search_term) {
    const searchMatch = input.match(/\b(find|search|look\s+for|locate)\s+(payment|transaction|transfer|wire)\s+(to|for)\s+(.+?)(?:\s|$)/i);
    if (searchMatch && searchMatch[4]) {
      search_term = searchMatch[4].trim();
    }
  }
  
  // Extract filters
  const { amount } = extractAmountAndCurrency(input);
  const { currency } = extractAmountAndCurrency(input);
  const date = extractDate(input);
  
  const filters: any = {};
  if (amount) filters.amount = amount;
  if (currency) filters.currency = currency;
  if (date) filters.date = date;
  
  return {
    search_term: search_term || 'all',
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };
}

/**
 * Extracts list query intent details
 */
export function extractListQuery(input: string) {
  const normalizedInput = input.toLowerCase();
  
  // Determine entity type
  let entity_type: 'transactions' | 'payments' | 'recipients' | 'accounts' = 'transactions';
  if (/\b(recipient|contact|person|people)\b/.test(normalizedInput)) {
    entity_type = 'recipients';
  } else if (/\b(account|accounts)\b/.test(normalizedInput)) {
    entity_type = 'accounts';
  } else if (/\b(payment|payments)\b/.test(normalizedInput)) {
    entity_type = 'payments';
  } else {
    entity_type = 'transactions';
  }
  
  // Extract limit
  const limitMatch = input.match(/\b(last|latest|recent|first)\s+(\d+)/i);
  const limit = limitMatch && limitMatch[2] ? parseInt(limitMatch[2], 10) : undefined;
  
  // Extract filters
  let status: string | undefined;
  if (/\b(pending|processing|in\s+progress)\b/i.test(input)) {
    status = 'pending';
  } else if (/\b(completed|done|finished|successful|success)\b/i.test(input)) {
    status = 'completed';
  } else if (/\b(failed|error|unsuccessful)\b/i.test(input)) {
    status = 'failed';
  }
  
  const { currency } = extractAmountAndCurrency(input);
  const date = extractDate(input);
  
  const filters: any = {};
  if (status) filters.status = status;
  if (currency) filters.currency = currency;
  if (date) filters.date = date;
  
  return {
    entity_type,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    limit: limit || undefined,
  };
}

/**
 * Helper: Extracts date range from input
 */
function extractDateRange(input: string): { start?: string; end?: string } | undefined {
  // Patterns: "from X to Y", "between X and Y", "since X", "after X", "before Y"
  const fromToMatch = input.match(/\b(from|since|after)\s+([A-Za-z0-9\s,]+?)\s+(to|until|before|and)\s+([A-Za-z0-9\s,]+)/i);
  if (fromToMatch && fromToMatch[2] && fromToMatch[4]) {
    return {
      start: fromToMatch[2].trim(),
      end: fromToMatch[4].trim(),
    };
  }
  
  const sinceMatch = input.match(/\b(since|from|after)\s+([A-Za-z0-9\s,]+)/i);
  if (sinceMatch && sinceMatch[2]) {
    return {
      start: sinceMatch[2].trim(),
    };
  }
  
  const beforeMatch = input.match(/\b(before|until)\s+([A-Za-z0-9\s,]+)/i);
  if (beforeMatch && beforeMatch[2]) {
    return {
      end: beforeMatch[2].trim(),
    };
  }
  
  // Try to extract dates like "last week", "this month", etc.
  const lastWeekMatch = input.match(/\b(last|past)\s+(week|month|year|30\s+days|7\s+days)/i);
  if (lastWeekMatch) {
    return {
      start: lastWeekMatch[0],
    };
  }
  
  return undefined;
}

/**
 * Helper: Extracts single date from input
 */
function extractDate(input: string): string | undefined {
  // Try various date patterns
  const datePatterns = [
    /\b(on|at|for)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i, // "on January 15, 2024"
    /\b(on|at|for)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, // "on 01/15/2024"
    /\b(on|at|for)\s+([A-Za-z]+\s+\d{1,2})/i, // "on January 15"
    /\b(today|yesterday|tomorrow)\b/i,
    /\b(last|this|next)\s+(week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      return match[2] || match[1] || match[0];
    }
  }
  
  return undefined;
}
