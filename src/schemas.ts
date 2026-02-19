import { z } from 'zod';

export const ParseRequestSchema = z.object({
  input: z.string().min(1, 'Input cannot be empty'),
});

export const ParseResponseSchema = z.object({
  success: z.boolean(),
  intent: z.object({
    amount: z.number().nullable(),
    currency: z.string().nullable(),
    recipient: z.string().nullable(),
    destination_country: z.string().nullable(),
    corridor: z.string().nullable(),
    urgency: z.enum(['standard', 'high']),
    confidence: z.number().min(0).max(1),
    reference: z.string().optional(),
    missing_fields: z.array(z.string()).optional(),
    clarification_needed: z.string().optional(),
  }),
  raw_input: z.string(),
  parsed_at: z.string(),
});
