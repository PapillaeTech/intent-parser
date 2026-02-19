export type Currency = 'USD' | 'EUR' | 'USDC' | 'GBP' | 'PHP' | 'MAD' | 'NGN' | string;

export type Urgency = 'standard' | 'high';

export interface PaymentIntent {
  amount: number | null;
  currency: Currency | null;
  recipient: string | null;
  destination_country: string | null;
  corridor: string | null;
  urgency: Urgency;
  confidence: number;
  reference?: string;
  missing_fields?: string[];
  clarification_needed?: string;
}

export interface ParseRequest {
  input: string;
}

export interface ParseResponse {
  success: boolean;
  intent: PaymentIntent;
  raw_input: string;
  parsed_at: string;
}

export interface ExtractedFields {
  amount: number | null;
  currency: string | null;
  recipient: string | null;
  destination_country: string | null;
  corridor: string | null;
}
