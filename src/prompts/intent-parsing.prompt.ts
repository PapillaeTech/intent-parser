/**
 * Prompts for LLM-based intent parsing
 */

export const INTENT_PARSING_SYSTEM_PROMPT = `You are an expert at parsing natural language payment and transaction queries into structured JSON.

Your task is to analyze user input and extract structured information about:
1. Payment intents (sending money)
2. Transaction queries (showing transactions)
3. Status queries (checking payment status)
4. Balance queries
5. History queries
6. Search queries
7. List queries

Return ONLY valid JSON, no additional text or explanation.`;

export function getPaymentIntentPrompt(input: string, currentIntent: any): string {
  return `Parse this payment intent: "${input}"

Current parsed data (from pattern matching):
${JSON.stringify(currentIntent, null, 2)}

Extract and return a JSON object with these fields:
- amount: number or null
- currency: string (ISO code like USD, EUR) or null
- recipient: string or null
- destination_country: string (ISO country code) or null
- urgency: "standard" or "high"
- reference: string (invoice/transaction ID) or null

Fill in any missing fields. Return ONLY the JSON object, no markdown formatting.`;
}

export function getQueryIntentPrompt(input: string, intentType: string, currentIntent: any): string {
  return `Parse this ${intentType} query: "${input}"

Current parsed data (from pattern matching):
${JSON.stringify(currentIntent, null, 2)}

Extract and return a JSON object with relevant fields for this query type.
Fill in any missing fields based on the input.

Return ONLY the JSON object, no markdown formatting.`;
}

export function getEnhancementPrompt(input: string, currentIntent: any, missingFields: string[]): string {
  return `Enhance this parsed intent: "${input}"

Current parsed data:
${JSON.stringify(currentIntent, null, 2)}

Missing or unclear fields: ${missingFields.join(', ')}

Extract the missing fields from the input and return a JSON object with the complete data.
Return ONLY the JSON object, no markdown formatting.`;
}
