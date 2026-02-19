import { RELATIONSHIP_KEYWORDS } from './recipient-patterns.js';

/**
 * Extracts recipient from input text
 */
export function extractRecipient(input: string): string | null {
  // Look for vendor_id patterns
  const vendorIdMatch = input.match(/\b(vendor_id|vendor)[\s\-:]?\s*([A-Z0-9\-:]+)/i);
  if (vendorIdMatch) {
    return vendorIdMatch[2];
  }

  // Look for relationship keywords
  const relationshipMatch = input.match(RELATIONSHIP_KEYWORDS);
  if (relationshipMatch) {
    return relationshipMatch[0].trim();
  }

  // Look for "to [Name]" pattern
  const toPattern = /\b(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
  const toMatch = input.match(toPattern);
  if (toMatch) {
    return toMatch[1];
  }

  // Look for capitalized names (simple heuristic)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
  const nameMatches = input.matchAll(namePattern);
  const names: string[] = [];
  const skipWords = ['Send', 'Pay', 'Transfer', 'Wire', 'Give', 'Manila', 'Morocco', 'Nigeria', 'Philippines'];
  
  for (const match of nameMatches) {
    const name = match[1];
    // Skip common words that might be capitalized
    if (!skipWords.includes(name)) {
      names.push(name);
    }
  }

  if (names.length > 0) {
    return names[0];
  }

  // Fallback: look for any word after "to" or "for"
  const fallbackMatch = input.match(/\b(?:to|for)\s+(\w+)/i);
  if (fallbackMatch) {
    return fallbackMatch[1];
  }

  return null;
}
