// Relationship keywords that might indicate recipient
export const RELATIONSHIP_KEYWORDS = /\b(my\s+)?(sister|brother|mother|father|mom|dad|parent|parents|friend|friends|contractor|contractors|vendor|vendors|employee|employees|colleague|colleagues|client|clients|customer|customers|partner|partners|associate|associates|relative|relatives|family|families)\b/i;

// Invoice/reference patterns
export const REFERENCE_PATTERNS = [
  /\b(invoice|inv)[\s\-:]?\s*([A-Z0-9\-]+)/i,
  /\b(ref|reference)[\s\-:]?\s*([A-Z0-9\-]+)/i,
  /\b(id|identifier)[\s\-:]?\s*([A-Z0-9\-]+)/i,
  /\b(vendor_id|vendor)[\s\-:]?\s*([A-Z0-9\-:]+)/i,
];
