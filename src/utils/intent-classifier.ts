/**
 * Classifies the intent type from natural language input
 */

import type { IntentType } from '../types/intent-types.js';

// Pattern matching for different intent types
const INTENT_PATTERNS: Array<{ type: IntentType; patterns: RegExp[]; priority: number }> = [
  // Query Status patterns (high priority - check before payment)
  {
    type: 'query_status',
    priority: 10,
    patterns: [
      /\b(did|has|have|is|was|were)\s+(my\s+)?(payment|transaction|transfer|wire|pay)\s+(to|for)\s+/i,
      /\b(status|state|condition)\s+(of|for)\s+(my\s+)?(payment|transaction|transfer|wire|pay)/i,
      /\b(is|was|has|have)\s+(my\s+)?(payment|transaction|transfer|wire|pay)\s+(to|for)\s+.*\s+(done|complete|completed|finished|processed|successful|failed|pending|approved|rejected)/i,
      /\b(did|has|have)\s+(my\s+)?(payment|transaction|transfer|wire|pay)\s+(to|for)\s+.*\s+(go\s+through|succeed|fail|complete|finish|work|process)/i,
      /\b(check|verify|confirm|tell\s+me)\s+(the\s+)?(status|state)\s+(of|for)\s+(my\s+)?(payment|transaction|transfer|wire)/i,
      /\b(what|what's|what is)\s+(the\s+)?(status|state)\s+(of|for)\s+(my\s+)?(payment|transaction|transfer|wire)/i,
      /\b(is|was)\s+.*\s+(payment|transaction|transfer|wire)\s+(to|for)\s+.*\s+(done|complete|completed|finished|processed|successful|failed)/i,
      /\b(did|has|have)\s+.*\s+(payment|transaction|transfer|wire)\s+(to|for)\s+.*\s+(succeed|fail|complete|finish|go\s+through)/i,
      /\b(payment|transaction|transfer|wire)\s+(to|for)\s+.*\s+(status|state|condition)/i,
      /\b(is|was)\s+.*\s+(payment|transaction|transfer|wire)\s+(to|for)\s+.*\s+(successful|failed|pending|approved|rejected)/i,
    ],
  },
  
  // Query Transaction patterns
  {
    type: 'query_transaction',
    priority: 9,
    patterns: [
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(my\s+)?(last|latest|recent|first|oldest|previous|most\s+recent)\s+(transaction|payment|transfer|wire|pay)/i,
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(my\s+)?(transaction|payment|transfer|wire|pay)\s+(last|latest|recent|first|oldest|previous|most\s+recent)/i,
      /\b(what|what's|what is)\s+(my\s+)?(last|latest|recent|first|oldest|previous|most\s+recent)\s+(transaction|payment|transfer|wire|pay)/i,
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(the\s+)?(last|latest|recent|first|oldest)\s+\d+\s+(transaction|payment|transfer|wire)/i,
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(my\s+)?(transaction|payment|transfer|wire)\s+(from|on|in)\s+/i,
      /\b(last|latest|recent|first|oldest)\s+(transaction|payment|transfer|wire)/i,
      /\b(show|display|get|fetch|retrieve|see|view)\s+(me\s+)?(my\s+)?(most\s+recent|previous)\s+(transaction|payment|transfer|wire)/i,
    ],
  },
  
  // Query Balance patterns
  {
    type: 'query_balance',
    priority: 8,
    patterns: [
      /\b(show|display|get|fetch|retrieve|see|view|what|what's|what is)\s+(me\s+)?(my\s+)?(balance|account\s+balance|available\s+balance)/i,
      /\b(how\s+much)\s+(do\s+i\s+have|is\s+in\s+my\s+account|is\s+available)/i,
      /\b(what|what's|what is)\s+(my\s+)?(current\s+)?(balance|account\s+balance)/i,
      /\b(check|see|view)\s+(my\s+)?(balance|account\s+balance)/i,
    ],
  },
  
  // Query History patterns
  {
    type: 'query_history',
    priority: 7,
    patterns: [
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(my\s+)?(payment|transaction|transfer|wire|pay)\s+(history|record|records|log|logs|activity)/i,
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(my\s+)?(history|record|records|log|logs|activity)\s+(of\s+)?(payment|transaction|transfer|wire|pay)/i,
      /\b(what|what's|what is)\s+(my\s+)?(payment|transaction|transfer|wire|pay)\s+(history|record|records|log|logs|activity)/i,
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(payment|transaction|transfer|wire|pay)\s+(from|since|between|after|before)\s+/i,
      /\b(transaction|payment|transfer|wire)\s+(history|record|records|log|logs|activity)/i,
      /\b(past|previous|old)\s+(transaction|payment|transfer|wire)/i,
    ],
  },
  
  // Query Search patterns
  {
    type: 'query_search',
    priority: 6,
    patterns: [
      /\b(find|search|look\s+for|locate|find\s+me)\s+(my\s+)?(payment|transaction|transfer|wire|pay)\s+(to|for)\s+/i,
      /\b(find|search|look\s+for|locate|find\s+me)\s+(payment|transaction|transfer|wire|pay)\s+(to|for)\s+/i,
      /\b(search|find|look\s+for|locate)\s+(for\s+)?(payment|transaction|transfer|wire|pay)\s+/i,
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(payment|transaction|transfer|wire|pay)\s+(to|for)\s+/i,
      /\b(find|search|look\s+for|locate)\s+.*\s+(payment|transaction|transfer|wire|pay)\s+(to|for)\s+/i,
    ],
  },
  
  // Query List patterns (higher priority than history for "list" keyword)
  {
    type: 'query_list',
    priority: 6,
    patterns: [
      /\b(list|show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(all\s+)?(my\s+)?(transactions|payments|transfers|wires|pays)/i,
      /\b(list|show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(my\s+)?(recipients|contacts|accounts|people)/i,
      /\b(what|what's|what are)\s+(my\s+)?(transactions|payments|transfers|wires|pays)/i,
      /\b(show|display|get|fetch|retrieve|see|view|tell\s+me|give\s+me)\s+(me\s+)?(pending|completed|failed|successful|unsuccessful|processing)\s+(transactions|payments|transfers|wires)/i,
      /\b(all|every)\s+(my\s+)?(transactions|payments|transfers|wires)/i,
      /\b(list|show|display|get|fetch|retrieve|see|view)\s+(me\s+)?(my\s+)?(transactions|payments|transfers|wires)\s+(list|all)/i,
    ],
  },
  
  // Payment patterns (lower priority - catch-all for payment intents)
  {
    type: 'payment',
    priority: 1,
    patterns: [
      /\b(send|pay|transfer|wire|give|forward|dispatch|remit|send\s+money|pay\s+money)\s+/i,
      /\b(make|execute|process|initiate|create|do)\s+(a\s+)?(payment|transfer|wire|pay)/i,
      /\b(need\s+to\s+)?(send|pay|transfer|wire|give)\s+/i,
      /\b(want\s+to\s+)?(send|pay|transfer|wire|give)\s+/i,
    ],
  },
];

/**
 * Classifies the intent type from input text
 */
export function classifyIntent(input: string): IntentType {
  const normalizedInput = input.trim().toLowerCase();
  
  // Check patterns in priority order
  for (const { type, patterns, priority } of INTENT_PATTERNS.sort((a, b) => b.priority - a.priority)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedInput)) {
        return type;
      }
    }
  }
  
  // Default to payment if no match (backward compatibility)
  return 'payment';
}

/**
 * Gets the confidence score for intent classification
 */
export function getClassificationConfidence(input: string, intentType: IntentType): number {
  if (intentType === 'unknown') {
    return 0.1;
  }
  
  const matchingPatterns = INTENT_PATTERNS.find(p => p.type === intentType);
  if (!matchingPatterns) {
    return 0.5;
  }
  
  let matchCount = 0;
  for (const pattern of matchingPatterns.patterns) {
    if (pattern.test(input)) {
      matchCount++;
    }
  }
  
  // Higher confidence if multiple patterns match
  if (matchCount > 0) {
    return Math.min(0.95, 0.7 + (matchCount * 0.1));
  }
  
  return 0.7;
}
